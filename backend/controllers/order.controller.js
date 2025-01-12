import { createMidtransTransaction } from "../utils/midtrans/paymentService.js";
import Order from "../models/order.model.js";

// Create Order Controller
export const createMidtransOrder = async (req, res) => {
  try {
    const { duration, tenant, kostId, startDate, ownerId, amount } = req.body;
    const userId = req.user.id;

    const startDateObj = new Date(startDate);
    const endDate = new Date(startDateObj);
    endDate.setMonth(endDate.getMonth() + duration);

    // Create new order with pending status
    const order = new Order({
      tenant: {
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        identityNumber: tenant.identityNumber,
        identityImage: tenant.identityImage || "",
        occupation: tenant.occupation || "",
        emergencyContact: {
          name: tenant.emergencyContact?.name || "",
          phone: tenant.emergencyContact?.phone || "",
          relationship: tenant.emergencyContact?.relationship || "",
        },
      },
      kostId,
      duration,
      startDate: startDateObj,
      endDate,
      userId,
      ownerId,
      payment: {
        method: "midtrans",
        status: "pending",
        amount,
      },
      orderStatus: "pending",
    });

    // Generate Midtrans transaction
    const transaction = await createMidtransTransaction(order);

    // Add Midtrans details to the order
    order.payment.midtrans = {
      // transactionId: transaction.transaction_id,
      paymentToken: transaction.token,
      paymentUrl: transaction.redirect_url,
    };

    await order.save();

    console.log(transaction);

    res.status(201).json({
      success: true,
      order,
      paymentToken: transaction.token,
      paymentUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Cash Order
export const createCashOrder = async (req, res) => {
  try {
    const { duration, tenant, kostId, startDate, ownerId, amount } = req.body;
    const userId = req.user.id; // Get userId from authenticated user

    // Validate required fields based on schema
    if (
      !tenant?.name ||
      !tenant?.email ||
      !tenant?.phone ||
      !tenant?.identityNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete tenant information",
      });
    }

    // Calculate endDate based on duration
    const startDateObj = new Date(startDate);
    const endDate = new Date(startDateObj);
    endDate.setMonth(endDate.getMonth() + duration);

    // Create new order with complete structure matching schema
    const order = new Order({
      tenant: {
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        identityNumber: tenant.identityNumber,
        identityImage: tenant.identityImage || "",
        occupation: tenant.occupation || "",
        emergencyContact: {
          name: tenant.emergencyContact?.name || "",
          phone: tenant.emergencyContact?.phone || "",
          relationship: tenant.emergencyContact?.relationship || "",
        },
      },
      kostId,
      duration,
      startDate: startDateObj,
      endDate,
      userId, // Now userId is defined from req.user
      ownerId,
      payment: {
        method: "cash",
        status: "pending",
        amount,
        cash: {
          proofOfPayment: "",
          verifiedAt: null,
          verifiedBy: null,
        },
      },
      orderStatus: "pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        tenant: order.tenant,
        duration: order.duration,
        startDate: order.startDate,
        endDate: order.endDate,
        payment: {
          method: order.payment.method,
          status: order.payment.status,
          amount: order.payment.amount,
        },
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    console.error("Cash order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create cash order",
      error: error.message,
    });
  }
};

// Handle Payment Notification (Midtrans)
export const handlePaymentNotification = async (req, res) => {
  try {
    const { order_id, transaction_status } = req.body;

    const order = await Order.findOne({
      "payment.midtrans.transactionId": order_id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (transaction_status === "settlement") {
      order.payment.status = "paid";
      order.orderStatus = "ordered";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      order.payment.status = "failed";
      order.orderStatus = "cancelled";
    }

    await order.save();
    res.status(200).json({ success: true, message: "Payment status updated" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Payment Status (Cash)
export const updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order || order.payment.method !== "cash") {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan atau metode pembayaran tidak valid",
      });
    }

    // Update status pembayaran Cash
    order.payment.status = "paid";
    order.orderStatus = "ordered"; // Sesuai flow: masuk ke "Order (Dipesan)"
    order.payment.cash = {
      verifiedAt: new Date(),
      verifiedBy: req.user.id, // ID admin/pemilik kos yang verifikasi
      proofOfPayment: req.body.proofOfPayment, // URL bukti pembayaran
    };

    await order.save();
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Route untuk pembeli upload bukti pembayaran
export const uploadPaymentProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order || order.payment.method !== "cash") {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan atau metode pembayaran tidak valid",
      });
    }

    // Update bukti pembayaran
    order.payment.cash = {
      proofOfPayment: req.body.proofOfPayment, // URL bukti pembayaran
      uploadedAt: new Date(),
      uploadedBy: req.user.id, // ID pembeli yang upload
    };

    // Status tetap pending sampai diverifikasi owner
    order.payment.status = "pending";

    await order.save();
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Orders for Dashboard
export const getMyOrders = async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await Order.find({
      userId: id,
      orderStatus: "ordered", // Menampilkan kost yang sudah dipesan
    })
      .populate("kostId userId ownerId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Pending Orders untuk dashboard pemesan
export const getMyPendingOrders = async (req, res) => {
  const { id } = req.params;
  if (req.user.id === id) {
    try {
      const orders = await Order.find({
        userId: id,
        "payment.method": "cash",
        orderStatus: "pending",
      })
        .populate("kostId userId ownerId") // ini untuk ketika simpan object akan di populate
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

// Get Pending Orders untuk dashboard pemilik kos
export const getPendingOrders = async (req, res) => {
  const { id } = req.params;
  if (req.user.id === id) {
    try {
      const orders = await Order.find({
        ownerId: id,
        "payment.method": "cash",
        "payment.status": "pending",
      })
        .populate("kostId userId ownerId") // ini untuk ketika simpan object akan di populate
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

// Get All Orders untuk pemilik kos
export const getOwnerOrders = async (req, res) => {
  const { id } = req.params;
  if (req.user.id === id) {
    try {
      const orders = await Order.find({
        ownerId: id,
        "payment.status": "paid",
      })
        .populate("kostId userId ownerId")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

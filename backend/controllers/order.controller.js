import { createMidtransTransaction } from "../utils/midtrans/paymentService.js";
import OrderKost from "../models/order.model.js";

// Create Order Controller
export const createOrder = async (req, res) => {
  try {
    const { duration, paymentMethod, tenant, kostId, startDate } = req.body;

    // Create new order
    const order = new OrderKost({
      tenant,
      kostId,
      duration,
      startDate,
      userId: req.user._id, // dari token
      ownerId: req.body.ownerId,
      orderStatus: "pending",
      payment: {
        method: paymentMethod,
        status: "pending",
        amount: req.body.amount,
      },
    });

    // Jika pembayaran via Midtrans
    if (paymentMethod === "midtrans") {
      const transaction = await createMidtransTransaction(order);
      order.payment.midtrans = {
        transactionId: transaction.transaction_id,
        paymentToken: transaction.token,
        paymentUrl: transaction.redirect_url,
      };
    }

    await order.save();

    res.status(201).json({
      success: true,
      order,
      paymentUrl: order.payment.midtrans?.paymentUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Handle Payment Notification (Midtrans)
export const handlePaymentNotification = async (req, res) => {
  try {
    const notification = await midtransConfig.transaction.notification(
      req.body
    );
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    const order = await OrderKost.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }
    // Update status berdasarkan response Midtrans
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "accept") {
        order.payment.status = "paid";
        order.orderStatus = "ordered"; // Sesuai flow: masuk ke "Order (Dipesan)"
        order.payment.midtrans.paidAt = new Date();
      }
    } else if (transactionStatus === "pending") {
      order.payment.status = "pending";
    } else {
      // cancel, deny, expire
      order.payment.status = "failed";
      order.orderStatus = "cancelled";
    }

    await order.save();
    res.status(200).json({
      success: true,
      message: "Payment notification handled",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Payment Status (Cash)
export const updatePaymentStatus = async (req, res) => {
  try {
    const order = await OrderKost.findById(req.params.orderId);

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
      verifiedBy: req.user._id, // ID admin/pemilik kos yang verifikasi
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

// Get Orders for Dashboard
export const getMyOrders = async (req, res) => {
  try {
    const orders = await OrderKost.find({
      userId: req.user._id,
      orderStatus: "ordered", // Menampilkan kost yang sudah dipesan
    })
      .populate("kostId")
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

// Get Pending Orders untuk dashboard pemilik kos
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await OrderKost.find({
      ownerId: req.user._id,
      payment: {
        method: "cash",
        status: "pending",
      },
    })
      .populate("kostId userId")
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

// Get All Orders untuk pemilik kos
export const getOwnerOrders = async (req, res) => {
  try {
    const orders = await OrderKost.find({
      ownerId: req.user._id,
    })
      .populate("kostId userId")
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

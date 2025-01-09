import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Informasi Penyewa (Tenant Form)
    tenant: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      identityNumber: {
        // KTP
        type: String,
        required: true,
      },
      identityImage: {
        type: String, // URL gambar KTP
        required: true,
      },
      occupation: {
        type: String,
        required: true,
      },
      emergencyContact: {
        name: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        relationship: {
          type: String,
          required: true,
        },
      },
    },

    // Referensi ke Kost
    kostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kost",
      required: true,
    },

    // Detail Sewa
    duration: {
      type: Number, // dalam bulan
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Pembayaran
    payment: {
      method: {
        type: String,
        enum: ["midtrans", "cash"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      amount: {
        type: Number,
        required: true,
      },
      // Khusus untuk Midtrans
      midtrans: {
        transactionId: String,
        paymentToken: String,
        paymentUrl: String,
        paidAt: Date,
      },
      // Khusus untuk Cash
      cash: {
        proofOfPayment: String, // URL bukti pembayaran
        verifiedAt: Date,
        uploadedAt: Date,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    },

    // Status Order
    orderStatus: {
      type: String,
      enum: ["pending", "ordered", "cancelled"],
      default: "pending",
    },

    // Referensi User
    userId: {
      // ID Penyewa
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      // ID Pemilik Kos
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ userId: 1, orderStatus: 1 }); // Untuk halaman "Kost yang Saya sewa"
orderSchema.index({ ownerId: 1, orderStatus: 1 }); // Untuk halaman dashboard pemilik
orderSchema.index({ "payment.status": 1, orderStatus: 1 });

// Methods untuk update status
orderSchema.methods.updateToOrdered = async function () {
  if (this.payment.status === "paid") {
    this.orderStatus = "ordered";
    await this.save();
    return true;
  }
  return false;
};

// Static methods
orderSchema.statics.getPendingOrders = function (ownerId) {
  return this.find({
    ownerId,
    orderStatus: "pending",
    "payment.method": "cash",
    "payment.status": "pending",
  }).populate("kostId userId");
};

orderSchema.statics.getMyKosts = function (userId) {
  return this.find({
    userId,
    orderStatus: "ordered",
  }).populate("kostId");
};

// Pre-save middleware
orderSchema.pre("save", function (next) {
  // Hitung endDate berdasarkan startDate dan duration
  if (this.startDate && this.duration) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + this.duration);
    this.endDate = endDate;
  }

  // Update orderStatus jika pembayaran berhasil
  if (this.payment.status === "paid" && this.orderStatus === "pending") {
    this.orderStatus = "ordered";
  }

  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;

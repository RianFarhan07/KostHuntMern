import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  checkOrderStatus,
  createCashOrder,
  createMidtransOrder,
  getMyOrders,
  getMyPendingOrders,
  getOwnerOrders,
  getPendingOrders,
  handlePaymentNotification,
  updatePaymentStatus,
  uploadPaymentProof,
} from "../controllers/order.controller.js";
import { createMidtransTransaction } from "../utils/midtrans/paymentService.js";

const router = express.Router();

// Create new order
router.post("/midtrans", verifyToken, createMidtransOrder);
router.post("/cash", verifyToken, createCashOrder);
router.post("/createToken", verifyToken, createMidtransTransaction);

router.get("/check-status/:orderId", verifyToken, checkOrderStatus);

// Route for buyer to upload proof of payment
router.put("/upload-payment-proof/:orderId", verifyToken, uploadPaymentProof); // Pembeli upload bukti pembayaran

// Route for owner to verify payment status
router.put("/verify-payment-status/:orderId", verifyToken, updatePaymentStatus); // Owner verifikasi pembayaran

// Handle Midtrans payment notifications
router.post("/notification", handlePaymentNotification);

// Get user's orders
router.get("/my-orders/:id", verifyToken, getMyOrders);

// Get my pending orders
router.get("/my-pending-orders/:id", verifyToken, getMyPendingOrders);

// Get pending orders (for owner dashboard)
router.get("/tenant-unpaid-orders/:id", verifyToken, getPendingOrders);

// Get all orders (for owner)
router.get("/tenant-paid-orders/:id", verifyToken, getOwnerOrders);

export default router;

import express from "express";
import {
  createOrder,
  getMyOrders,
  getOwnerOrders,
  getPendingOrders,
  handlePaymentNotification,
  updatePaymentStatus,
} from "../controllers/order.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Rute untuk membuat order
router.post("/", verifyToken, createOrder); // Membuat order baru

// Rute untuk update status pembayaran (cash) oleh pemilik kos
router.post("/:orderId/payment", verifyToken, updatePaymentStatus); // Membuat transaksi pembayaran

// Rute untuk menangani notifikasi pembayaran (Midtrans webhook)
router.post("/notification", handlePaymentNotification); // Webhook notifikasi pembayaran

router.get("/my-orders", verifyToken, getMyOrders);
router.get("/pending", verifyToken, getPendingOrders);
router.get("/owner-orders", verifyToken, getOwnerOrders);
export default router;

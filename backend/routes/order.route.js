import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createCashOrder,
  createMidtransOrder,
  getMyOrders,
  getOwnerOrders,
  getPendingOrders,
  handlePaymentNotification,
  updatePaymentStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// Create new order
router.post("/midtrans", verifyToken, createMidtransOrder);
router.post("/cash", verifyToken, createCashOrder);

// Update payment status for cash payments
router.post("/:orderId/payment", verifyToken, updatePaymentStatus);

// Handle Midtrans payment notifications
router.post("/notification", handlePaymentNotification);

// Get user's orders
router.get("/my-orders", verifyToken, getMyOrders);

// Get pending orders (for owner dashboard)
router.get("/pending", verifyToken, getPendingOrders);

// Get all orders (for owner)
router.get("/owner-orders", verifyToken, getOwnerOrders);

export default router;

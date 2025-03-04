import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  deleteUser,
  getUser,
  getUserKost,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/kost/:id", verifyToken, getUserKost);
router.get("/:id", getUser);

export default router;

import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createKost,
  deleteKost,
  getKost,
} from "../controllers/kost.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createKost);
router.delete("/delete/:id", verifyToken, deleteKost);
router.get("/get/:id", getKost);

export default router;

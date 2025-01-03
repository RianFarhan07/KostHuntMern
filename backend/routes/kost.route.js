import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createKost,
  deleteKost,
  getAllKost,
  getKost,
  getRandomKost,
  updateKost,
} from "../controllers/kost.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createKost);
router.delete("/delete/:id", verifyToken, deleteKost);
router.put("/update/:id", verifyToken, updateKost);
router.get("/get/:id", getKost);
router.get("/getAll", getAllKost);
router.get("/getRandom", getRandomKost);

export default router;

import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import getStatsForOwner from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/", verifyToken, getStatsForOwner);

export default router;

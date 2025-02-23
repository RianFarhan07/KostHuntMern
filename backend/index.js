import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import kostRouter from "./routes/kost.route.js";
import orderRouter from "./routes/order.route.js";
import statsRouter from "./routes/stats.route.js";
import cron from "node-cron";
import { deleteExpiredOrders } from "./controllers/order.controller.js";
import cors from "cors";
import path from "path";
dotenv.config();

const _dirname = path.resolve();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://app.midtrans.com",
      "https://api.midtrans.com",
      "kost-hunt-mern-aaj2tyijx-rianfarhan07s-projects.vercel.app",
    ], // URL frontend kamu
    methods: ["GET", "POST", "PUT", "DELETE"], // Metode HTTP yang diizinkan
    credentials: true, // Jika menggunakan cookies atau autentikasi
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/kost", kostRouter);
app.use("/api/orders", orderRouter);
app.use("/api/stats", statsRouter);

app.use(express.static(path.join(_dirname, "/frontend/dist")));

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running scheduled expired orders cleanup...");
    await deleteExpiredOrders();
  } catch (error) {
    console.error("Scheduled cleanup failed:", error);
  }
});

mongoose
  .connect(process.env.MONGOURI)
  .then(async () => {
    console.log("connected to Mongoose");

    try {
      await deleteExpiredOrders();
      console.log("Initial expired orders cleanup completed");
    } catch (error) {
      console.error("Initial cleanup failed:", error);
    }

    // Set up cron job untuk pengecekan rutin
    cron.schedule("0 0 * * *", async () => {
      try {
        console.log("Running scheduled expired orders cleanup...");
        await deleteExpiredOrders();
      } catch (error) {
        console.error("Scheduled cleanup failed:", error);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(_dirname, "frontend", "dist", "index.html"));
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

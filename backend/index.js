import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import kostRouter from "./routes/kost.route.js";
import orderRouter from "./routes/order.route.js";
import cors from "cors";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // URL frontend kamu
    methods: ["GET", "POST", "PUT", "DELETE"], // Metode HTTP yang diizinkan
    credentials: true, // Jika menggunakan cookies atau autentikasi
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/kost", kostRouter);
app.use("/api/order", orderRouter);
mongoose
  .connect(process.env.MONGOURI)
  .then(() => {
    console.log("connected to Mongoose");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

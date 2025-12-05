// server.js

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pendingShopRoutes from "./routes/pendingShopRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import assignRoutes from "./routes/assignRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import logRoutes from "./routes/logRoutes.js";

dotenv.config();
const app = express();

// FIXED CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CONNECT MONGO
connectDB();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pending", pendingShopRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/assign", assignRoutes);
app.use("/api/visit", visitRoutes);
app.use("/api/logs", logRoutes);


// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Tracking Backend Server Running Successfully");
});

// START
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log("📌 Using Database URI:", process.env.MONGO_URI);
});

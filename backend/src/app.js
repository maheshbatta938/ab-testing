import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bayesianRoutes from "./routes/bayesianRoutes.js";
import experimentRoutes from "./routes/experimentRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import variantRoutes from "./routes/variantRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*"
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/experiments", experimentRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/bayesian", bayesianRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong."
  });
});

export default app;

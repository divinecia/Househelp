import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import homeownerRoutes from "./routes/homeowners";
import workerRoutes from "./routes/workers";
import bookingRoutes from "./routes/bookings";
import paymentRoutes from "./routes/payment";
import trainingRoutes from "./routes/trainings";
import reportRoutes from "./routes/reports";
import serviceRoutes from "./routes/services";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.use("/api/auth", authRoutes);

  // API routes
  app.use("/api/homeowners", homeownerRoutes);
  app.use("/api/workers", workerRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/trainings", trainingRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/services", serviceRoutes);

  return app;
}

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
import optionsRoutes from "./routes/options";
import normalizeRequestBody from "./middleware/normalize-request";
import { verifyToken, adminOnly } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  // CORS configuration - allow requests from any origin for development
  // In production, you should restrict this to your domain
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.ALLOWED_ORIGINS?.split(",") || true
          : true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Normalize request body from camelCase to snake_case
  app.use(normalizeRequestBody);

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
  app.use("/api/options", optionsRoutes);

  return app;
}

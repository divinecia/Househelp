import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "./lib/supabase";
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
// import { verifyToken } from "./middleware/auth";
import rateLimit from "express-rate-limit";

export function createServer() {
  const app = express();

  // Add environment validation
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  // Rate limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later'
  });

  // Middleware
  // CORS configuration - allow requests from any origin for development
  // In production, you should restrict this to your domain
  const isDevelopment =
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev";

  const corsOptions = {
    origin: isDevelopment 
      ? ['http://localhost:5173', 'http://localhost:3000'] 
      : process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Normalize request body from camelCase to snake_case
  app.use(normalizeRequestBody);

  // Apply rate limiter to auth routes
  app.use('/api/auth', authLimiter);

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Database health check endpoint
  app.get("/api/health/db", async (_req, res) => {
    try {
      // Test database connection by querying a system table
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .limit(1);

      if (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Database connection failed',
          error: error.message
        });
      }

      res.json({
        status: 'healthy',
        message: 'Database connection successful',
        tables_count: data?.length || 0
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Database connection test failed',
        error: error.message
      });
    }
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
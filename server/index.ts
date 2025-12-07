import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import normalizeRequestBody from "./middleware/normalize-request";
import optionsRoutes from "./routes/options";
import authRoutes from "./routes/auth";
import workersRoutes from "./routes/workers";
import { requireAuth } from "./middleware/require-auth";
import homeownersRoutes from "./routes/homeowners";
import bookingsRoutes from "./routes/bookings";
import paymentsRoutes from "./routes/payments";
import servicesRoutes from "./routes/services";
import trainingsRoutes from "./routes/trainings";
import reportsRoutes from "./routes/reports";

export function createServer() {
  const app = express();

  // Add environment validation
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  // Rate limiter for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  });

  // Middleware
  // CORS configuration - allow requests from any origin for development
  // In production, you should restrict this to your domain
  const isDevelopment =
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev";

  const corsOptions = {
    origin: isDevelopment
      ? ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000']
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

  // Apply rate limiter to all API routes
  app.use('/api', apiLimiter);

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  // Routes
  app.use("/api/options", optionsRoutes);
  app.use("/api/auth", authRoutes);  
  
  // Protected routes (require Supabase auth token)
  app.use("/api/workers", requireAuth, workersRoutes);
  app.use("/api/homeowners", requireAuth, homeownersRoutes);
  app.use("/api/bookings", requireAuth, bookingsRoutes);
  app.use("/api/payments", requireAuth, paymentsRoutes);
  app.use("/api/services", requireAuth, servicesRoutes);
  app.use("/api/trainings", requireAuth, trainingsRoutes);
  app.use("/api/reports", requireAuth, reportsRoutes);

  // Error handling middleware
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message
    });
  });

  return app;
}

// Start server if this file is run directly
const app = createServer();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
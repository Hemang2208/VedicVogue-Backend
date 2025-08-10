import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "../src/routes";
import { connectDB } from "../src/configs/db";

dotenv.config();

const app = express();

app.set("trust proxy", true);

// Connect to database
connectDB();

// CORS configuration to handle multiple origins and preflight requests
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Routes
app.use("/api", routes);

// Server Check Route
app.get("/", (_req: Request | any, res: Response | any) => {
  res.send("🚀 Vedic Vogue API is running on Vercel");
});

// Health check route
app.get("/health", (_req: Request | any, res: Response | any) => {
  res.json({ 
    status: "ok", 
    message: "Vedic Vogue API is healthy",
    timestamp: new Date().toISOString() 
  });
});

// 404 handler
app.use((_req: Request | any, res: Response | any) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err: any, _req: Request | any, res: Response | any, _next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

export default app;

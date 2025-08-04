import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes";

dotenv.config();

const app = express();

app.set("trust proxy", true);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Routes
app.use("/api", routes);

// Server Check Route
app.get("/", (_req: Request | any, res: Response | any) => {
  res.send("🚀 Vedic Vogue API is running");
});

// Health Check Route
app.get("/health", (_req: Request | any, res: Response | any) => {
  res.send("🚀 Vedic Vogue API is healthy");
});

export default app;

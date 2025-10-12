import { createServer } from "http";
import { connectDB } from "./configs/db";
import dotenv from "dotenv";
import cron from "node-cron";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = createServer(app);

const start = async (): Promise<void> => {
  try {
    await connectDB();
    server.listen(Number(PORT), () => {
      console.log(`🚀 Server is running on port http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

      // Start the self-ping CRON job only in production (Render)
      if (
        process.env.NODE_ENV === "production" &&
        process.env.RENDER_SERVICE_URL
      ) {
        setupSelfPingCron();
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Self-ping CRON job to keep the server alive on Render
const setupSelfPingCron = (): void => {
  const renderUrl = process.env.RENDER_SERVICE_URL || process.env.BASE_URL;

  if (!renderUrl) {
    console.warn(
      "⚠️  RENDER_SERVICE_URL or BASE_URL not found. Self-ping CRON job not started."
    );
    return;
  }

  // CRON job: runs every 5 mins to keep the server alive
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("CRON is Working");
      const healthUrl = `${renderUrl}/health`;

      // Dynamic import for node-fetch (ES module)
      const { default: fetch } = await import("node-fetch");

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(healthUrl, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(
          `✅ Self-ping successful: ${
            response.status
          } at ${new Date().toISOString()}`
        );
      } else {
        console.warn(
          `⚠️  Self-ping returned status: ${
            response.status
          } at ${new Date().toISOString()}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `❌ Self-ping failed at ${new Date().toISOString()}:`,
        errorMessage
      );
    }
  });

  console.log(
    `🔄 Self-ping CRON job started - pinging ${renderUrl}/health every 5 minutes`
  );
};

// Handle process termination gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

start();

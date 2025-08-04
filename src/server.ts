import { createServer } from "http";
import { connectDB } from "./configs/db";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT;

const server = createServer(app);

const start = async (): Promise<void> => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port http://localhost:${PORT}`);
  });
};

start();

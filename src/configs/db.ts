import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const MONGODB_URI: string =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tablwa";
    
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ Using default MongoDB URI. Set MONGODB_URI environment variable for production.");
    }
    
    // Configure mongoose for better performance
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      retryWrites: true,
    });
    
    console.log("✅ Connected to MongoDB");
    console.log(`📍 Database: ${MONGODB_URI.split('@')[1] || 'localhost'}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message || error);
    console.error("Stack trace:", error.stack);
    throw error; // Re-throw to let server handle it
  }
};

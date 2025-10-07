// src/lib/database/db.js

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log("Already connected to MongoDB");
      return;
    }

    console.log("Attempting to connect to MongoDB...");
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Remove deprecated options if using newer mongoose
    });

    console.log("✅ MONGODB CONNECTED successfully!");
    console.log(`Connected to: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

connectDB();

export default connectDB;

// src/app/api/debug/users/route.js
// ⚠️ REMOVE THIS FILE IN PRODUCTION - FOR DEBUGGING ONLY
import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";

export async function GET(req) {
  // ⚠️ Add security check - only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    await connectDB();
    console.log("✅ Database connected");

    // Get all users (limited to essential fields)
    const users = await User.find({})
      .select("name username email createdAt provider")
      .limit(20)
      .sort({ createdAt: -1 })
      .lean();

    const userCount = await User.countDocuments();

    console.log("📊 Database Diagnostic Results:");
    console.log("Total users:", userCount);
    console.log("Sample users:", users.map(u => ({
      username: u.username,
      name: u.name,
      email: u.email,
      provider: u.provider
    })));

    return NextResponse.json({
      success: true,
      totalUsers: userCount,
      users: users.map(u => ({
        _id: u._id.toString(),
        name: u.name,
        username: u.username,
        email: u.email,
        provider: u.provider || "credentials",
        createdAt: u.createdAt
      })),
      message: "⚠️ This endpoint should be removed in production"
    });
  } catch (error) {
    console.error("❌ Diagnostic error:", error);
    return NextResponse.json(
      { 
        error: "Database Error",
        details: error.message
      },
      { status: 500 }
    );
  }
}
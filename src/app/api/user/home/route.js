// src/app/api/user/home/route.js - GET CURRENT USER INFO
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";

export async function GET(req) {
  try {
    await connectDB();

    // ✅ Get session using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    console.log("🔍 Fetching user data for:", session.user.email);

    // ✅ Find user by email (works for both Google and credentials)
    const user = await User.findOne({ email: session.user.email })
      .select("name username email image bio createdAt followers following provider")
      .lean();

    if (!user) {
      console.error("❌ User not found in database:", session.user.email);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    console.log("✅ User data found:", {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      provider: user.provider
    });

    // ✅ Return user data with consistent _id format
    return NextResponse.json({
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      bio: user.bio || "",
      createdAt: user.createdAt,
      followers: user.followers || [],
      following: user.following || [],
      provider: user.provider || "credentials",
      _timestamp: Date.now(), // For cache busting
    });
  } catch (error) {
    console.error("❌ Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}
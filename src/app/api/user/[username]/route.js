// src/app/api/user/[username]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username }).select(
      "name username email image bio createdAt followers following"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      bio: user.bio || "",
      createdAt: user.createdAt,
      followers: user.followers || [],
      following: user.following || [],
    });
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
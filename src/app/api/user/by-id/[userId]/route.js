import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select(
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
    console.error("Error fetching user by ID:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, name, username, email } = body;

    const _id = userId && mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId)
      : new mongoose.Types.ObjectId();

    const existingUser = await User.findById(_id);
    if (existingUser) {
      return Response.json({
        message: "User already exists",
        user: existingUser
      }, { status: 200 });
    }

    const user = await User.create({
      _id,
      name: name || "Test User",
      username: username || "testuser",
      email: email || "test@example.com",
      image: "/imageProfile1.png",
    });

    return Response.json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image
      }
    }, { status: 201 });
  } catch (err) {
    console.error("Error creating user:", err);
    return Response.json({
      error: "Failed to create user",
      details: err.message
    }, { status: 500 });
  }
}
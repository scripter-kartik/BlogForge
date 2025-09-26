import { NextResponse } from "next/server";
import { User } from "../../../lib/models/User.js";
import bcrypt from "bcryptjs";
import "../../../lib/database/db.js";

export async function POST(request) {
  try {
    const { name, email, password, username } = await request.json();

    if (!name || !email || !password || !username) {
      return NextResponse.json(
        { message: "please fill out all the details", success: false },
        { status: 400 }
      );
    }

    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail || existingUsername) {
      return NextResponse.json(
        { message: "user already exists", success: false },
        { status: 409 }
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      username,
      password: hashPassword,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      {
        message: "user created successfully",
        success: true,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("error occured during signing up", error);
    return NextResponse.json(
      { message: "error occured during signing up", success: false },
      { status: 500 }
    );
  }
}

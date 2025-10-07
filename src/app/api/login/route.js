// src/app/api/login/route.js

import { NextResponse } from "next/server";
import "../../../lib/database/db.js";
import { User } from "../../../lib/models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "user not found", success: false },
        { status: 400 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { message: "Invalid Password", success: false },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: "Login successfull",
        success: true,
        token,
        data: {
          name: user.name,
          email: user.email,
          id: user._id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("there is a error in you login page", error);
    return NextResponse.json(
      { message: "error occured in login page", success: false },
      { status: 500 }
    );
  }
}

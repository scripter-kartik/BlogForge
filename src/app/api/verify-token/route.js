// src/app/api/verify-token/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "../../../lib/models/User.js";
import "../../../lib/database/db.js";

export async function POST(request) {
  const { token } = await request.json();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}

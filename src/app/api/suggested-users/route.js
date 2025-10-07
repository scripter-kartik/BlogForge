// src/app/api/suggested-users/route.js
import dbConnect from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  // Example: get 10 newest users or based on some criteria
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("name bio image")
    .lean();
  return NextResponse.json(users);
}

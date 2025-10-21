// ============================================
// 5. FIX: src/app/api/protected/user/update/route.js
// Change from POST to PATCH
// ============================================

// src/app/api/protected/user/update/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import connectDB from "@/lib/database/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const userEmail = session.user.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let imageUrl = user.image;

    // Handle profile image upload
    const profileImage = formData.get("profileImage");
    if (profileImage && profileImage.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(profileImage.name || ".jpg");
      const safeName = `${uuidv4()}${ext}`;
      const newPath = path.join(uploadDir, safeName);

      await fs.writeFile(newPath, buffer);
      imageUrl = `/uploads/${safeName}`;

      // Delete old image if it exists
      if (user.image && user.image.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), "public", user.image);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.log("Could not delete old image:", err);
        }
      }
    }

    // Update user fields
    const name = formData.get("name");
    const bio = formData.get("bio");
    const password = formData.get("password");
    const email = formData.get("email");

    if (name) user.name = name;
    if (bio !== null) user.bio = bio;
    if (email) user.email = email;
    user.image = imageUrl;

    // Only update password if provided
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
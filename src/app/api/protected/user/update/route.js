// src/app/api/protected/user/update/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/database/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(file) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "profile-images",
          resource_type: "auto",
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

// Helper function to delete image from Cloudinary
async function deleteFromCloudinary(imageUrl) {
  try {
    // Extract public_id from Cloudinary URL
    const matches = imageUrl.match(/\/profile-images\/([^/.]+)/);
    if (matches && matches[1]) {
      const publicId = `profile-images/${matches[1]}`;
      await cloudinary.uploader.destroy(publicId);
      console.log("✅ Old image deleted from Cloudinary");
    }
  } catch (error) {
    console.log("⚠️ Could not delete old image from Cloudinary:", error.message);
  }
}

export async function POST(req) {
  try {
    // ✅ FIRST: Connect to database
    await connectDB();

    // ✅ SECOND: Get session
    const session = await getServerSession(authOptions);
    console.log("📌 Session:", session);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    if (!session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - No user in session" },
        { status: 401 }
      );
    }

    // ✅ THIRD: Get user ID from session
    const userId = session.user.id || session.user._id;
    console.log("👤 User ID from session:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found in session" },
        { status: 401 }
      );
    }

    // ✅ FOURTH: Find user by ID
    const user = await User.findById(userId);
    console.log("🔍 Found user:", user ? "Yes" : "No");

    if (!user) {
      console.error("❌ User not found for ID:", userId);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // ✅ FIFTH: Parse form data
    const formData = await req.formData();
    let imageUrl = user.image;

    // ✅ Handle profile image upload to Cloudinary
    const profileImage = formData.get("profileImage");
    if (profileImage && profileImage.size > 0) {
      try {
        console.log("📤 Uploading image to Cloudinary...");
        
        // Upload new image to Cloudinary
        const uploadResult = await uploadToCloudinary(profileImage);
        imageUrl = uploadResult.secure_url;
        
        console.log("✅ Image uploaded successfully:", imageUrl);

        // Delete old image from Cloudinary (if it exists and is from Cloudinary)
        if (user.image && user.image.includes("cloudinary.com")) {
          await deleteFromCloudinary(user.image);
        }
      } catch (uploadError) {
        console.error("❌ Image upload error:", uploadError);
        return NextResponse.json(
          { success: false, error: "Failed to upload image" },
          { status: 400 }
        );
      }
    }

    // ✅ Get form fields
    const name = formData.get("name")?.trim();
    const bio = formData.get("bio")?.trim() || "";
    const password = formData.get("password")?.trim();
    const email = formData.get("email")?.trim();

    // ✅ Validation
    if (name && name.length === 0) {
      return NextResponse.json(
        { success: false, error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (email && !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // ✅ Check if email is already taken (by another user)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 400 }
        );
      }
      user.email = email;
    }

    // ✅ Update fields
    if (name) user.name = name;
    user.bio = bio;
    user.image = imageUrl;

    // ✅ Update password only if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // ✅ Save user
    const updatedUser = await user.save();
    console.log("✅ User updated successfully");

    // ✅ Return updated user data (no password)
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          username: updatedUser.username,
          bio: updatedUser.bio,
          image: updatedUser.image,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Profile update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
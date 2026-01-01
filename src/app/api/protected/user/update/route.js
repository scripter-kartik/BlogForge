import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/database/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const isCloudinaryConfigured = () => {
  return cloudinaryConfig.cloud_name && 
         cloudinaryConfig.api_key && 
         cloudinaryConfig.api_secret;
};

if (isCloudinaryConfigured()) {
  cloudinary.config(cloudinaryConfig);
  console.log("✅ Cloudinary configured:", cloudinaryConfig.cloud_name);
} else {
  console.warn("⚠️ Cloudinary not configured. Image uploads will fail.");
}

async function uploadToCloudinary(file) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Please check your environment variables.");
  }

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
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload success:", result.secure_url);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

async function deleteFromCloudinary(imageUrl) {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
    return; 
  }

  try {
    const matches = imageUrl.match(/\/profile-images\/([^/.]+)/);
    if (matches && matches[1]) {
      const publicId = `profile-images/${matches[1]}`;
      await cloudinary.uploader.destroy(publicId);
      console.log("✅ Old image deleted from Cloudinary");
    }
  } catch (error) {
    console.log("Could not delete old image from Cloudinary:", error.message);
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    console.log("Session exists:", !!session);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user._id;
    console.log("👤 User ID from session:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found in session" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    console.log("🔍 Found user:", user ? "Yes" : "No");

    if (!user) {
      console.error("User not found for ID:", userId);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    let imageUrl = user.image;

    const profileImage = formData.get("profileImage");
    if (profileImage && profileImage.size > 0) {
      try {
        console.log("Uploading image to Cloudinary...");
        console.log("File size:", profileImage.size, "bytes");
        console.log("File type:", profileImage.type);
        
        if (profileImage.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: "Image must be less than 5MB" },
            { status: 400 }
          );
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(profileImage.type)) {
          return NextResponse.json(
            { success: false, error: "Invalid file type. Use JPG, PNG, GIF, or WebP" },
            { status: 400 }
          );
        }
        
        const uploadResult = await uploadToCloudinary(profileImage);
        imageUrl = uploadResult.secure_url;
        
        console.log("Image uploaded successfully:", imageUrl);

        if (user.image && user.image.includes("cloudinary.com")) {
          await deleteFromCloudinary(user.image);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { 
            success: false, 
            error: uploadError.message || "Failed to upload image. Please check your Cloudinary configuration." 
          },
          { status: 400 }
        );
      }
    }

    const name = formData.get("name")?.trim();
    const bio = formData.get("bio")?.trim() || "";
    const password = formData.get("password")?.trim();
    const email = formData.get("email")?.trim();

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

    if (name) user.name = name;
    user.bio = bio;
    user.image = imageUrl;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    console.log("✅ User updated successfully");

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
    console.error("Profile update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
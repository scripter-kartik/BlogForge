import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import bcrypt from "bcryptjs";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function PATCH(req) {
  try {
    await connectDB();

    const userEmail = req.headers.get("user-email");
    if (!userEmail) {
      return NextResponse.json(
        { message: "Unauthorized - No user email found" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = new IncomingForm({
        uploadDir: path.join(process.cwd(), "/public/uploads"),
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
      });

      if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir, { recursive: true });
      }

      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      const { username, email, name, bio, password } = fields;
      const updatedFields = { email, name, bio };

      if (password && password.trim()) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updatedFields.password = hashedPassword;
      }

      if (files.profileImage) {
        const file = files.profileImage;
        const imageName = path.basename(file.filepath);
        updatedFields.image = `/uploads/${imageName}`;
      }

      if (email !== userEmail) {
        const existingUser = await User.findOne({
          email: email,
          email: { $ne: userEmail },
        });
        if (existingUser) {
          return NextResponse.json(
            { message: "Email already in use" },
            { status: 409 }
          );
        }
      }

      const user = await User.findOneAndUpdate(
        { email: userEmail },
        { $set: updatedFields },
        { new: true }
      ).select("-password");

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Profile updated successfully",
        user,
      });
    }

    // Non multipart JSON update
    const { username, email, name, bio, password } = await req.json();
    const updatedFields = { email, name, bio };

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }

    if (email !== userEmail) {
      const existingUser = await User.findOne({
        email: email,
        email: { $ne: userEmail },
      });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 409 }
        );
      }
    }

    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: updatedFields },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { message: "Server error occurred while updating profile" },
      { status: 500 }
    );
  }
}

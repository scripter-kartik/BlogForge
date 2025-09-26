import connectDB from "@/lib/database/db.js";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, email, name, bio, password } = req.body;

  try {
    await connectDB();

    const updatedFields = { email, name, bio };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }

    const user = await User.findOneAndUpdate(
      { username },
      { $set: updatedFields },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove password from response
    const { password: _, ...userSafe } = user.toObject();

    res.status(200).json({ user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

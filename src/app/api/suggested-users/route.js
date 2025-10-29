// ============================================
// COMPLETE: /app/api/suggested-users/route.js
// ============================================
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    // ✅ Get current logged-in user's ID from session
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    console.log("👤 Current user ID from session:", currentUserId);
    console.log("📝 Session user object:", session?.user);

    let users = [];

    if (currentUserId) {
      // ✅ Convert to MongoDB ObjectId for proper comparison
      const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
      
      console.log("🔍 Excluding user:", currentUserObjectId.toString());

      // ✅ If user is logged in, exclude them from suggestions
      users = await User.find(
        { _id: { $ne: currentUserObjectId } },
        "name username image bio"
      )
        .limit(10)
        .lean();

      console.log("✅ Fetched suggested users (excluding current user):", users.length);
      console.log("📋 Users returned:", users.map(u => ({ name: u.name, _id: u._id })));
    } else {
      // ✅ If not logged in, show any random users (but limit to avoid showing all)
      users = await User.find({}, "name username image bio")
        .limit(10)
        .lean();

      console.log("✅ Fetched suggested users (not logged in):", users.length);
    }

    return Response.json(users, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching suggested users:", err);
    console.error("Error details:", err.message);
    
    return Response.json(
      { 
        error: "Failed to fetch suggested users",
        details: err.message 
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";

export async function POST(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    if (currentUser._id.toString() === targetUserId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    if (!currentUser.following) {
      currentUser.following = [];
    }
    if (!targetUser.followers) {
      targetUser.followers = [];
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      );
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUser._id);
    }

    currentUser.markModified("following");
    targetUser.markModified("followers");

    await currentUser.save();
    await targetUser.save();

    return NextResponse.json(
      {
        success: true,
        isFollowing: !isFollowing,
        followersCount: targetUser.followers.length,
        message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process follow request" },
      { status: 500 }
    );
  }
}
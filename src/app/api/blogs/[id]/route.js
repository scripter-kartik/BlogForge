import connectDB from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { User } from "@/lib/models/User.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

async function getMongoUserId(session) {
  if (!session?.user) return null;

  const sessionId = session.user._id || session.user.id || session.user.sub;

  if (sessionId && /^[0-9a-fA-F]{24}$/.test(sessionId)) {
    return sessionId;
  }

  if (session.user.email) {
    console.log("Invalid ObjectId in session, looking up by email:", session.user.email);
    const dbUser = await User.findOne({ email: session.user.email });
    return dbUser ? dbUser._id.toString() : null;
  }

  return null;
}

export async function GET(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;

    const blog = await Blog.findById(id).populate("author", "username name image");

    if (!blog) {
      return Response.json({ error: "Blog not found" }, { status: 404 });
    }

    await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return Response.json(blog, { status: 200 });
  } catch (err) {
    console.error("Error fetching blog:", err);
    return Response.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const blog = await Blog.findById(id);

    if (!blog) {
      return Response.json({ error: "Blog not found" }, { status: 404 });
    }

    const sessionUserId = await getMongoUserId(session);
    const blogAuthorId = blog.author.toString();

    console.log("=== UPDATE DEBUG ===");
    console.log("Session User ID:", sessionUserId);
    console.log("Blog Author ID:", blogAuthorId);
    console.log("Match:", sessionUserId === blogAuthorId);

    if (!sessionUserId || sessionUserId !== blogAuthorId) {
      return Response.json(
        {
          error: "You can only edit your own posts",
          debug: process.env.NODE_ENV === 'development' ? {
            sessionUserId,
            blogAuthorId,
            sessionUser: session.user
          } : undefined
        },
        { status: 403 }
      );
    }

    const allowedFields = ['title', 'description', 'content', 'coverImage', 'tags'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("author", "username name image");

    return Response.json(updatedBlog, { status: 200 });

  } catch (err) {
    console.error("Error updating blog:", err);
    return Response.json(
      { error: err.message || "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return Response.json({ error: "Blog not found" }, { status: 404 });
    }

    const sessionUserId = await getMongoUserId(session);
    const blogAuthorId = blog.author.toString();

    console.log("=== DELETE DEBUG ===");
    console.log("Session User ID:", sessionUserId);
    console.log("Blog Author ID:", blogAuthorId);
    console.log("Match:", sessionUserId === blogAuthorId);

    if (!sessionUserId || sessionUserId !== blogAuthorId) {
      return Response.json(
        {
          error: "You can only delete your own posts",
          debug: process.env.NODE_ENV === 'development' ? {
            sessionUserId,
            blogAuthorId,
            sessionUser: session.user
          } : undefined
        },
        { status: 403 }
      );
    }

    await Blog.findByIdAndDelete(id);

    return Response.json(
      { message: "Blog deleted successfully" },
      { status: 200 }
    );

  } catch (err) {
    console.error("Error deleting blog:", err);
    return Response.json(
      { error: err.message || "Failed to delete blog" },
      { status: 500 }
    );
  }
}
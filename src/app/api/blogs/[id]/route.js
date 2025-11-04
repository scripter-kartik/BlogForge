// src/app/api/blogs/[id]/route.js
// ============================================
// FIXED VERSION - Uses correct authOptions import

import connectDB from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ FIXED: Correct import path

// ✅ GET - Fetch single blog post
export async function GET(req, { params }) {
  await connectDB();
  try {
    const { id } = params;

    const blog = await Blog.findById(id).populate("author", "username name image");
    
    if (!blog) {
      return Response.json({ error: "Blog not found" }, { status: 404 });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return Response.json(blog, { status: 200 });
  } catch (err) {
    console.error("Error fetching blog:", err);
    return Response.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

// ✅ PATCH - Update blog post
export async function PATCH(req, { params }) {
  await connectDB();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    
    // Find the blog post
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return Response.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ FIXED: Convert both IDs to strings for comparison
    const sessionUserId = (session.user.id || session.user._id || session.user.sub).toString();
    const blogAuthorId = blog.author.toString();

    console.log("=== UPDATE DEBUG ===");
    console.log("Session User ID:", sessionUserId);
    console.log("Blog Author ID:", blogAuthorId);
    console.log("Match:", sessionUserId === blogAuthorId);

    if (sessionUserId !== blogAuthorId) {
      return Response.json(
        { 
          error: "You can only edit your own posts",
          debug: {
            sessionUserId,
            blogAuthorId,
            sessionUser: session.user
          }
        },
        { status: 403 }
      );
    }

    // Update fields
    const allowedFields = ['title', 'description', 'content', 'coverImage', 'tags'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update the blog
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

// ✅ DELETE - Delete blog post
export async function DELETE(req, { params }) {
  await connectDB();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    
    // Find the blog post
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return Response.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ FIXED: Convert both IDs to strings for comparison
    const sessionUserId = (session.user.id || session.user._id || session.user.sub).toString();
    const blogAuthorId = blog.author.toString();

    console.log("=== DELETE DEBUG ===");
    console.log("Session User ID:", sessionUserId);
    console.log("Blog Author ID:", blogAuthorId);
    console.log("Match:", sessionUserId === blogAuthorId);

    if (sessionUserId !== blogAuthorId) {
      return Response.json(
        { 
          error: "You can only delete your own posts",
          debug: {
            sessionUserId,
            blogAuthorId,
            sessionUser: session.user
          }
        },
        { status: 403 }
      );
    }

    // Delete the blog
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
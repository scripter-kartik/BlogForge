// src/app/api/blogs/[id]/route.js
// ============================================
import connectDB from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";

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
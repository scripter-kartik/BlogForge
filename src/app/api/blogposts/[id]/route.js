import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/db.js"; 
import { Blog } from "@/lib/models/Blog.js"; 

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const blog = await Blog.findById(params.id).populate("author", "name username image");
        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }
        return NextResponse.json(blog);
    } catch (error) {
        console.error("Error fetching blog by ID:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

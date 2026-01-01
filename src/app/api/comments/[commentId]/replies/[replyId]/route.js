import connectDB from "@/lib/database/db.js";
import { Comment } from "@/lib/models/Comment.js";

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { commentId, replyId } = params;

    if (!commentId || !replyId) {
      return Response.json(
        { error: "Missing commentId or replyId" },
        { status: 400 }
      );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { replies: { _id: replyId } } },
      { new: true }
    );

    if (!updatedComment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    return Response.json(
      { success: true, message: "Reply deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting reply:", err);
    return Response.json({ error: "Failed to delete reply" }, { status: 500 });
  }
}
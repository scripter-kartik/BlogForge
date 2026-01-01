"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Comments({ postId, isDarkMode }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      alert("Please log in to comment.");
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorId: user?._id,
          content: newComment.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      const data = await res.json();
      setComments((prev) => [data, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId) => {
    if (!isAuthenticated) {
      alert("Please log in to reply.");
      return;
    }

    if (!replyContent.trim()) return;

    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: user?._id,
          content: replyContent.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to post reply");
      const reply = await res.json();

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: [reply, ...(c.replies || [])] }
            : c
        )
      );
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return <p className="text-gray-500 mt-6">Loading comments...</p>;
  }

  return (
    <div
      className={`mt-10 w-full rounded-xl p-6 ${
        isDarkMode ? "bg-[#1f1f1f] text-white" : "bg-gray-100 text-black"
      } transition-colors duration-500`}
    >
      <h2 className="text-2xl font-semibold mb-6 border-b border-[#f75555] pb-2">
        Comments ({comments.length})
      </h2>

      {isAuthenticated ? (
        <div className="flex flex-col gap-3 mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            className={`w-full rounded-lg px-3 py-2 resize-none h-24 outline-none ${
              isDarkMode ? "bg-[#2b2b2b]" : "bg-white"
            }`}
          />
          <button
            onClick={handleSubmitComment}
            disabled={submitting}
            className={`self-end px-5 py-2 rounded-md text-white font-medium ${
              submitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#f75555] hover:bg-red-600"
            } transition`}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <p className="text-gray-400 mb-6">
          Please <Link href="/login" className="text-[#f75555] underline">log in</Link> to comment.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {comments.length === 0 && (
          <p className="text-gray-400">No comments yet. Be the first!</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment._id}
            className={`p-3 rounded-lg ${
              isDarkMode ? "bg-[#2a2a2a]" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={comment.author?.image || "/default-avatar.png"}
                alt={comment.author?.name}
                className="w-8 h-8 rounded-full"
              />
              <Link
                href={`/profile/${comment.author?.username}`}
                className="text-[#f75555] font-medium hover:underline"
              >
                {comment.author?.name || comment.author?.username}
              </Link>
              <span className="text-sm text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            <p className="ml-11">{comment.content}</p>

            <div className="ml-11 mt-2">
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment._id ? null : comment._id)
                }
                className="text-sm text-[#f75555] hover:underline"
              >
                {replyingTo === comment._id ? "Cancel" : "Reply"}
              </button>
            </div>

            {replyingTo === comment._id && (
              <div className="ml-11 mt-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className={`w-full rounded-lg px-3 py-2 resize-none h-20 outline-none ${
                    isDarkMode ? "bg-[#2b2b2b]" : "bg-gray-100"
                  }`}
                />
                <button
                  onClick={() => handleSubmitReply(comment._id)}
                  className="mt-2 px-4 py-1 rounded-md bg-[#f75555] text-white hover:bg-red-600 transition"
                >
                  Reply
                </button>
              </div>
            )}

            {comment.replies?.length > 0 && (
              <div className="ml-11 mt-4 flex flex-col gap-3">
                {comment.replies.map((reply) => (
                  <div
                    key={reply._id}
                    className={`p-2 rounded ${
                      isDarkMode ? "bg-[#222]" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={reply.author?.image || "/default-avatar.png"}
                        alt={reply.author?.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <Link
                        href={`/profile/${reply.author?.username}`}
                        className="text-[#f75555] text-sm hover:underline"
                      >
                        {reply.author?.name || reply.author?.username}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="ml-8 text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

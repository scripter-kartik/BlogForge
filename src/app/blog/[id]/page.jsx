"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FaRegClock } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";

export default function BlogPage() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Replace with real auth in production
  const currentUser = {
    id: "64f1c123abc456def7890123",
    username: "currentuser",
    name: "Current User",
    image: "/imageProfile1.png",
  };

  useEffect(() => {
    async function ensureUserExists() {
      try {
        await fetch("/api/test/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            name: currentUser.name,
            username: currentUser.username,
            email: "currentuser@example.com",
          }),
        });
      } catch (err) {
        console.error("❌ Failed to ensure user exists:", err);
      }
    }
    ensureUserExists();
  }, []);

  // Fetch blog
  useEffect(() => {
    async function fetchBlog() {
      if (!params.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs/${params.id}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch blog");
        }
        const data = await res.json();
        setBlog(data);
        setError(null);
      } catch (err) {
        console.error("Fetch blog error:", err);
        setError(err.message || "Failed to load blog.");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [params.id]);

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      if (!params.id) return;
      try {
        const res = await fetch(`/api/comments?postId=${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setComments([]);
      }
    }
    fetchComments();
  }, [params.id]);

  // Add comment
  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: params.id,
          authorId: currentUser.id,
          content: trimmed,
        }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to post comment");
      setComments([responseData, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert(`Failed to post comment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setDeletingIds((prev) => new Set(prev).add(commentId));
    try {
      const res = await fetch(`/api/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete comment");
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(`Failed to delete comment: ${err.message}`);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  // Reply handling
  const handleReplyChange = (commentId, value) => {
    setReplyInputs({ ...replyInputs, [commentId]: value });
  };

  const handleAddReply = async (commentId) => {
    const reply = replyInputs[commentId]?.trim();
    if (!reply) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: currentUser.id,
          content: reply,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post reply");
      setComments(
        comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: [data, ...(c.replies || [])] }
            : c
        )
      );
      setReplyInputs({ ...replyInputs, [commentId]: "" });
    } catch (err) {
      alert(`Failed to post reply: ${err.message}`);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    const deleteKey = `${commentId}-${replyId}`;
    setDeletingIds((prev) => new Set(prev).add(deleteKey));
    try {
      const res = await fetch(`/api/comments/${commentId}/replies/${replyId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete reply");
      setComments(
        comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        )
      );
    } catch (err) {
      alert(`Failed to delete reply: ${err.message}`);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(deleteKey);
        return newSet;
      });
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#1c1d1d] text-white">
        Loading blog...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#1c1d1d] text-white gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <Link href="/" className="text-[#f75555] hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Blog not found
  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#1c1d1d] text-white gap-4">
        <p className="text-xl">Blog not found.</p>
        <Link href="/" className="text-[#f75555] hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"
      } transition-colors duration-500`}
    >
      <div className="fixed top-0 w-full flex justify-center bg-[#1c1d1d] z-50">
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>

      <div className="max-w-[1280px] mx-auto pt-28 px-6 pb-16">

        {/* Blog Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#f75555] hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Blogs
          </Link>

          <h1 className="text-4xl font-bold mb-3">{blog.title}</h1>
          {blog.description && (
            <p className="text-gray-400 text-lg mb-4">{blog.description}</p>
          )}

          {/* Blog Metadata */}
          <div className="flex items-center gap-6 text-gray-400 text-sm">
            {blog.author && (
              <div className="flex items-center gap-2">
                <img
                  src={blog.author.image || "/imageProfile1.png"}
                  alt={blog.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <Link
                  href={`/profile/${blog.author.username}`}
                  className="hover:underline text-white font-medium"
                >
                  {blog.author.name || blog.author.username}
                </Link>
              </div>
            )}
            {blog.createdAt && (
              <div className="flex items-center gap-1">
                <FaRegClock />
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {blog.views !== undefined && (
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <span>{blog.views} views</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BiComment />
              <span>{comments.length} comments</span>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        {blog.content && (
          <div className="prose prose-invert max-w-none mb-12">
            <div
              className="text-gray-300 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        )}

        <hr className="border-gray-700 my-8" />

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">
            Comments ({comments.length})
          </h2>
          {/* Comment Input */}
          <div className="w-full bg-[#23272a] rounded p-4 mb-6">
            <textarea
              className="bg-transparent w-full outline-none px-2 py-2 rounded text-sm text-white resize-none"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <button
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              className="mt-3 bg-[#f75555] hover:bg-red-600 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>

          {/* Comments List */}
          <div className="flex flex-col gap-4">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex flex-col gap-2 bg-[#2c2f33] p-4 rounded"
                >
                  <div className="flex gap-3">
                    <img
                      src={comment.author?.image || "/imageProfile1.png"}
                      alt={comment.author?.name || "User"}
                      className="w-10 h-10 rounded-full border-2 border-[#f75555]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link
                            href={`/profile/${comment.author?.username}`}
                            className="font-semibold text-base text-[#f75555] hover:underline"
                          >
                            {comment.author?.name || comment.author?.username || "Anonymous"}
                          </Link>
                          <span className="text-gray-500 text-xs block">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {comment.author?._id === currentUser.id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            disabled={deletingIds.has(comment._id)}
                            className="text-red-500 text-xs hover:text-red-400 disabled:opacity-50"
                          >
                            {deletingIds.has(comment._id)
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mt-2">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="ml-12 mt-3 flex flex-col gap-3">
                    {(comment.replies || []).map((reply) => (
                      <div key={reply._id} className="flex gap-3">
                        <img
                          src={reply.author?.image || "/imageProfile1.png"}
                          alt={reply.author?.name || "User"}
                          className="w-8 h-8 rounded-full border-2 border-[#f75555]"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link
                                href={`/profile/${reply.author?.username}`}
                                className="font-semibold text-sm text-[#f75555] hover:underline"
                              >
                                {reply.author?.name || reply.author?.username || "Anonymous"}
                              </Link>
                              <span className="text-gray-500 text-xs block">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {reply.author?._id === currentUser.id && (
                              <button
                                onClick={() =>
                                  handleDeleteReply(comment._id, reply._id)
                                }
                                disabled={deletingIds.has(
                                  `${comment._id}-${reply._id}`
                                )}
                                className="text-red-500 text-xs hover:text-red-400 disabled:opacity-50"
                              >
                                {deletingIds.has(`${comment._id}-${reply._id}`)
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mt-1">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Reply Input */}
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={replyInputs[comment._id] || ""}
                        onChange={(e) =>
                          handleReplyChange(comment._id, e.target.value)
                        }
                        placeholder="Write a reply..."
                        className="flex-1 bg-[#23272a] border border-gray-600 rounded px-3 py-2 text-sm text-white outline-none focus:border-[#f75555] transition-colors"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleAddReply(comment._id);
                        }}
                      />
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        disabled={!replyInputs[comment._id]?.trim()}
                        className="bg-[#f75555] hover:bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

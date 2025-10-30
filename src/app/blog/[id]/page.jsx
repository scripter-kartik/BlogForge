"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Login from "@/components/LoginForm";
import Signup from "@/components/SignupForm";
import { useAuth } from "@/hooks/useAuth";
import { FaRegClock } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";

export default function BlogPage() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});
  const [deletingIds, setDeletingIds] = useState(new Set());

  // ✅ DEBUG: Log user object
  useEffect(() => {
    if (user) {
      console.log("👤 Current User Object:", user);
      console.log("📝 User Fields:", {
        id: user?.id,
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        image: user?.image,
      });
    }
  }, [user]);

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
        console.log("📝 Fetched comments:", data);
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
    if (!trimmed || !isAuthenticated || !user) {
      setIsLoginActive(true);
      return;
    }

    // ✅ Use user.id (NextAuth sets this as _id string)
    const userId = user.id || user._id;
    console.log("💬 Posting comment with userId:", userId, "User object:", user);

    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: params.id,
          authorId: userId,
          content: trimmed,
        }),
      });

      const responseData = await res.json();
      console.log("📝 Comment response:", responseData);

      if (!res.ok) throw new Error(responseData.error || "Failed to post comment");

      // ✅ Add new comment to state
      setComments([responseData, ...comments]);
      setNewComment("");

      // ✅ Update blog post's comment count
      setBlog((prevBlog) => ({
        ...prevBlog,
        commentCount: (prevBlog?.commentCount || 0) + 1,
      }));
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

      // ✅ Remove comment from state
      setComments(comments.filter((c) => c._id !== commentId));

      // ✅ Update blog post's comment count
      setBlog((prevBlog) => ({
        ...prevBlog,
        commentCount: Math.max(0, (prevBlog?.commentCount || 1) - 1),
      }));
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
    if (!reply || !isAuthenticated || !user) {
      setIsLoginActive(true);
      return;
    }

    const userId = user.id || user._id;
    console.log("💬 Posting reply with userId:", userId);

    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: userId,
          content: reply,
        }),
      });
      const data = await res.json();
      console.log("📝 Reply response:", data);

      if (!res.ok) throw new Error(data.error || "Failed to post reply");

      // ✅ Update comments with new reply
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

      // ✅ Update comments with reply removed
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
      <div
        className={`min-h-screen flex justify-center items-center transition-colors duration-500 ${
          isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"
        }`}
      >
        Loading blog...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center gap-4 transition-colors duration-500 ${
          isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"
        }`}
      >
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
      <div
        className={`min-h-screen flex flex-col justify-center items-center gap-4 transition-colors duration-500 ${
          isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"
        }`}
      >
        <p className="text-xl">Blog not found.</p>
        <Link href="/" className="text-[#f75555] hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"
      }`}
    >
      <div className="fixed top-0 w-full flex justify-center z-50">
        <Navbar
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          setIsLoginActive={setIsLoginActive}
          setIsSignupActive={setIsSignupActive}
        />
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
            <p
              className={`text-lg mb-4 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {blog.description}
            </p>
          )}

          {/* Blog Metadata */}
          <div
            className={`flex items-center gap-6 text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {blog.author && (
              <div className="flex items-center gap-2">
                <img
                  src={blog.author.image || "/imageProfile1.png"}
                  alt={blog.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <Link
                  href={`/profile/${blog.author.username}`}
                  className={`hover:underline font-medium ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
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
          <div
            className={`max-w-none mb-12 leading-relaxed whitespace-pre-wrap ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
        )}

        <hr
          className={`my-8 ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}
        />

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

          {/* Comment Input - Show only if authenticated */}
          {isAuthenticated ? (
            <div
              className={`w-full rounded p-4 mb-6 transition-colors ${
                isDarkMode ? "bg-[#23272a]" : "bg-gray-100"
              }`}
            >
              <textarea
                className={`bg-transparent w-full outline-none px-2 py-2 rounded text-sm resize-none ${
                  isDarkMode
                    ? "text-white placeholder-gray-500"
                    : "text-black placeholder-gray-400"
                }`}
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
          ) : (
            <div
              className={`w-full rounded p-4 mb-6 text-center transition-colors ${
                isDarkMode
                  ? "bg-[#23272a] text-gray-400"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <button
                onClick={() => setIsLoginActive(true)}
                className="text-[#f75555] hover:underline"
              >
                Sign in
              </button>
              {" "}to comment on this post
            </div>
          )}

          {/* Comments List */}
          <div className="flex flex-col gap-4">
            {comments.length === 0 ? (
              <p
                className={`text-center py-8 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className={`flex flex-col gap-2 p-4 rounded transition-colors ${
                    isDarkMode ? "bg-[#2c2f33]" : "bg-gray-100"
                  }`}
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
                            {comment.author?.name ||
                              comment.author?.username ||
                              "Anonymous"}
                          </Link>
                          <span
                            className={`text-xs block ${
                              isDarkMode
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {comment.author?._id === user?.id && (
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
                      <p
                        className={`text-sm mt-2 ${
                          isDarkMode
                            ? "text-gray-300"
                            : "text-gray-700"
                        }`}
                      >
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
                                {reply.author?.name ||
                                  reply.author?.username ||
                                  "Anonymous"}
                              </Link>
                              <span
                                className={`text-xs block ${
                                  isDarkMode
                                    ? "text-gray-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {reply.author?._id === user?.id && (
                              <button
                                onClick={() =>
                                  handleDeleteReply(comment._id, reply._id)
                                }
                                disabled={deletingIds.has(
                                  `${comment._id}-${reply._id}`
                                )}
                                className="text-red-500 text-xs hover:text-red-400 disabled:opacity-50"
                              >
                                {deletingIds.has(
                                  `${comment._id}-${reply._id}`
                                )
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            )}
                          </div>
                          <p
                            className={`text-sm mt-1 ${
                              isDarkMode
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Reply Input */}
                    {isAuthenticated && (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={replyInputs[comment._id] || ""}
                          onChange={(e) =>
                            handleReplyChange(comment._id, e.target.value)
                          }
                          placeholder="Write a reply..."
                          className={`flex-1 border rounded px-3 py-2 text-sm outline-none focus:border-[#f75555] transition-colors ${
                            isDarkMode
                              ? "bg-[#23272a] border-gray-600 text-white placeholder-gray-500"
                              : "bg-white border-gray-300 text-black placeholder-gray-400"
                          }`}
                          onKeyPress={(e) => {
                            if (e.key === "Enter")
                              handleAddReply(comment._id);
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
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      {isLoginActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <Login
            setIsLoginActive={setIsLoginActive}
            isDarkMode={isDarkMode}
            setIsSignupActive={setIsSignupActive}
          />
        </div>
      )}

      {isSignupActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <Signup
            setIsSignupActive={setIsSignupActive}
            isDarkMode={isDarkMode}
            setIsLoginActive={setIsLoginActive}
          />
        </div>
      )}
    </div>
  );
}
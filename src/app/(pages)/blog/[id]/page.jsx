"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Login from "@/components/LoginForm";
import Signup from "@/components/SignupForm";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import StarRating from "@/components/StarRating";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { FaRegClock, FaEdit, FaTrash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { getRandomProfileImage } from "@/lib/profileImage";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import BlogSkeleton from "../../../../components/Blogskeleton";

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [userRating, setUserRating] = useState(null);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    ratingCount: 0,
  });

  const isAuthor =
    blog?.author?._id === user?.id || blog?.author?._id === user?._id;

  const sanitizedContent = useMemo(() => {
    if (!blog?.content) return "";
    return DOMPurify.sanitize(blog.content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "blockquote",
        "pre",
        "code",
        "a",
        "img",
        "div",
        "span",
        "hr",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "class", "style", "target", "rel"],
      ALLOW_DATA_ATTR: false,
    });
  }, [blog?.content]);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setIsDarkMode(saved === "true");
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode, isInitialized]);

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
        setRatingStats({
          averageRating: data.averageRating || 0,
          ratingCount: data.ratingCount || 0,
        });
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load blog.");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [params.id]);

  useEffect(() => {
    async function fetchUserRating() {
      if (!params.id || !isAuthenticated) return;
      try {
        const data = await apiClient.getUserRating(params.id);
        setUserRating(data.userRating);
      } catch (err) {}
    }
    fetchUserRating();
  }, [params.id, isAuthenticated]);

  useEffect(() => {
    async function fetchComments() {
      if (!params.id) return;
      try {
        const res = await fetch(`/api/comments?postId=${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        setComments([]);
      }
    }
    fetchComments();
  }, [params.id]);

  const handleRate = async (rating) => {
    if (!isAuthenticated) {
      setIsLoginActive(true);
      return null;
    }
    try {
      const result = await apiClient.ratePost(params.id, rating);
      setUserRating(rating);
      setRatingStats({
        averageRating: result.averageRating,
        ratingCount: result.ratingCount,
      });
      toast.success("Rating submitted!");
      return result;
    } catch (error) {
      toast.error(error.message || "Failed to submit rating");
      return null;
    }
  };

  const handleDeletePost = async () => {
    setDeleting(true);
    try {
      await apiClient.deletePost(params.id);
      toast.success("Post deleted successfully");
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err) {
      toast.error(`Failed to delete post: ${err.message}`);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || !isAuthenticated || !user) {
      setIsLoginActive(true);
      return;
    }
    const userId = user.id || user._id;
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
      if (!res.ok)
        throw new Error(responseData.error || "Failed to post comment");
      setComments([responseData, ...comments]);
      setNewComment("");
      setBlog((prev) => ({
        ...prev,
        commentCount: (prev?.commentCount || 0) + 1,
      }));
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const toastId = toast.loading("Deleting comment...");
    setDeletingIds((prev) => new Set(prev).add(commentId));
    try {
      const res = await fetch(`/api/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete comment");
      setComments(comments.filter((c) => c._id !== commentId));
      setBlog((prev) => ({
        ...prev,
        commentCount: Math.max(0, (prev?.commentCount || 1) - 1),
      }));
      toast.success("Comment deleted", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to delete comment", { id: toastId });
    } finally {
      setDeletingIds((prev) => {
        const s = new Set(prev);
        s.delete(commentId);
        return s;
      });
    }
  };

  const handleReplyChange = (commentId, value) =>
    setReplyInputs({ ...replyInputs, [commentId]: value });

  const handleAddReply = async (commentId) => {
    const reply = replyInputs[commentId]?.trim();
    if (!reply || !isAuthenticated || !user) {
      setIsLoginActive(true);
      return;
    }
    const userId = user.id || user._id;
    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: userId, content: reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post reply");
      setComments(
        comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: [data, ...(c.replies || [])] }
            : c,
        ),
      );
      setReplyInputs({ ...replyInputs, [commentId]: "" });
      toast.success("Reply posted!");
    } catch (err) {
      toast.error(err.message || "Failed to post reply");
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const deleteKey = `${commentId}-${replyId}`;
    const toastId = toast.loading("Deleting reply...");
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
            : c,
        ),
      );
      toast.success("Reply deleted", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to delete reply", { id: toastId });
    } finally {
      setDeletingIds((prev) => {
        const s = new Set(prev);
        s.delete(deleteKey);
        return s;
      });
    }
  };

  if (!isInitialized) return null;

  if (loading) {
    return <BlogSkeleton isDarkMode={isDarkMode} />;
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center gap-4 transition-colors duration-500 px-4 ${isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"}`}
      >
        <p className="text-red-500 text-lg text-center">{error}</p>
        <Link href="/" className="text-[#f75555] hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center gap-4 transition-colors duration-500 px-4 ${isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"}`}
      >
        <p className="text-xl text-center">Blog not found.</p>
        <Link href="/" className="text-[#f75555] hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"}`}
    >
      <div className="fixed top-0 w-full flex justify-center z-50">
        <Navbar
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          setIsLoginActive={setIsLoginActive}
          setIsSignupActive={setIsSignupActive}
        />
      </div>

      <div className="max-w-[1280px] mx-auto pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="text-[#f75555] hover:underline text-sm mb-3 sm:mb-4 inline-block"
          >
            ← Back to Blogs
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words flex-1">
              {blog.title}
            </h1>
            {isAuthenticated && isAuthor && (
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/edit/${params.id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium bg-red-600 hover:bg-red-700 text-white ${deleting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>

          {blog.description && (
            <p
              className={`text-base sm:text-lg mb-3 sm:mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {blog.description}
            </p>
          )}

          <div className="mb-4">
            <StarRating
              postId={params.id}
              initialRating={ratingStats.averageRating}
              initialCount={ratingStats.ratingCount}
              userRating={userRating}
              onRate={handleRate}
              isAuthenticated={isAuthenticated}
              isAuthor={isAuthor}
              size="lg"
              showCount={true}
              isDarkMode={isDarkMode}
            />
          </div>

          <div
            className={`flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {blog.author && (
              <div className="flex items-center gap-2">
                <img
                  src={getRandomProfileImage(
                    blog.author.image,
                    blog.author.username || blog.author.email,
                  )}
                  alt={blog.author.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                />
                <Link
                  href={`/profile/${blog.author.username}`}
                  className={`hover:underline font-medium ${isDarkMode ? "text-white" : "text-black"}`}
                >
                  {blog.author.name || blog.author.username}
                </Link>
              </div>
            )}
            {blog.createdAt && (
              <div className="flex items-center gap-1">
                <FaRegClock className="flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {blog.views !== undefined && (
              <div className="flex items-center gap-1">
                <IoEyeOutline className="flex-shrink-0" />
                <span className="whitespace-nowrap">{blog.views} views</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BiComment className="flex-shrink-0" />
              <span className="whitespace-nowrap">
                {comments.length} comments
              </span>
            </div>
          </div>
        </div>

        {sanitizedContent && (
          <div
            className={`max-w-none mb-8 sm:mb-12 leading-relaxed text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </div>
        )}

        <hr
          className={`my-6 sm:my-8 ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}
        />

        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Comments ({comments.length})
          </h2>

          {isAuthenticated ? (
            <div
              className={`w-full rounded p-3 sm:p-4 mb-4 sm:mb-6 transition-colors ${isDarkMode ? "bg-[#23272a]" : "bg-gray-100"}`}
            >
              <textarea
                className={`bg-transparent w-full outline-none px-2 py-2 rounded text-sm resize-none ${isDarkMode ? "text-white placeholder-gray-500" : "text-black placeholder-gray-400"}`}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <button
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
                className="mt-3 bg-[#f75555] hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          ) : (
            <div
              className={`w-full rounded p-3 sm:p-4 mb-4 sm:mb-6 text-center transition-colors text-sm sm:text-base ${isDarkMode ? "bg-[#23272a] text-gray-400" : "bg-gray-100 text-gray-600"}`}
            >
              <button
                onClick={() => setIsLoginActive(true)}
                className="text-[#f75555] hover:underline"
              >
                Sign in
              </button>{" "}
              to comment on this post
            </div>
          )}

          <div className="flex flex-col gap-3 sm:gap-4">
            {comments.length === 0 ? (
              <p
                className={`text-center py-6 sm:py-8 text-sm sm:text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className={`flex flex-col gap-2 p-3 sm:p-4 rounded transition-colors ${isDarkMode ? "bg-[#2c2f33]" : "bg-gray-100"}`}
                >
                  <div className="flex gap-2 sm:gap-3">
                    <img
                      src={getRandomProfileImage(
                        comment.author?.image,
                        comment.author?.username || comment.author?.email,
                      )}
                      alt={comment.author?.name || "User"}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#f75555] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/profile/${comment.author?.username}`}
                            className="font-semibold text-sm sm:text-base text-[#f75555] hover:underline truncate block"
                          >
                            {comment.author?.name ||
                              comment.author?.username ||
                              "Anonymous"}
                          </Link>
                          <span
                            className={`text-xs block ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                          >
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {comment.author?._id === user?.id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            disabled={deletingIds.has(comment._id)}
                            className="text-red-500 text-xs hover:text-red-400 disabled:opacity-50 flex-shrink-0"
                          >
                            {deletingIds.has(comment._id)
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-2 break-words ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  <div className="ml-8 sm:ml-10 md:ml-12 mt-2 sm:mt-3 flex flex-col gap-2 sm:gap-3">
                    {(comment.replies || []).map((reply) => (
                      <div key={reply._id} className="flex gap-2 sm:gap-3">
                        <img
                          src={getRandomProfileImage(
                            reply.author?.image,
                            reply.author?.username || reply.author?.email,
                          )}
                          alt={reply.author?.name || "User"}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#f75555] flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/profile/${reply.author?.username}`}
                                className="font-semibold text-xs sm:text-sm text-[#f75555] hover:underline truncate block"
                              >
                                {reply.author?.name ||
                                  reply.author?.username ||
                                  "Anonymous"}
                              </Link>
                              <span
                                className={`text-xs block ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
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
                                  `${comment._id}-${reply._id}`,
                                )}
                                className="text-red-500 text-xs hover:text-red-400 disabled:opacity-50 flex-shrink-0"
                              >
                                {deletingIds.has(`${comment._id}-${reply._id}`)
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            )}
                          </div>
                          <p
                            className={`text-xs sm:text-sm mt-1 break-words ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isAuthenticated && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-1">
                        <input
                          type="text"
                          value={replyInputs[comment._id] || ""}
                          onChange={(e) =>
                            handleReplyChange(comment._id, e.target.value)
                          }
                          placeholder="Write a reply..."
                          className={`flex-1 border rounded px-3 py-2 text-sm outline-none focus:border-[#f75555] transition-colors ${isDarkMode ? "bg-[#23272a] border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-300 text-black placeholder-gray-400"}`}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleAddReply(comment._id);
                          }}
                        />
                        <button
                          onClick={() => handleAddReply(comment._id)}
                          disabled={!replyInputs[comment._id]?.trim()}
                          className="bg-[#f75555] hover:bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors flex-shrink-0"
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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePost}
        isDarkMode={isDarkMode}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        isDeleting={deleting}
      />

      {isLoginActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Login
            setIsLoginActive={setIsLoginActive}
            isDarkMode={isDarkMode}
            setIsSignupActive={setIsSignupActive}
          />
        </div>
      )}

      {isSignupActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

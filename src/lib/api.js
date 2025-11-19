// src/lib/api.js - COMPLETE FIXED VERSION FOR NEXT.JS 15

class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXTAUTH_URL || "";
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = options.headers ? { ...options.headers } : {};
    const body = options.body;

    if (body instanceof FormData) {
      if (headers["Content-Type"]) delete headers["Content-Type"];
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    const config = {
      method: options.method || "GET",
      headers,
      credentials: "include",
      body:
        body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        let errorData = null;

        try {
          if (contentType.includes("application/json")) {
            errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        const error = new Error(errorMessage || "An unknown error occurred");
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      if (response.status === 204) return null;

      if (contentType.includes("application/json")) return response.json();
      return response.text();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      if (error.message) {
        throw error;
      } else {
        const newError = new Error("Network request failed");
        newError.status = error.status || 500;
        throw newError;
      }
    }
  }

  // ===== USER METHODS =====
  async getUserInfo() {
    try {
      return await this.request("/api/user/home");
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      throw error;
    }
  }

  async getUserByUsername(username) {
    if (!username) {
      throw new Error("Username is required");
    }

    try {
      return await this.request(`/api/user/${encodeURIComponent(username)}`);
    } catch (error) {
      console.error(`Failed to fetch user ${username}:`, error);
      throw error;
    }
  }

  async getUserInfoByUsername(username) {
    if (!username) {
      throw new Error("Username is required");
    }

    try {
      return await this.request(`/api/user/${encodeURIComponent(username)}`);
    } catch (error) {
      console.error(`Failed to fetch user info for ${username}:`, error);
      throw error;
    }
  }

  async getUserStats(username) {
    if (!username) {
      throw new Error("Username is required");
    }

    try {
      return await this.request(`/api/user/stats/${encodeURIComponent(username)}`);
    } catch (error) {
      console.error(`Failed to fetch stats for ${username}:`, error);
      // Return default stats instead of throwing
      return {
        followers: 0,
        following: 0,
        totalPosts: 0,
        totalViews: 0,
        avgRating: 0,
      };
    }
  }

  async getUserPosts(username) {
    if (!username) {
      throw new Error("Username is required");
    }

    try {
      return await this.request(`/api/user/posts/${encodeURIComponent(username)}`);
    } catch (error) {
      console.error(`Failed to fetch posts for ${username}:`, error);
      // Return empty posts array instead of throwing
      return { posts: [], count: 0 };
    }
  }

  async updateUserProfile(data) {
    try {
      return await this.request("/api/protected/user/update", {
        method: "POST",
        body: data,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  // ===== FOLLOW METHODS =====
  async toggleFollow(targetUserId) {
    if (!targetUserId) {
      throw new Error("Target user ID is required");
    }

    try {
      return await this.request("/api/follow", {
        method: "POST",
        body: { targetUserId },
      });
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      throw error;
    }
  }

  async getFollowers(userId) {
    try {
      return await this.request(`/api/user/${userId}/followers`);
    } catch (error) {
      console.error("Failed to fetch followers:", error);
      return [];
    }
  }

  async getFollowing(userId) {
    try {
      return await this.request(`/api/user/${userId}/following`);
    } catch (error) {
      console.error("Failed to fetch following:", error);
      return [];
    }
  }

  // ===== BLOG METHODS =====
  async getAllPosts() {
    try {
      const res = await fetch("/api/blogposts");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Failed to fetch all posts:", err);
      return []; // ← THIS FIXES THE ONE-TIME ERROR
    }
  }


  async getBlogById(id) {
    if (!id) {
      throw new Error("Blog ID is required");
    }

    try {
      return await this.request(`/api/blogs/${id}`);
    } catch (error) {
      console.error(`Failed to fetch blog ${id}:`, error);
      return null;
    }
  }

  async createPost(postData) {
    try {
      return await this.request("/api/protected/blogposts", {
        method: "POST",
        body: postData,
      });
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  }

  async updatePost(postId, postData) {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    try {
      return await this.request(`/api/blogs/${postId}`, {
        method: "PATCH",
        body: postData,
      });
    } catch (error) {
      console.error(`Failed to update post ${postId}:`, error);
      throw error;
    }
  }

  async deletePost(postId) {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    try {
      return await this.request(`/api/blogs/${postId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete post ${postId}:`, error);
      throw error;
    }
  }

  // ===== RATING METHODS (ENHANCED) =====
  async ratePost(postId, rating) {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    try {
      const result = await this.request(`/api/blogs/${postId}/rating`, {
        method: "POST",
        body: { rating },
      });

      console.log("Rating submitted successfully:", result);
      return result;
    } catch (error) {
      console.error("Rating submission failed:", error);

      // ✅ Provide user-friendly error messages
      if (error.status === 401) {
        throw new Error("Please log in to rate this post");
      } else if (error.status === 403) {
        throw new Error("You cannot rate your own post");
      } else if (error.status === 400) {
        throw new Error(error.message || "Invalid rating. Please try again.");
      } else if (error.message.includes("Invalid user ID")) {
        throw new Error("Session error. Please log out and log back in.");
      }

      throw new Error(error.message || "Failed to submit rating. Please try again.");
    }
  }

  async getUserRating(postId) {
    if (!postId) {
      return { userRating: null, averageRating: 0, ratingCount: 0 };
    }

    try {
      return await this.request(`/api/blogs/${postId}/rating`);
    } catch (error) {
      console.error("Failed to fetch user rating:", error);
      // Don't throw error, just return null rating
      return { userRating: null, averageRating: 0, ratingCount: 0 };
    }
  }

  async deleteRating(postId) {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    try {
      return await this.request(`/api/blogs/${postId}/rating`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete rating:", error);
      throw new Error(error.message || "Failed to delete rating");
    }
  }

  // ===== TRENDING/LATEST/FOR YOU =====
  async getTrendingBlogs() {
    try {
      return await this.request("/api/blogposts/trending");
    } catch (error) {
      console.error("Failed to fetch trending blogs:", error);
      return { posts: [] };
    }
  }

  async getLatestBlogs() {
    try {
      return await this.request("/api/blogposts/latest");
    } catch (error) {
      console.error("Failed to fetch latest blogs:", error);
      return { posts: [] };
    }
  }

  async getForYouBlogs() {
    try {
      return await this.request("/api/blogposts/for-you");
    } catch (error) {
      console.error("Failed to fetch for you blogs:", error);
      return { posts: [] };
    }
  }

  // ===== COMMENT METHODS (IF NEEDED) =====
  async getComments(postId) {
    if (!postId) {
      return [];
    }

    try {
      return await this.request(`/api/blogs/${postId}/comments`);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      return [];
    }
  }

  async addComment(postId, commentData) {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    try {
      return await this.request(`/api/blogs/${postId}/comments`, {
        method: "POST",
        body: commentData,
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error;
    }
  }

  async deleteComment(postId, commentId) {
    if (!postId || !commentId) {
      throw new Error("Post ID and Comment ID are required");
    }

    try {
      return await this.request(`/api/blogs/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  }

  // ===== LIKE METHODS (IF NEEDED) =====
  async toggleLike(postId) {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    try {
      return await this.request(`/api/blogs/${postId}/like`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      throw error;
    }
  }

  // ===== SEARCH METHODS =====
  async searchUsers(query) {
    if (!query) {
      return [];
    }

    try {
      return await this.request(`/api/search/users?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error("Failed to search users:", error);
      return [];
    }
  }

  async searchPosts(query) {
    if (!query) {
      return [];
    }

    try {
      return await this.request(`/api/search/posts?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error("Failed to search posts:", error);
      return [];
    }
  }
}

export const apiClient = new ApiClient();
// src/lib/api.js - COMPLETE VERSION WITH RATING METHODS

class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "";
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
    return this.request("/api/user/home");
  }

  async getUserByUsername(username) {
    return this.request(`/api/user/${encodeURIComponent(username)}`);
  }

  async getUserInfoByUsername(username) {
    return this.request(`/api/user/${encodeURIComponent(username)}`);
  }

  async getUserStats(username) {
    return this.request(`/api/user/stats/${encodeURIComponent(username)}`);
  }

  async getUserPosts(username) {
    return this.request(`/api/user/posts/${encodeURIComponent(username)}`);
  }

  async updateUserProfile(data) {
    return this.request("/api/protected/user/update", {
      method: "PATCH",
      body: data,
    });
  }

  // ===== FOLLOW METHODS =====
  async toggleFollow(targetUserId) {
    return this.request("/api/follow", {
      method: "POST",
      body: { targetUserId },
    });
  }

  // ===== BLOG METHODS =====
  async getAllPosts() {
    return this.request("/api/blogposts");
  }

  async getBlogById(id) {
    try {
      return await this.request(`/api/blogs/${id}`);
    } catch (err) {
      console.error("Failed to fetch blog:", err.message);
      return null;
    }
  }

  async createPost(postData) {
    return this.request("/api/protected/blogposts", {
      method: "POST",
      body: postData,
    });
  }

  async updatePost(postId, postData) {
    return this.request(`/api/blogs/${postId}`, {
      method: "PATCH",
      body: postData,
    });
  }

  async deletePost(postId) {
    return this.request(`/api/blogs/${postId}`, {
      method: "DELETE",
    });
  }

  // ===== RATING METHODS =====
  async ratePost(postId, rating) {
    return this.request(`/api/blogs/${postId}/rating`, {
      method: "POST",
      body: { rating },
    });
  }

  async getUserRating(postId) {
    return this.request(`/api/blogs/${postId}/rating`);
  }

  async deleteRating(postId) {
    return this.request(`/api/blogs/${postId}/rating`, {
      method: "DELETE",
    });
  }

  // ===== TRENDING/LATEST =====
  async getTrendingBlogs() {
    return this.request("/api/blogposts/trending");
  }

  async getLatestBlogs() {
    return this.request("/api/blogposts/latest");
  }

  async getForYouBlogs() {
    return this.request("/api/blogposts/for-you");
  }
}

export const apiClient = new ApiClient();
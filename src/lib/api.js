// lib/api.js (Updated)
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
        let errorMessage = `HTTP ${response.status}`;
        try {
          if (contentType.includes("application/json")) {
            const errData = await response.json();
            errorMessage =
              errData.error || errData.message || JSON.stringify(errData);
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      if (response.status === 204) return null;

      if (contentType.includes("application/json")) return response.json();
      return response.text();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ✅ User-related methods
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

  // ✅ Follow methods (NEW)
  async toggleFollow(targetUserId) {
    return this.request("/api/follow", {
      method: "POST",
      body: { targetUserId },
    });
  }

  // ✅ Blog methods
  async getAllPosts() {
    return this.request("/api/blogposts");
  }

  async getBlogById(id) {
    try {
      return await this.request(`/api/blogposts/${id}`);
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

  // ✅ Trending
  async getTrendingBlogs() {
    return this.request("/api/blogposts/trending");
  }

  // ✅ Latest
  async getLatestBlogs() {
    return this.request("/api/blogposts/latest");
  }

  // ✅ For You
  async getForYouBlogs() {
    return this.request("/api/blogposts/for-you");
  }
}

export const apiClient = new ApiClient();
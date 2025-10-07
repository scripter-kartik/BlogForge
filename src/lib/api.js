// src/lib/api.js - NEW CENTRALIZED API CLIENT
class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // User methods
  async getUserInfo() {
    return this.request("/api/user/home");
  }

  async getUserStats(username) {
    return this.request(`/api/user/stats/${username}`);
  }

  async getUserPosts(username) {
    return this.request(`/api/protected/user/posts/${username}`);
  }

  async updateUserProfile(data) {
    return this.request("/api/protected/user/update", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Blog methods
  async getAllPosts() {
    return this.request("/api/blogposts");
  }

  async createPost(postData) {
    return this.request("/api/protected/blogposts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }
}

export const apiClient = new ApiClient();

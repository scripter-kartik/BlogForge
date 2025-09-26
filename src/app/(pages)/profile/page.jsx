"use client";

import Navbar from "../../../components/Navbar.jsx";
import { useEffect, useState } from "react";

export default function Profile() {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loginDone, setLoginDone] = useState(true);
  const [signupDone, setSignupDone] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    bio: "",
    password: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserInfo(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (userInfo?.username) {
      fetch(`/api/user/stats/${userInfo.username}`)
        .then((res) => res.json())
        .then((data) => setUserStats(data))
        .catch((error) => console.log(error));
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo?.username) {
      fetch(`/api/user/posts/${userInfo.username}`)
        .then((res) => res.json())
        .then((data) => setUserPosts(data.posts))
        .catch((err) => console.error(err));
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        username: userInfo.username || "",
        email: userInfo.email || "",
        name: userInfo.name || "",
        bio: userInfo.bio || "",
        password: "",
      });
    }
  }, [userInfo]);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully!");

        // Update localStorage + state
        localStorage.setItem("user", JSON.stringify(data.user));
        setUserInfo(data.user);
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div
      className={`flex flex-col items-center h-screen w-screen ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      } transition-colors duration-500`}
    >
      <Navbar
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
        setIsDarkMode={setIsDarkMode}
        isDarkMode={isDarkMode}
        loginDone={loginDone}
        signupDone={signupDone}
        setLoginDone={setLoginDone}
      />
      <div
        className={`mt-32 flex flex-col w-[1280px] ${
          isDarkMode ? "text-white" : "text-black"
        } transition-colors duration-500`}
      >
        <div className="flex items-center justify-around w-[1280px] ml-10 overflow-hidden">
          <div className="flex flex-col items-center gap-4 mt-12">
            <img
              className="w-64 h-64 rounded-full object-cover border-4 border-red-500"
              src="/imageProfile1.png"
              alt=""
            />
            <div className="flex gap-4">
              <p>0 followers</p>
              <p>0 following</p>
            </div>
            <div className="flex gap-4">
              <p>{userStats?.totalPosts || 0} posts</p>
              <p>Avg Rating: {userStats?.avgRating?.toFixed(2) || 0.0}</p>
            </div>
            <p className="text-gray-500 text-sm">
              Member since August{" "}
              {userInfo?.createdAt
                ? new Date(userInfo.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
            <button
              onClick={handleLogout}
              className="border-[1px] border-red-500 text-red-500 px-4 py-1 rounded hover:text-red-600 hover:border-red-600"
            >
              Logout
            </button>
          </div>
          <div className="flex flex-col gap-4 items-start">
            <h1 className="text-4xl font-bold mb-8">
              Welcome, {userInfo?.name || "User"}
            </h1>
            <div className="flex flex-col">
              <label htmlFor="username" className="text-sm font-light">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={`w-[800px] h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-light">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-[800px] h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-light">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-[800px] h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="bio" className="text-sm font-light">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className={`w-[800px] px-3 py-2 font-light rounded h-[120px] resize-none outline-none border-none ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
                placeholder="Tell us something..."
              ></textarea>
            </div>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded ${
                isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
              } transition-colors duration-500`}
            >
              Save changes
            </button>
          </div>
        </div>
        <div className="mt-32">
          <div className="flex items-center gap-5">
            <h1 className="text-3xl">Your posts</h1>
            <div className="border-t-2 w-[1100px] border-red-500"></div>
          </div>
          {userPosts?.length > 0 ? (
            userPosts.map((post) => (
              <div key={post._id} className="border p-4 mb-3 rounded">
                <h3 className="text-xl font-bold">{post.title}</h3>
                <p className="text-gray-600">{post.description}</p>
              </div>
            ))
          ) : (
            <p>You haven't written any posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

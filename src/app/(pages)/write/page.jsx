"use client";

import Navbar from "../../../components/Navbar.jsx";
import BlogEditor from "../../../components/BlogEditor.jsx";
import { GrGallery } from "react-icons/gr";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation.js";
import { usePosts } from "@/context/PostsContext.jsx";

const page = () => {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loginDone, setLoginDone] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [randomColor, setRandomColor] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();
  const [posts, setPosts] = usePosts();

  useEffect(() => {
    const colors = [
      "bg-gradient-to-r from-purple-500 to-pink-500",
      "bg-gradient-to-r from-blue-500 to-cyan-500",
      "bg-gradient-to-r from-green-500 to-teal-500",
      "bg-gradient-to-r from-orange-500 to-red-500",
      "bg-gradient-to-r from-indigo-500 to-purple-500",
      "bg-gradient-to-r from-pink-500 to-rose-500",
      "bg-gradient-to-r from-yellow-500 to-orange-500",
      "bg-gradient-to-r from-emerald-500 to-blue-500",
      "bg-gradient-to-r from-violet-500 to-fuchsia-500",
      "bg-gradient-to-r from-cyan-500 to-blue-500",
      "bg-gradient-to-r from-red-500 to-pink-500",
      "bg-gradient-to-r from-lime-500 to-green-500",
    ];

    const randomIndex = Math.floor(Math.random() * colors.length);
    setRandomColor(colors[randomIndex]);
  }, []);

  const postData = {
    title,
    description,
    tags: tag.split(",").map((t) => t.trim()),
    coverImage,
  };

  async function handlePublish() {
    try {
      const response = await fetch("/api/blogposts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await response.json();

      if (response.ok) {
        setPosts([...posts, data]);
        setTitle("");
        setDescription("");
        setTag("");
        alert("Post published");
        router.push("/");
      } else {
        alert("There is an error in post publishing");
      }
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCoverImage(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select a valid image file");
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`flex flex-col items-center min-h-screen w-full ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f4f6f8]"
      } transition-colors duration-500 `}
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
      <div className="flex mt-44 w-[1280px] justify-between">
        <div
          className={`flex flex-col gap-6 items-start ${
            isDarkMode ? "text-white" : "text-black"
          } transition-color duration-500`}
        >
          <input
            className={`w-72 h-10 px-2 py-2 border rounded ${
              isDarkMode
                ? "bg-[#27272A] border-[#3f3f46]"
                : "bg-[#FFFFFF] border-black"
            } transition-colors duration-500`}
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="relative">
            <input
              className={`w-72 h-16 text-start px-2 border rounded ${
                isDarkMode
                  ? "bg-[#27272A] border-[#3f3f46]"
                  : "bg-[#FFFFFF] border-black"
              } transition-colors duration-500`}
              type="text"
              placeholder="Post description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="absolute right-0 top-[70px] text-[12px]">0/250</p>
          </div>
          <input
            className={`w-72 h-10 px-2 py-2 mt-4 border rounded ${
              isDarkMode
                ? "bg-[#27272A] border-[#3f3f46]"
                : "bg-[#FFFFFF] border-black"
            } transition-colors duration-500`}
            type="text"
            placeholder="Tags (comma-seperated)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />

          <div className="flex items-center gap-2 font-semibold">
            <GrGallery />
            <button onClick={handleUploadClick}>Upload Cover</button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            className={`w-72 h-40 rounded-lg cursor-pointer relative overflow-hidden ${
              coverImage ? "" : randomColor
            }`}
            onClick={handleUploadClick}
          >
            {coverImage ? (
              <>
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors z-10"
                  title="Remove image"
                >
                  ×
                </button>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">
                    Click to change image
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <GrGallery className="mx-auto mb-2 text-2xl" />
                  <p className="text-sm">Click to upload image</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePublish}
            className={`w-72 border p-2 mt-6 rounded-full ${
              isDarkMode
                ? "hover:bg-[#FFFFFF] hover:text-black border-white"
                : "hover:bg-[#27272A] hover:text-white border-black"
            } transition-colors duration-300`}
          >
            Publish Post
          </button>
        </div>
        <BlogEditor isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default page;

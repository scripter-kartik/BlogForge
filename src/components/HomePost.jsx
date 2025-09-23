import { FaRegStar } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { FaRegClock } from "react-icons/fa";
import { useState } from "react";

export default function HomePosts({ isDarkMode, loginDone, signupDone }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Building Scalable REST APIs with Node.js and Express",
      description:
        "Learn how to build scalable, maintainable REST APIs using Node.js and Express...",
      coverImage: "/imagePost1.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["NODE.JS", "EXPRESS", "REST API"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Featured",
    },
    {
      id: 2,
      title: "How AI is Revolutionizing Code Review Workflows",
      description:
        "Explore how AI is transforming code reviews, cutting review time, spotting bugs, summarizing pull requests, and enabling smarter suggestions...",
      coverImage: "/imagePost2.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["AI", "CODE REVIEW", "DEVELOPER TOOLS"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Featured",
    },
    {
      id: 3,
      title: "Getting Started With Next.js 14",
      description:
        "A beginner-friendly guide to building a blazing fast web app with Next.js 14...",
      coverImage: "/imagePost3.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["WEB DEVELOPMENT", "NEXT JS", "FULL STACK"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Trending",
    },
    // Add more posts here
  ]);

  const [suggestedUsers] = useState(
    Array(10).fill({
      name: "mellobytes",
      bio: "Hello! I am a tech enthusiast based in New Delhi",
      image: "/imageProfile1.png",
    })
  );

  const handlePublish = () => {
    const newPost = {
      id: posts.length + 1,
      title: "New Dynamic Post",
      description: "This is a dynamically added post.",
      coverImage: "/imagePost1.png",
      authorName: "newAuthor",
      authorImage: "/imageProfile1.png",
      tags: ["DYNAMIC", "REACT"],
      starRating: 5,
      views: 0,
      commentCount: 0,
      estimatedRead: 1,
      category: "Latest",
    };
    setPosts([newPost, ...posts]);
  };

  const renderPostsByCategory = (category) => {
    return posts
      .filter((post) => post.category === category)
      .map((post) => (
        <div key={post.id} className="w-[1280px] mt-8 cursor-pointer">
          <div
            className={`w-[1280px] ${
              isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black bg-[#eeeded]"
            } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
          >
            <img
              className="w-52 h-40 object-cover rounded-lg"
              src={post.coverImage}
              alt=""
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-xl">{post.title}</h1>
                <div className="flex items-center gap-2 mr-5">
                  <img
                    className="w-6 h-6 rounded-full"
                    src={post.authorImage}
                    alt=""
                  />
                  <p>{post.authorName}</p>
                </div>
              </div>
              <p>{post.description}</p>
              <div className="flex items-center gap-2">
                {post.tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className={`${
                      isDarkMode ? "bg-[#454343]" : "bg-transparent"
                    } p-1 text-sm text-center transition-colors duration-500`}
                  >
                    {tag}
                  </div>
                ))}
              </div>
              <div
                className={`${
                  isDarkMode ? "text-white" : "text-black"
                } flex items-center gap-4 text-sm`}
              >
                <div className="flex items-center gap-1">
                  <FaRegStar />
                  <p>{post.starRating}.0</p>
                </div>
                <div className="flex items-center gap-1">
                  <IoEyeOutline />
                  <p>{post.views}</p>
                </div>
                <div className="flex items-center gap-1">
                  <BiComment />
                  <p>{post.commentCount}</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaRegClock />
                  <p>{post.estimatedRead} min read</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ));
  };

  return (
    <div className="w-[1280px] mt-[165px] mb-[70px]">
      {/* Featured Posts */}
      <div className="flex items-center gap-5 justify-between">
        <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}>
          Featured posts
        </h1>
        <hr className="w-[1055px] border-t-[1px] border-[#f75555]" />
      </div>
      {renderPostsByCategory("Featured")}

      {/* Suggested Users */}
      {(loginDone || signupDone) && (
        <div>
          <div className="flex items-center gap-5 justify-between mt-28">
            <h1
              className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}
            >
              Suggested Users
            </h1>
            <hr className="w-[1030px] border-t-[1px] border-[#f75555]" />
          </div>
          <div className="flex mt-16 gap-4 w-[1280px] overflow-x-auto [&::-webkit-scrollbar]:hidden bg-gradient-to-r from-black/10 via-transparent to-black/10">
            {suggestedUsers.map((user, index) => (
              <div key={index}>
                <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
                  <img
                    className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                    src={user.image}
                    alt=""
                  />
                  <div>
                    <h1 className="text-white font-bold">{user.name}</h1>
                    <p className="text-[#7a7a7a] text-sm">{user.bio}</p>
                  </div>
                  <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Posts */}
      <div className="flex items-center gap-5 mt-32 justify-between">
        <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}>
          Trending posts
        </h1>
        <hr className="w-[1055px] border-t-[1px] border-[#f75555]" />
      </div>
      {renderPostsByCategory("Trending")}

      {/* Latest Posts */}
      <div className="flex items-center gap-5 mt-32 justify-between">
        <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}>
          Latest posts
        </h1>
        <hr className="w-[1055px] border-t-[1px] border-[#f75555]" />
      </div>
      {renderPostsByCategory("Latest")}
    </div>
  );
}

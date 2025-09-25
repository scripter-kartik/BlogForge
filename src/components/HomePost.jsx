import { FaRegStar } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { FaRegClock } from "react-icons/fa";
import { useEffect, useState } from "react";
import { usePosts } from "@/context/PostsContext";

export default function HomePosts({ isDarkMode, loginDone, signupDone }) {
  const { posts, setPosts } = usePosts();

  useEffect(() => {
    async function fetchData() {
      try {
        const api = await fetch("/api/blogposts");
        const data = await api.json();
        console.log(data);
        setPosts(data);
      } catch (error) {
        console.error("Error in HomePost:", error);
      }
    }
    fetchData();
  }, [setPosts]);

  const [suggestedUsers] = useState(
    Array(10).fill({
      name: "mellobytes",
      bio: "Hello! I am a tech enthusiast based in New Delhi",
      image: "/imageProfile1.png",
    })
  );

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
            <div className="flex flex-col gap-3 w-[1280px]">
              <div className="flex flex-row justify-between items-center">
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
      <div className="flex items-center gap-5 justify-between">
        <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}>
          Featured posts
        </h1>
        <hr className="w-[1055px] border-t-[1px] border-[#f75555]" />
      </div>
      {renderPostsByCategory("Featured")}

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

      <div className="flex items-center gap-5 mt-32 justify-between">
        <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}>
          Trending posts
        </h1>
        <hr className="w-[1055px] border-t-[1px] border-[#f75555]" />
      </div>
      {renderPostsByCategory("Trending")}

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

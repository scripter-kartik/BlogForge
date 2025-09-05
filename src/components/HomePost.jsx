import { FaRegStar } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { FaRegClock } from "react-icons/fa";

export default function HomePosts({ isDarkMode, loginDone, signupDone }) {
  return (
    <div className="w-[1280px] mt-[165px] mb-[70px]">
      <div className="flex items-center gap-5 justify-between">
        <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}>
          Featured posts
        </h1>
        <hr className="w-[1055px] border-t-[1px] border-[#f75555]" />
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost1.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Building Scalable REST APIs with Node.js and Express
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Learn how to build scalable, maintainable REST APIs using Node.js
              and Express. This technical guide covers project structure,
              routing, middleware, error handling, and best practices to create
              robust backends for modern applications.
            </p>
            <div className="flex items-center gap-2 transition-colors duration-500">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } w-[90px] p-1 text-sm text-center transition-colors duration-500`}
              >
                NODE.JS
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } w-[90px] p-1 text-sm text-center transition-colors duration-500`}
              >
                EXPRESS
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } w-[90px] p-1 text-sm text-center transition-colors duration-500`}
              >
                REST API
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost2.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                How AI is Revolutionizing Code Review Workflows
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Explore how AI is transforming code reviews,cutting review time,
              spotting bugs, summarizing pull requests, and enabling smarter
              suggestions. Learn how tools like Copilot and CodiumAI enhance
              productivity, reduce fatigue, and future-proof development
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center`}
              >
                AI
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                }  p-1 text-sm text-center transition-colors duration-500`}
              >
                CODE REVIEW
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                DEVELOPER TOOLS
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm transition-colors duration-500`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center">
              <img
                className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                src="/imageProfile1.png"
                alt=""
              />
              <div>
                <h1 className="text-white font-bold">mellobytes</h1>
                <p className="text-[#7a7a7a] text-sm">
                  Hello! I am a tech enthusiast based in New Delhi
                </p>
              </div>
              <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2">
                Follow
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 mt-32 justify-between">
        <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}>
          Trending posts
        </h1>
        <hr className="w-[1055px] border-t-[1px] border-[#f75555]" />
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost3.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Getting Started With Next.js 14
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              A beginner-friendly guide to building a blazing fast web app with
              Next.js 14 — covering setup, new features like image optimization,
              and deployment to Vercel. Perfect for devs who want to get up and
              running quickly!
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                WEB DEVELOPMENT
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                NEXT JS
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                FULL STACK
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost4.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                What I Learned Teaching Myself to Code
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Teaching myself to code was messy: too many roadmaps, constant
              Googling, and feeling behind. But sticking to basics, building
              small projects, and finding a community finally helped me make
              real progress.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                SELF-TAUGHT DEVELOPER
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                TEAM-COLLABORATION
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                CODING BEST PRACTICES
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost5.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                ​The Power of Collaboration in Software Development
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Know why effective collaboration is essential in modern software
              development. Learn about key tools, proven strategies, and metrics
              to measure team success in building high-quality, maintainable
              software products together.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                SOFTWARE DEVELOPMENT
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                TEAM-COLLABORATION
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                CODING BEST PRACTICES
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost6.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Why Web Accessibility Should Be a Priority in Your Development
                Workflow
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Web accessibility isn’t a luxury,it’s a necessity. Learn what
              accessibility means, why it matters, and how to implement best
              practices in your frontend development workflow to create
              inclusive, legally compliant, and user-friendly websites.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                WEB ACCESSIBILITY
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                INCLUSIVE DESIGN
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                FRONTEND DEVELOPMENT
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost1.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Building Scalable REST APIs with Node.js and Express
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Learn how to build scalable, maintainable REST APIs using Node.js
              and Express. This technical guide covers project structure,
              routing, middleware, error handling, and best practices to create
              robust backends for modern applications.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                NODE.JS
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                EXPRESS
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                REST API
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost7.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Optimizing Your Postgres-Powered API: A Practical Guide
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              An in depth guide into optimizing PostgreSQL-based APIs for
              performance and scalability. Covers connection pooling, smart
              indexing, pagination, caching, and real query analysis. Ideal for
              backend devs aiming to fine-tune their Postgres stack.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center`}
              >
                POSTGRESQL
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center`}
              >
                API DESIGN
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center`}
              >
                BACKEND PERFORMANCE
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-5 mt-32 justify-between">
        <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-3xl`}>
          Latest posts
        </h1>
        <hr className="w-[1055px] border-t-[1px] border-[#f75555]" />
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost8.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Why Edge Computing is the Silent Revolution of the Internet
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              With AI and IoT growing rapidly, the demand for decentralized
              computation is no longer just a buzzword; it’s a necessity.
              Imagine a world where your devices don’t need to “ask the cloud”
              before acting. That’s what the future edge is enabling.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                #EDGECOMPUTING
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                #FUTUREOFTECH
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                #IOT
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost9.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Real-Time Web with WebSockets: A Beginner's Guide
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Learn how WebSockets enable real-time features like chat, live
              updates, and collaborative tools. This guide covers the basics,
              compares WebSockets to polling, and provides practical examples
              with Node.js and Socket.IO for developers building interact
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                WEBSOCKETS
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                REAL-TIME
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                NODEJS
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost10.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                An Introduction to Server-Side Rendering (SSR) for Web
                Developers
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Learn what Server-Side Rendering (SSR) is and why it's valuable
              for modern web development. This guide covers SSR basics,
              benefits, tradeoffs, and how to implement it with frameworks like
              Next.js to improve performance and SEO in real-world apps.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                SSR
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                NEXT.JS
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                REACT
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost11.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Debugging JavaScript Effectively: Tips for Real-World Issues
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              This post shares practical debugging techniques for JavaScript
              developers. Learn how to use DevTools, isolate bugs, step through
              async code, and prevent issues with linters. Build confidence and
              speed by improving how you find and fix errors.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                JAVASCRIPT
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                DEBUGGING
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                DEVTOOLS
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost12.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                ​Mastering Custom React Hooks: A Practical Guide
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              Learn how to create powerful and reusable custom React hooks. This
              guide walks you through real examples like useFetch and
              useLocalStorage, and explains best practices to write cleaner,
              more maintainable React code with custom logic.
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                REACT
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                HOOKS
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                CUSTOM HOOKS
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1280px] mt-8 cursor-pointer">
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2c2a2a]" : "text-black  bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500`}
        >
          <img
            className="w-52 h-40 object-cover rounded-lg"
            src="/imagePost13.png"
            alt=""
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">
                Getting Started with Open Source: A Developer's Guide
              </h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src="/imageProfile1.png"
                  alt=""
                />
                <p>lazysloth</p>
              </div>
            </div>
            <p>
              This guide helps developers take their first step into open
              source. Learn how to find beginner-friendly projects, set up your
              environment, contribute effectively, and become part of a global
              developer community
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                OPEN SOURCE
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                CONTRIBUTION
              </div>
              <div
                className={`${
                  isDarkMode ? "bg-[#454343]" : "bg-transparent"
                } p-1 text-sm text-center transition-colors duration-500`}
              >
                GIT
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar />
                <p>4.0</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>127</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>2</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>3 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

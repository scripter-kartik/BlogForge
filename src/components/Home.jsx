export default function Home({ isDarkMode, loginDone, signupDone }) {
  return (
    <div className="w-[1280px] mt-[130px] h-auto">
      {loginDone || signupDone ? (
        <div className="flex justify-between items-start">
          <div
            className={`flex flex-col gap-6 items-start mt-[28px] ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            <div className="flex flex-col gap-2 font-bold">
              <h1 className="text-5xl">Where developers</h1>
              <h1 className="text-6xl">Build, Write, and Share</h1>
            </div>
            <p className="text-xl w-[750px]">
              A space to share ideas, projects, lessons, and stories, and
              connect with a thriving community of tech enthusiasts.
            </p>
            <button
              className={`border-[1px] ${
                isDarkMode
                  ? "border-white hover:bg-white"
                  : "border-black hover:bg-black hover:text-white"
              } rounded-full px-6 py-[8px] mt-2 hover:text-black hover:animate-pulse`}
            >
              Join the community
            </button>
          </div>
          <div>
            <img className="w-96 h-80" src="/image.png" alt="" />
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col gap-10 justify-between items-start ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          <h1 className="text-4xl font-bold">
            Welcome back <span className="text-[#f75555]">kartikagarwal</span>!
          </h1>
          <div className="flex justify-center items-center gap-6">
            <div
              className={`flex flex-col gap-2 border-[1px] ${
                isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
              } shadow-lg w-[300px] h-[135px] rounded-xl p-5`}
            >
              <h1 className="text-xl font-bold">Views</h1>
              <h1 className="text-xl font-bold">0</h1>
              <p className="text-sm">+0.0% from last period</p>
            </div>
            <div
              className={`flex flex-col gap-2 border-[1px] ${
                isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
              } shadow-lg w-[300px] h-[135px] rounded-xl p-5`}
            >
              <h1 className="text-xl font-bold">Views/Post</h1>
              <h1 className="text-xl font-bold">0</h1>
            </div>
            <div
              className={`flex flex-col gap-2 border-[1px] ${
                isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
              } shadow-lg w-[300px] h-[135px] rounded-xl p-5`}
            >
              <h1 className="text-xl font-bold">Posts</h1>
              <h1 className="text-xl font-bold">0</h1>
            </div>
            <div
              className={`flex flex-col gap-2 border-[1px] ${
                isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
              } shadow-lg w-[300px] h-[135px] rounded-xl p-5`}
            >
              <h1 className="text-xl font-bold">Avg Rating</h1>
              <h1 className="text-xl font-bold">0.00</h1>
            </div>
          </div>
          <button
            className={`border-[1px] ${
              isDarkMode
                ? "border-white hover:bg-white"
                : "border-black hover:bg-black hover:text-white"
            } rounded-full px-6 py-[8px] mt-2 hover:text-black hover:animate-pulse w-[200px] h-[50px] text-lg`}
          >
            Write a post
          </button>
        </div>
      )}
    </div>
  );
}

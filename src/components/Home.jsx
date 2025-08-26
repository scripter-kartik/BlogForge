export default function Home({ isDarkMode }) {
  return (
    <div className="w-[1280px] mt-[130px] h-auto">
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
            A space to share ideas, projects, lessons, and stories, and connect
            with a thriving community of tech enthusiasts.
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
    </div>
  );
}

import { FaStar, FaRegStar } from "react-icons/fa";
import { BiComment } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";

export default function BlogCard({ post, isDarkMode }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={"star-F-" + i} className="text-yellow-400" />);
    for (let i = fullStars; i < 5; i++) stars.push(<FaRegStar key={"star-R-" + i} className="text-yellow-400" />);
    return stars;
  };

  return (
    <div className={`flex gap-6 p-5 rounded-lg transition-colors duration-500 cursor-pointer ${isDarkMode ? "bg-[#2c2a2a] text-white" : "bg-[#eeeded] text-black"}`}>
      <img src={post.coverImage} alt={post.title} className="w-52 h-40 object-cover rounded-lg" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl">{post.title}</h1>
          <div className="flex items-center gap-2 mr-5">
            <img src={post.authorImage || "/defaultProfile.png"} alt={post.authorName} className="w-6 h-6 rounded-full" />
            <p>{post.authorName || "Anonymous"}</p>
          </div>
        </div>
        <p>{post.description}</p>
        <div className="flex gap-2 mb-2">
          {post.tags && post.tags.map((tag, idx) => (
            <div key={idx} className={`p-1 text-sm text-center ${isDarkMode ? "bg-[#454343]" : "bg-transparent"} rounded`}>{tag}</div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">{renderStars(post.starRating)}</div>
          <div className="flex items-center gap-1"><IoEyeOutline /> <p>{post.views}</p></div>
          <div className="flex items-center gap-1"><BiComment /> <p>{post.commentCount}</p></div>
          <div className="flex items-center gap-1"><FaRegClock /> <p>{post.estimatedRead} min read</p></div>
        </div>
      </div>
    </div>
  );
}

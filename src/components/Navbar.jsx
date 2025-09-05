import { RiHome3Line } from "react-icons/ri";
import { FaFire } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { CiBrightnessDown } from "react-icons/ci";
import { MdOutlineDarkMode } from "react-icons/md";
import { LuPencil } from "react-icons/lu";

export default function Navbar({
  setIsLoginActive,
  setIsSignupActive,
  isDarkMode,
  setIsDarkMode,
  loginDone,
  signupDone,
}) {
  console.log("Navbar loginDone:", loginDone, "signupDone:", signupDone);

  return (
    <div
      className={`w-[1280px] flex justify-between items-center fixed py-3 transition-colors duration-500 ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      }`}
    >
      <div
        className={`flex items-center gap-8 ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        <div className="flex items-center gap-2 cursor-pointer hover:text-[#f75555]">
          <RiHome3Line className="text-[#f75555]" />
          <p className="text-[#f75555]">Home</p>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-[#f75555]">
          <FaFire />
          <p>Trending</p>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-[#f75555]">
          <FaRegClock />
          <p>Latest</p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="w-[330px] flex items-center gap-2 font-sm border-b-[1px] border-[#ABB2BF] py-2 px-3">
          <IoSearch className="text-[#ABB2BF]" />
          <input
            className={`bg-transparent outline-none border-none text-sm ${
              isDarkMode ? "text-white" : "text-black"
            }`}
            placeholder="Search post or users..."
            type="text"
          />
        </div>
        {isDarkMode ? (
          <div>
            <CiBrightnessDown
              className="text-white w-5 h-5 hover:text-[#f75555]"
              onClick={() => setIsDarkMode(false)}
            />
          </div>
        ) : (
          <div>
            <MdOutlineDarkMode
              className="text-black w-5 h-5 hover:text-[#f75555]"
              onClick={() => setIsDarkMode(true)}
            />
          </div>
        )}
        <div
          className={`flex items-center gap-5 ${
            isDarkMode ? "text-white" : "text-black"
          } cursor-pointer`}
        >
          <p
            className="hover:text-[#f75555]"
            onClick={() => setIsLoginActive(true)}
          >
            Login
          </p>
          <p
            className="hover:text-[#f75555]"
            onClick={() => setIsSignupActive(true)}
          >
            Signup
          </p>
        </div>
      </div>
    </div>
  );
}

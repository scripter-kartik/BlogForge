"use client";
import { ImCross } from "react-icons/im";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

export default function Login({
  setIsLoginActive,
  isDarkMode,
  setIsSignupActive,
}) {
  const [emailFocused, setEmailFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setMessage("Invalid email or password");
      } else if (result?.ok) {
        setMessage("Login successful!");
        setTimeout(() => {
          setIsLoginActive(false);
        }, 1000);
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setMessage("Google login failed");
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-white"
      } w-full max-w-[450px] p-5 sm:p-7 rounded-2xl relative shadow-xl mx-auto`}
    >
      <ImCross
        className={`absolute right-5 top-5 w-3 h-3 ${
          isDarkMode ? "text-white" : "text-black"
        } cursor-pointer hover:text-[#f75555]`}
        onClick={() => setIsLoginActive(false)}
      />

      <h1
        className={`${
          isDarkMode ? "text-white" : "text-black"
        } text-xl sm:text-2xl font-bold mb-6`}
      >
        Login
      </h1>

      <hr className="border-t-[1px] border-red-500 mb-8" />

      <form onSubmit={handleLogin}>
        <div className="relative mb-7">
          <input
            type="email"
            value={email}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loading}
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent border-[1px]
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 
            peer placeholder-transparent disabled:opacity-50`}
            placeholder="Email"
          />
          <label
            className={`absolute left-4 text-sm transition-all duration-200 px-1 pointer-events-none
            ${
              emailFocused || email
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#1c1d1d]" : "bg-white"
                  } font-medium`
                : "text-base top-3 text-gray-400"
            }`}
          >
            Email
          </label>
        </div>

        <div className="relative mb-7">
          <input
            type="password"
            value={password}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent border-[1px]
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 
            peer placeholder-transparent disabled:opacity-50`}
            placeholder="Password"
          />
          <label
            className={`absolute left-4 text-sm transition-all duration-200 px-1 pointer-events-none
            ${
              passwordFocused || password
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#1c1d1d]" : "bg-white"
                  } font-medium`
                : "text-base top-3 text-gray-400"
            }`}
          >
            Password
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-12 rounded-full bg-[#f75555] font-bold 
          ${
            isDarkMode
              ? "text-white hover:bg-white hover:text-black"
              : "text-black hover:bg-black hover:text-white"
          } 
          transition disabled:opacity-50 disabled:cursor-not-allowed mb-4`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p
          className={`text-center mb-4 text-sm ${
            message.includes("success")
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex items-center mb-4">
        <span
          className={`flex-grow border-t ${
            isDarkMode ? "border-[#494948]" : "border-gray-300"
          }`}
        />
        <span className="px-3 text-gray-400 text-sm">OR</span>
        <span
          className={`flex-grow border-t ${
            isDarkMode ? "border-[#494948]" : "border-gray-300"
          }`}
        />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center gap-3 justify-center h-12 rounded-full 
        border border-gray-300 bg-white text-black font-bold hover:bg-gray-100 
        transition disabled:opacity-50"
      >
        <FcGoogle className="w-6 h-6" />
        Continue with Google
      </button>

      <p
        className={`text-center ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        } mt-6 text-sm`}
      >
        Don't have an account?{" "}
        <span
          onClick={() => {
            setIsSignupActive(true);
            setIsLoginActive(false);
          }}
          className="text-[#f75555] font-bold hover:underline cursor-pointer"
        >
          Sign up
        </span>
      </p>
    </div>
  );
}

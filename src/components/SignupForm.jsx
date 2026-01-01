"use client";
import { ImCross } from "react-icons/im";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

export default function Signup({
  setIsSignupActive,
  isDarkMode,
  setIsLoginActive,
}) {
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function validateForm() {
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return false;
    }
    if (!email || !username || !password) {
      setMessage("All fields are required");
      return false;
    }
    return true;
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, username, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Account created successfully! Please login.");
        setTimeout(() => {
          setIsSignupActive(false);
          setIsLoginActive(true);
        }, 1500);
      } else {
        setMessage(data.message || "Signup failed");
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setMessage("Google signup failed");
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
        onClick={() => setIsSignupActive(false)}
      />

      <h1
        className={`${
          isDarkMode ? "text-white" : "text-black"
        } text-xl sm:text-2xl font-bold mb-6`}
      >
        Create Account
      </h1>

      <hr className="border-t-[1px] border-red-500 mb-8" />

      <form onSubmit={handleSignup}>
        <div className="relative mb-7">
          <input
            type="text"
            value={username}
            onFocus={() => setUsernameFocused(true)}
            onBlur={() => setUsernameFocused(false)}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            disabled={loading}
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent border 
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 
            peer placeholder-transparent disabled:opacity-50`}
            placeholder="Username"
          />

          <label
            className={`absolute left-4 text-sm px-1 transition-all duration-200 pointer-events-none ${
              usernameFocused || username
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#1c1d1d]" : "bg-white"
                  } font-medium`
                : "text-base top-3 text-gray-400"
            }`}
          >
            Username
          </label>
        </div>

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
            } w-full h-12 rounded px-4 bg-transparent border 
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 
            peer placeholder-transparent disabled:opacity-50`}
            placeholder="Email"
          />

          <label
            className={`absolute left-4 text-sm px-1 transition-all duration-200 pointer-events-none ${
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
            autoComplete="new-password"
            required
            disabled={loading}
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent border 
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 
            peer placeholder-transparent disabled:opacity-50`}
            placeholder="Password"
          />

          <label
            className={`absolute left-4 text-sm px-1 transition-all duration-200 pointer-events-none ${
              passwordFocused || password
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#1c1d1d]" : "bg-white"
                  } font-medium`
                : "text-base top-3 text-gray-400"
            }`}
          >
            Password (min 6 characters)
          </label>
        </div>

        <div className="relative mb-7">
          <input
            type="password"
            value={confirm}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent border 
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 
            peer placeholder-transparent disabled:opacity-50`}
            placeholder="Confirm Password"
          />

          <label
            className={`absolute left-4 text-sm px-1 transition-all duration-200 pointer-events-none ${
              confirmFocused || confirm
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#1c1d1d]" : "bg-white"
                  } font-medium`
                : "text-base top-3 text-gray-400"
            }`}
          >
            Confirm Password
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-12 rounded-full bg-[#f75555] text-white font-bold mt-2 mb-4 
          transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

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
      </form>

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
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center gap-3 justify-center h-12 rounded-full 
        font-bold mb-4 transition border bg-white hover:bg-gray-100 border-gray-300
        text-black disabled:opacity-50"
      >
        <FcGoogle className="w-6 h-6" />
        Continue with Google
      </button>

      {/* bottom */}
      <p
        className={`${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        } text-center text-sm`}
      >
        Already have an account?{" "}
        <button
          onClick={() => {
            setIsLoginActive(true);
            setIsSignupActive(false);
          }}
          className="text-[#f75555] font-bold hover:underline"
        >
          Login here
        </button>
      </p>
    </div>
  );
}

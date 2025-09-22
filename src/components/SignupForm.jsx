"use client";
import { ImCross } from "react-icons/im";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Signup({
  setIsSignupActive,
  isDarkMode,
  setSignupDone,
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
  const router = useRouter();

  function validateForm() {
    return password === confirm && password.length >= 6 && email && username;
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("Passwords must match, and all fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSignupDone(true);
        setMessage("Signup successful!");
        router.push("/");

        setTimeout(() => {
          setIsSignupActive(false);
        }, 1000);
      } else {
        setSignupDone(false);
        setMessage(data.message || "Signup failed");
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
    }
  }

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-white"
      } w-[450px] p-5 rounded-2xl relative shadow-xl mx-auto`}
    >
      <ImCross
        className={`absolute right-5 top-5 w-3 h-3 ${
          isDarkMode ? "text-white" : "text-black"
        } text-xl cursor-pointer`}
        onClick={() => setIsSignupActive(false)}
      />
      <h1
        className={`${
          isDarkMode ? "text-white" : "text-black"
        } text-2xl font-bold mb-6`}
      >
        Sign up
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
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent border-[1px] border-[#373939]
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer placeholder-transparent`}
            placeholder="Username"
            id="signup-username"
          />
          <label
            htmlFor="signup-username"
            className={`absolute left-4 transition-all duration-200 px-1 pointer-events-none ${
              usernameFocused || username
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#191b1e]" : "bg-white"
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
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent text-white border-[1px] border-[#373939]
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer placeholder-transparent`}
            placeholder="Email"
            id="signup-email"
          />
          <label
            htmlFor="signup-email"
            className={`absolute left-4 transition-all duration-200 px-1 pointer-events-none ${
              emailFocused || email
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#191b1e]" : "bg-white"
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
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent text-white border-[1px] border-[#373939] 
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer placeholder-transparent`}
            placeholder="Password"
            id="signup-password"
          />
          <label
            htmlFor="signup-password"
            className={`absolute left-4 transition-all duration-200 px-1 pointer-events-none ${
              passwordFocused || password
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#191b1e]" : "bg-white"
                  } font-medium`
                : "text-base top-3 text-gray-400"
            }`}
          >
            Password
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
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent text-white border-[1px] border-[#373939]
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer placeholder-transparent`}
            placeholder="Confirm Password"
            id="signup-confirm"
          />
          <label
            htmlFor="signup-confirm"
            className={`absolute left-4 transition-all duration-200 px-1 pointer-events-none ${
              confirmFocused || confirm
                ? `text-xs -top-3 text-[#f75555] ${
                    isDarkMode ? "bg-[#191b1e]" : "bg-white"
                  } font-medium`
                : "text-base top-3 text-gray-400"
            }`}
          >
            Confirm Password
          </label>
        </div>

        <button
          type="submit"
          className={`${
            isDarkMode
              ? "text-white  hover:bg-white hover:text-black"
              : "text-black  hover:bg-black hover:text-white"
          } w-full h-12 rounded-full bg-[#f75555] text-white font-bold mt-2 mb-4 transition`}
        >
          Signup
        </button>

        {message && (
          <p
            className={`text-center mb-2 ${
              isDarkMode ? "text-red-400" : "text-red-600"
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
        ></span>
        <span className="px-3 text-gray-400">OR</span>
        <span
          className={`flex-grow border-t ${
            isDarkMode ? "border-[#494948]" : "border-gray-300"
          }`}
        ></span>
      </div>

      <button
        onClick={() => signIn("google")}
        className={`w-full flex items-center gap-3 justify-center h-12 rounded-full font-bold mb-2 transition border bg-white hover:bg-gray-100 border-black`}
      >
        <FcGoogle className="w-6 h-6" />
        Continue with Google
      </button>

      <p
        className={`${
          isDarkMode ? "text-gray-400" : "text-[#494948]"
        } text-center mt-6 text-sm`}
      >
        Already registered?{" "}
        <a
          onClick={() => {
            setIsLoginActive(true);
            setIsSignupActive(false);
          }}
          className="text-[#f75555] font-bold hover:underline cursor-pointer"
        >
          Login
        </a>
      </p>
    </div>
  );
}

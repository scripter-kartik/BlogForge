"use client";
import { ImCross } from "react-icons/im";
import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Login({
  setIsLoginActive,
  isDarkMode,
  setLoginDone,
  setIsSignupActive,
  setLoading,
}) {
  const [emailFocused, setEmailFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLoginDone(true);
          } else {
            localStorage.removeItem("token");
            setLoginDone(false);
          }
        });
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        setLoginDone(true);
        setMessage(`Welcome back, ${data.data.name}!`);
        router.push("/");

        setTimeout(() => {
          setIsLoginActive(false);
        }, 1000);
      } else {
        setLoginDone(false);
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
    }
  }

  const nextAuthLogin = () => {
    setLoginDone(true);
    setLoading(true);
    signIn("google");
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-white"
      } w-[450px] p-5 rounded-2xl relative shadow-xl mx-auto`}
    >
      <ImCross
        className={`absolute right-5 top-5 w-3 h-3 ${
          isDarkMode ? "text-white" : "text-black"
        } cursor-pointer`}
        onClick={() => setIsLoginActive(false)}
      />
      <h1
        className={`${
          isDarkMode ? "text-white" : "text-black"
        } text-2xl font-bold mb-6`}
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
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent border-[1px]
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer
            placeholder-transparent`}
            placeholder="Email"
            id="login-email"
          />
          <label
            htmlFor="login-email"
            className={`absolute left-4 transition-all duration-200 px-1 
            pointer-events-none
            ${
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
            required
            className={`${
              isDarkMode
                ? "text-white border-[#494948]"
                : "text-black  border-gray-300"
            } w-full h-12 rounded px-4 bg-transparent text-white border-[1px]
            focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer placeholder-transparent`}
            placeholder="Password"
            id="login-password"
          />
          <label
            htmlFor="login-password"
            className={`absolute left-4 transition-all duration-200 px-1
            text-base top-3 text-gray-400 pointer-events-none
            peer-focus:text-xs peer-focus:-top-3 peer-focus:text-[#f75555] ${
              isDarkMode ? "peer-focus:bg-[#191b1e]" : "peer-focus:bg-white"
            } peer-focus:font-medium`}
          >
            Password
          </label>
        </div>

        <button
          type="submit"
          className={`w-full h-12 rounded-full bg-[#f75555] ${
            isDarkMode
              ? "text-white  hover:bg-white hover:text-black"
              : "text-black  hover:bg-black hover:text-white"
          } font-bold mt-2 mb-8 transition`}
        >
          Login
        </button>
      </form>

      {message && (
        <p
          className={`text-center mb-4 ${
            isDarkMode ? "text-red-400" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex items-center mb-4">
        <span
          className={`flex-grow border-t ${
            isDarkMode ? "border-[#494948]" : "border-gray-300"
          } `}
        ></span>
        <span className="px-3 text-gray-400">OR</span>
        <span
          className={`flex-grow border-t ${
            isDarkMode ? "border-[#494948]" : "border-gray-300"
          } `}
        ></span>
      </div>

      <button
        onClick={nextAuthLogin}
        className="w-full flex items-center gap-3 justify-center h-12 rounded-full border border-black bg-white text-black font-bold mb-2 hover:bg-gray-100 transition"
      >
        <FcGoogle className="w-6 h-6" />
        Continue with Google
      </button>

      <p
        className={`text-center ${
          isDarkMode ? "text-gray-400" : "text-[#494948]"
        } mt-6 text-sm`}
      >
        Don’t have an account?{" "}
        <a
          onClick={() => {
            setIsSignupActive(true);
            setIsLoginActive(false);
          }}
          className="text-[#f75555] font-bold hover:underline cursor-pointer"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}

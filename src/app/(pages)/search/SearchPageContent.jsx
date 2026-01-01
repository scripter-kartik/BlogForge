"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRandomProfileImage } from "@/lib/profileImage";
import Link from "next/link";

export default function SearchPage({ isDarkMode }) {
  const searchParams = useSearchParams();
  const query = useMemo(
    () => searchParams.get("q")?.trim() || "",
    [searchParams]
  );

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ users: [], posts: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) return;

    async function run() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        setResults({
          users: data.users || [],
          posts: data.posts || [],
        });
      } catch (err) {
        setError("Failed to load results.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [query]);

  const textClass = isDarkMode ? "text-white" : "text-black";
  const cardBg = isDarkMode ? "bg-[#2D2D2D]" : "bg-white";
  const cardHover = isDarkMode ? "hover:bg-[#353535]" : "hover:bg-gray-100";
  const borderColor = isDarkMode ? "border-[#454545]" : "border-gray-300";

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-28 lg:mt-32 mb-20">
      <div className="flex flex-col gap-2 mb-10">
        <h1
          className={`${textClass} text-3xl sm:text-4xl font-bold tracking-tight`}
        >
          Search Results
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Showing results for:{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            "{query}"
          </span>
        </p>
      </div>

      {loading && (
        <div className="flex flex-col gap-4 mt-10">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-full h-20 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-center bg-red-50 border border-red-200 p-4 rounded-xl mt-6">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="mt-14">
            <h2
              className={`${textClass} text-2xl sm:text-3xl font-bold mb-6 flex items-center`}
            >
              Posts ({results.posts.length})
            </h2>

            {results.posts.length === 0 ? (
              <p className="text-gray-500">No posts found.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {results.posts.map((p) => (
                  <Link
                    href={`/blog/${p._id}`}
                    key={p._id}
                    className={`w-full p-5 rounded-xl border ${borderColor} shadow-lg ${cardBg} ${cardHover} transition-all duration-300 hover:shadow-xl hover:scale-[1.01] cursor-pointer`}
                  >
                    <h3
                      className={`${textClass} text-xl font-semibold line-clamp-1`}
                    >
                      {p.title}
                    </h3>

                    {p.description && (
                      <p
                        className={`mt-2 text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        } line-clamp-2`}
                      >
                        {p.description}
                      </p>
                    )}

                    {p.author && (
                      <div className="flex items-center gap-3 mt-4 text-sm">
                        <img
                          src={getRandomProfileImage(p.author.image, p.author.username)}
                          className="w-8 h-8 rounded-full border border-[#f75555]"
                          alt=""
                        />
                        <p
                          className={`${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          @{p.author.username}
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-16">
            <h2
              className={`${textClass} text-2xl sm:text-3xl font-bold mb-6 flex items-center`}
            >
              Users ({results.users.length})
            </h2>

            {results.users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.users.map((u) => (
                  <Link
                    href={`/profile/${u.username}`}
                    key={u._id}
                    className={`p-6 rounded-2xl shadow-lg border ${borderColor} ${cardBg} ${cardHover} flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-2xl`}
                  >
                    <img
                      src={getRandomProfileImage(u.image, u.username)}
                      className="w-20 h-20 rounded-full border-4 border-[#f75555] mb-4"
                      alt=""
                    />

                    <h3
                      className={`${textClass} font-bold text-lg truncate w-full`}
                    >
                      {u.username}
                    </h3>

                    {u.name && (
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {u.name}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {results.posts.length === 0 &&
            results.users.length === 0 &&
            !loading && (
              <p
                className={`text-center mt-20 text-lg ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No results found for "{query}"
              </p>
            )}
        </>
      )}
    </div>
  );
}

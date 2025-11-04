"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = useMemo(() => searchParams.get("q")?.trim() || "", [searchParams]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });

  useEffect(() => {
    let isCancelled = false;
    async function run() {
      if (!query) {
        setResults({ users: [], posts: [] });
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!isCancelled) {
          setResults({ users: data.users || [], posts: data.posts || [] });
        }
      } catch (e) {
        if (!isCancelled) setError("Failed to load results");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    run();
    return () => {
      isCancelled = true;
    };
  }, [query]);

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Search</h1>
      <p className="text-sm text-gray-500 mb-6">Results for: <span className="font-medium text-gray-700">{query || ""}</span></p>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Users</h2>
            {results.users.length === 0 ? (
              <p className="text-sm text-gray-500">No users found.</p>
            ) : (
              <ul className="space-y-3">
                {results.users.map((u) => (
                  <li key={u._id}>
                    <Link href={`/profile/${u.username}`} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100">
                      <img src={u.image || "/imageProfile1.png"} alt={u.username} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="font-medium">{u.username}</p>
                        {u.name && <p className="text-xs text-gray-500">{u.name}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Posts</h2>
            {results.posts.length === 0 ? (
              <p className="text-sm text-gray-500">No posts found.</p>
            ) : (
              <ul className="space-y-3">
                {results.posts.map((p) => (
                  <li key={p._id}>
                    <Link href={`/blog/${p._id}`} className="block p-3 rounded-md hover:bg-gray-100">
                      <p className="font-medium line-clamp-1">{p.title}</p>
                      {p.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{p.description}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

export default function BlogSkeleton({ isDarkMode }) {
  const base = isDarkMode ? "bg-[#2a2a2a]" : "bg-gray-200";
  const card = isDarkMode ? "bg-[#1f1f1f]" : "bg-gray-100";

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"}`}>
      <div className="max-w-[1280px] mx-auto pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 animate-pulse">

        <div className={`h-4 w-24 rounded ${base} mb-6`} />

        <div className={`h-8 sm:h-10 w-3/4 rounded ${base} mb-4`} />
        <div className={`h-5 w-1/2 rounded ${base} mb-6`} />

        <div className="flex items-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full ${base}`} />
          <div className={`h-4 w-28 rounded ${base}`} />
          <div className={`h-4 w-20 rounded ${base}`} />
          <div className={`h-4 w-20 rounded ${base}`} />
        </div>

        <div className="flex gap-1 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-5 h-5 rounded ${base}`} />
          ))}
        </div>

        <div className={`w-full h-48 sm:h-64 rounded-xl ${base} mb-8`} />

        <div className="space-y-3 mb-8">
          <div className={`h-4 w-full rounded ${base}`} />
          <div className={`h-4 w-full rounded ${base}`} />
          <div className={`h-4 w-5/6 rounded ${base}`} />
          <div className={`h-4 w-full rounded ${base}`} />
          <div className={`h-4 w-4/5 rounded ${base}`} />
          <div className={`h-4 w-full rounded ${base}`} />
          <div className={`h-4 w-3/4 rounded ${base}`} />
        </div>

        <div className={`h-px w-full ${base} my-8`} />

        <div className={`h-6 w-36 rounded ${base} mb-6`} />

        <div className={`w-full rounded p-4 ${card} mb-6`}>
          <div className={`h-20 w-full rounded ${base} mb-3`} />
          <div className={`h-9 w-28 rounded ${base}`} />
        </div>

        {[...Array(2)].map((_, i) => (
          <div key={i} className={`flex gap-3 p-4 rounded ${card} mb-3`}>
            <div className={`w-10 h-10 rounded-full flex-shrink-0 ${base}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-24 rounded ${base}`} />
              <div className={`h-3 w-full rounded ${base}`} />
              <div className={`h-3 w-4/5 rounded ${base}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
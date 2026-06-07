"use client";

function PostSkeletonCard({ isDarkMode, variant = 0 }) {
  const cardClass = isDarkMode ? "bg-[#2D2D2D]" : "bg-[#E8EAEC]";
  const blockClass = isDarkMode ? "bg-[#3a3a3a]" : "bg-gray-300";
  const softBlockClass = isDarkMode ? "bg-[#454545]" : "bg-gray-200";
  const titleWidth = ["w-10/12", "w-8/12", "w-9/12"][variant % 3];
  const bodyWidth = ["w-full", "w-11/12", "w-4/5"][variant % 3];

  return (
    <div className="w-full mt-6 sm:mt-8" aria-hidden="true">
      <div
        className={`w-full flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-xl shadow-sm ${cardClass}`}
      >
        <div
          className={`w-full md:w-52 h-48 md:h-40 flex-shrink-0 rounded-lg ${blockClass}`}
        />

        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className={`h-6 sm:h-7 rounded-md ${blockClass} ${titleWidth}`} />
              <div className={`h-4 rounded-md ${softBlockClass} ${bodyWidth}`} />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full ${blockClass}`} />
              <div className={`h-4 w-24 rounded-md ${softBlockClass}`} />
            </div>
          </div>

          <div className="space-y-2">
            <div className={`h-4 rounded-md ${softBlockClass} w-full`} />
            <div className={`h-4 rounded-md ${softBlockClass} w-11/12`} />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className={`h-7 w-16 rounded-full ${softBlockClass}`} />
            <div className={`h-7 w-20 rounded-full ${softBlockClass}`} />
            <div className={`h-7 w-14 rounded-full ${softBlockClass}`} />
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap pt-1">
            <div className={`h-4 w-20 rounded-md ${softBlockClass}`} />
            <div className={`h-4 w-12 rounded-md ${softBlockClass}`} />
            <div className={`h-4 w-12 rounded-md ${softBlockClass}`} />
            <div className={`h-4 w-16 rounded-md ${softBlockClass}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostFeedSkeleton({ isDarkMode, count = 3 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeletonCard
          key={index}
          isDarkMode={isDarkMode}
          variant={index}
        />
      ))}
    </div>
  );
}

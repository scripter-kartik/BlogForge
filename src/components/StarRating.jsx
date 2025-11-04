"use client";

import { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

export default function StarRating({
  postId,
  initialRating = 0,
  initialCount = 0,
  userRating = null,
  onRate,
  isAuthenticated = false,
  isAuthor = false,
  readonly = false,
  size = "md",
  showCount = true,
  isDarkMode = true,
}) {
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialCount);
  const [userCurrentRating, setUserCurrentRating] = useState(userRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setCount(initialCount);
    setUserCurrentRating(userRating);
  }, [initialRating, initialCount, userRating]);

  const handleRatingClick = async (selectedRating) => {
    if (readonly || isLoading || !isAuthenticated || isAuthor) return;

    setIsLoading(true);
    try {
      const result = await onRate(selectedRating);
      if (result) {
        setRating(result.averageRating);
        setCount(result.ratingCount);
        setUserCurrentRating(result.userRating);
      }
    } catch (error) {
      console.error("Rating error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    
    // ✅ FIX: Use average rating for display, not user's rating
    const displayRating = hoveredRating || rating;

    // Size classes
    const sizeClasses = {
      sm: "text-sm",
      md: "text-lg",
      lg: "text-2xl",
      xl: "text-3xl",
    };

    const starSize = sizeClasses[size] || sizeClasses.md;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(displayRating);
      const isHalf = !isFilled && i === Math.ceil(displayRating) && displayRating % 1 >= 0.5;
      const isHovered = hoveredRating >= i;
      const isUserRated = userCurrentRating >= i; // Track which stars user rated

      let StarIcon = FaRegStar;
      if (isFilled || isHovered) {
        StarIcon = FaStar;
      } else if (isHalf) {
        StarIcon = FaStarHalfAlt;
      }

      const canInteract = !readonly && isAuthenticated && !isAuthor;

      stars.push(
        <button
          key={i}
          type="button"
          disabled={!canInteract || isLoading}
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => canInteract && setHoveredRating(i)}
          onMouseLeave={() => canInteract && setHoveredRating(0)}
          className={`
            ${starSize}
            ${canInteract ? "cursor-pointer" : "cursor-default"}
            transition-all duration-200
            ${isLoading ? "opacity-50" : ""}
            ${canInteract ? "hover:scale-110" : ""}
          `}
        >
          <StarIcon
            className={`
              ${
                // ✅ FIX: Show red color ONLY for stars the current user rated
                isUserRated && userCurrentRating !== null ? "text-[#f75555]" :
                // Show yellow for hovered or filled (average rating)
                (isFilled || isHovered) ? "text-yellow-500" : 
                // Show yellow for half stars
                isHalf ? "text-yellow-500" :
                // Show gray for empty stars
                isDarkMode ? "text-gray-600" : "text-gray-300"
              }
              transition-colors duration-200
            `}
          />
        </button>
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        {renderStars()}
      </div>

      {showCount && (
        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          <span className="font-semibold">
            {rating > 0 ? rating.toFixed(1) : "0.0"}
          </span>
          <span>({count} {count === 1 ? "rating" : "ratings"})</span>
        </div>
      )}

      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f75555]"></div>
      )}

      {/* Helper text */}
      {!readonly && isAuthenticated && !isAuthor && (
        <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
          {userCurrentRating ? `You rated: ${userCurrentRating} ⭐` : "Click to rate"}
        </span>
      )}

      {isAuthor && (
        <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
          (Your post)
        </span>
      )}

      {!isAuthenticated && !readonly && (
        <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
          Login to rate
        </span>
      )}
    </div>
  );
}
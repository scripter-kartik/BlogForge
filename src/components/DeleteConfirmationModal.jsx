// src/components/DeleteConfirmationModal.jsx
"use client";

import { useState } from "react";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDarkMode,
  title = "Delete Post",
  message = "Are you sure you want to delete this post? This action cannot be undone.",
  isDeleting = false
}) {
  const [confirmText, setConfirmText] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === "delete") {
      onConfirm();
      setConfirmText("");
    } else {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      setShowWarning(false);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && confirmText.toLowerCase() === "delete") {
      handleConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-md rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isDarkMode ? "bg-[#2D2D2D]" : "bg-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!isDeleting && (
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
              isDarkMode 
                ? "hover:bg-gray-700 text-gray-400 hover:text-white" 
                : "hover:bg-gray-100 text-gray-600 hover:text-black"
            }`}
          >
            <IoClose size={24} />
          </button>
        )}

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 opacity-20 rounded-full animate-ping"></div>
              <div className="relative bg-red-500 bg-opacity-20 p-4 rounded-full">
                <FaExclamationTriangle className="text-red-500 text-3xl sm:text-4xl" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className={`text-xl sm:text-2xl font-bold text-center mb-3 ${
            isDarkMode ? "text-white" : "text-black"
          }`}>
            {title}
          </h2>

          {/* Message */}
          <p className={`text-center mb-6 text-sm sm:text-base ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {message}
          </p>

          {/* Warning Box */}
          <div className={`p-4 rounded-lg mb-6 border ${
            isDarkMode 
              ? "bg-red-900 bg-opacity-20 border-red-800" 
              : "bg-red-50 border-red-200"
          }`}>
            <p className={`text-sm font-medium flex items-center gap-2 ${
              isDarkMode ? "text-red-400" : "text-red-600"
            }`}>
              <FaTrash className="flex-shrink-0" />
              <span>This will permanently delete your post and all its comments.</span>
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              Type <span className="font-bold text-red-500">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setShowWarning(false);
              }}
              onKeyPress={handleKeyPress}
              disabled={isDeleting}
              placeholder="Type DELETE here"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                isDarkMode
                  ? "bg-[#1c1d1d] border-gray-600 text-white placeholder-gray-500 focus:border-red-500"
                  : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-red-500"
              } ${
                showWarning ? "border-red-500 shake" : ""
              } ${
                isDeleting ? "opacity-50 cursor-not-allowed" : "focus:outline-none"
              }`}
              autoFocus
            />
            {showWarning && (
              <p className="text-red-500 text-xs mt-2 animate-fadeIn">
                Please type "DELETE" exactly to confirm
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-black"
              } ${
                isDeleting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting || confirmText.toLowerCase() !== "delete"}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                confirmText.toLowerCase() === "delete" && !isDeleting
                  ? "bg-red-600 hover:bg-red-700 text-white transform hover:scale-105"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash />
                  Delete Forever
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in;
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
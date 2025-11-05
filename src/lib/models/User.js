// src/lib/models/User.js - FIXED VERSION
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    username: { 
      type: String, 
      unique: true, 
      required: true,
      trim: true,
      lowercase: true 
    },
    email: { 
      type: String, 
      unique: true, 
      required: true,
      trim: true,
      lowercase: true 
    },
    // ✅ CRITICAL FIX: Password is optional (for Google users) and hidden by default
    password: { 
      type: String, 
      required: false,
      minlength: 8,
      select: false // Hide password by default in queries
    },
    image: { 
      type: String, 
      default: null 
    },
    bio: { 
      type: String, 
      default: "", 
      maxlength: 500 
    },
    followers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    following: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    // ✅ Optional: Track which provider was used
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials"
    },
    // ✅ Optional: Store Google ID separately
    googleId: {
      type: String,
      sparse: true, // Allows null values while maintaining uniqueness
      unique: true
    }
  },
  { 
    timestamps: true,
    // ✅ Add indexes for better query performance
    indexes: [
      { email: 1 },
      { username: 1 },
      { googleId: 1 }
    ]
  }
);

// ✅ Add a pre-save hook to set provider
UserSchema.pre('save', function(next) {
  if (this.isNew) {
    if (!this.password && this.googleId) {
      this.provider = 'google';
    } else {
      this.provider = 'credentials';
    }
  }
  next();
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
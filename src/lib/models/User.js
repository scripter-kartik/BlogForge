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
    password: { 
      type: String, 
      required: false,
      minlength: 8,
      select: false
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
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials"
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    }
  },
  { 
    timestamps: true
  }
);

// ✅ ONLY ONE TEXT INDEX - No field-level indexes
UserSchema.index({ 
  username: 'text', 
  name: 'text',
  bio: 'text'
}, {
  weights: {
    username: 10,
    name: 5,
    bio: 1
  }
});

UserSchema.pre('save', function(next) {
  if (this.isNew && !this.password && this.googleId) {
    this.provider = 'google';
  }
  next();
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
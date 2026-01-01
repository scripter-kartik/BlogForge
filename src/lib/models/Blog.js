import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    content: { type: String },
    tags: [{ type: String }],
    category: { 
      type: String, 
      enum: ["Featured","Trending","Latest"], 
      default: "Latest"
    },
    
    ratings: {
      type: [{
        userId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User", 
          required: true 
        },
        rating: { 
          type: Number, 
          required: true, 
          min: 1, 
          max: 5 
        },
        createdAt: { 
          type: Date, 
          default: Date.now 
        }
      }],
      default: []
    },
    averageRating: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 5
    },
    ratingCount: { 
      type: Number, 
      default: 0 
    },
    
    starRating: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    views: { 
      type: Number, 
      default: 0
    },
    estimatedRead: { type: Number, default: 0 },
  },
  { 
    timestamps: true
  }
);

BlogSchema.index({ 
  title: 'text', 
  description: 'text', 
  content: 'text' 
}, {
  weights: {
    title: 10,
    description: 5,
    content: 1
  }
});

BlogSchema.methods.calculateAverageRating = function() {
  if (!this.ratings || this.ratings.length === 0) {
    this.averageRating = 0;
    this.ratingCount = 0;
    return;
  }
  
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  this.ratingCount = this.ratings.length;
  this.starRating = Math.round(this.averageRating);
};

BlogSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    this.calculateAverageRating();
  }
  next();
});

export const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
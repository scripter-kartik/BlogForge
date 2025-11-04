// scripts/migrate-ratings.js
// Run this ONCE to add ratings array to existing blog posts
// Usage: node scripts/migrate-ratings.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define MONGO_URI in .env.local");
}

const BlogSchema = new mongoose.Schema({
  title: String,
  description: String,
  coverImage: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  tags: [String],
  category: String,
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  starRating: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  estimatedRead: { type: Number, default: 0 },
}, { timestamps: true });

const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

async function migrateRatings() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n📊 Checking blog posts...");
    const blogsWithoutRatings = await Blog.countDocuments({
      $or: [
        { ratings: { $exists: false } },
        { ratings: null }
      ]
    });

    console.log(`Found ${blogsWithoutRatings} blog posts without ratings array`);

    if (blogsWithoutRatings === 0) {
      console.log("✅ All blog posts already have ratings array!");
      await mongoose.connection.close();
      return;
    }

    console.log("\n🔄 Migrating blog posts...");
    const result = await Blog.updateMany(
      {
        $or: [
          { ratings: { $exists: false } },
          { ratings: null }
        ]
      },
      {
        $set: {
          ratings: [],
          averageRating: 0,
          ratingCount: 0
        }
      }
    );

    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated ${result.modifiedCount} blog posts`);

    // Verify
    const totalBlogs = await Blog.countDocuments();
    const blogsWithRatings = await Blog.countDocuments({ ratings: { $exists: true } });
    console.log(`\n📈 Stats:`);
    console.log(`   Total blogs: ${totalBlogs}`);
    console.log(`   Blogs with ratings array: ${blogsWithRatings}`);

    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
    console.log("✅ Migration successful!");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateRatings();
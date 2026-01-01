import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        content: { type: String },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        likesCount: { type: Number, default: 0 },
        featured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  html: { type: String, required: true },
  videoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Video = mongoose.model("Video", videoSchema);

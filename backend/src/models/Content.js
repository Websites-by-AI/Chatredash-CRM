const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  contentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  input: { type: Object },
  title: String,
  summary: String,
  blog_post: String,
  video_script: String,
  notebook_notes: String,
  social_posts: [String],
  resume_summary: String,
  recommended_prompt: String,
  recommended_platforms: [String],
  best_title: String,
  best_cta: String,
  keywords: [String],
  favorite: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);

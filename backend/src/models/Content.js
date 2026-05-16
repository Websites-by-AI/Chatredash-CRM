const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
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
  created_at: { type: String },
  updated_at: { type: String },
}, { versionKey: false });

contentSchema.set('toJSON', { transform: (doc, ret) => { delete ret._id; return ret; } });
contentSchema.set('toObject', { transform: (doc, ret) => { delete ret._id; return ret; } });

const MongoModel = mongoose.model('Content', contentSchema);

module.exports = new Proxy({}, {
  get(_, prop) {
    const model = global.__memModels?.Content || MongoModel;
    const val = model[prop];
    return typeof val === 'function' ? val.bind(model) : val;
  }
});

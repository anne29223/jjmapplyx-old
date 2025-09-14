const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  url: { type: String, required: true, unique: true },
  description: String,
  posted_at: Date,
  scraped_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Job", JobSchema);

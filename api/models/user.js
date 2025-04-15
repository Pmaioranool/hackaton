// server/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  score: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  inventory: [{ type: String }],
});

module.exports = mongoose.model("User", UserSchema);

// server/routes/user.js
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");

// GET all users (leaderboard)
router.get("/", async (req, res) => {
  const users = await User.find().sort({ score: -1 }).limit(10);
  res.json(users);
});

// POST register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10); // password hashing
  try {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const logUser = await User.findOne({ username });
    if (!logUser) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const isMatch = bcrypt.compareSync(password, logUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    res.json({ message: "Login successful", user: logUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const putUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );
    res.json({ message: "User modified successfully", putUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

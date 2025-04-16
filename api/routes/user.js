// server/routes/user.js
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

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
    const alrUser = await User.exists({ username });
    console.log(alrUser);
    if (alrUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ message: "User registered", token: token });
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

    // Generate a token (optional, for authentication)
    const token = jwt.sign(
      { id: logUser._id, username: logUser.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login successful", token: token });
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

router.put("/newScore/:id", async (req, res) => {
  const { id } = req.params;
  const { score } = req.body;

  oldScore = await User.findById(id).then((user) => {
    return user.score;
  });

  const newHightScore = score > oldScore ? score : oldScore;

  try {
    const putUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: { score: newHightScore } },
      { new: true }
    );
    res.json({ message: "User modified successfully", putUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route pour récupérer un utilisateur par ID
router.get("/one/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route pour récupérer les scores (leaderboard)
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ score: -1 });
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

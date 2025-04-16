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
router.put("/update", async (req, res) => {
  const { newUsername, newPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentification requise." });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Vérifier si le nouveau username est déjà pris
    if (newUsername && newUsername !== user.username) {
      const usernameExists = await User.findOne({ username: newUsername });
      if (usernameExists) {
        return res.status(400).json({ message: "Ce pseudo est déjà utilisé." });
      }
      user.username = newUsername;
    }

    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
    }

    await user.save();

    // Générer un nouveau token si le username a changé
    let newToken = token;
    if (newUsername) {
      newToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    }

    res.status(200).json({
      message: "Informations mises à jour.",
      token: newToken,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token invalide." });
    }
    console.error("Erreur backend :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
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

router.delete("/", async (req, res) => {
  const { id } = req.headers;
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

router.put("/", async (req, res) => {
  const { id } = req.headers;
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

router.put("/newScore", async (req, res) => {
  const { id } = req.headers;
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
router.get("/one", async (req, res) => {
  const { id } = req.headers;
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
    const users = await User.find().sort({ score: -1 }).limit(5);
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

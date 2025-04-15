// server/server.js
const express = require("express");
const connectDB = require("./db");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
// app.use("/", (req, res) => res.send("Backend is running ✅"));
app.use("/api/users", require("./routes/user.js"));

// Route pour le décryptage du token
app.get("/api/token/decrypt", (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(403).json({ error: "Token manquant !" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(401)
          .json({ error: "Erreur de décryptage du token ! " + err.message });

      res.status(200).json({ username: decoded.username, id: decoded.id });
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Une erreur interne s'est produite. " + error });
  }
});

// Démarrer serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));

// server/server.js
const express = require("express");
const connectDB = require("./db");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
// app.use("/", (req, res) => res.send("Backend is running ✅"));
app.use("/api/users", require("./routes/user.js"));

// Démarrer serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));

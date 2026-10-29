require("dotenv").config();
const express = require("express");
const ticketRoutes = require("./routes/ticket.routes");
const serveurRoutes = require("./routes/serveur.routes");
const catalogueRoutes = require("./routes/catalogue.routes");
const pool = require("./db");
const connectMongo = require("./config/mongo");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", ticketRoutes);
app.use("/api", serveurRoutes);
app.use("/api", catalogueRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

app.use(errorHandler);

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Connecté à PostgreSQL");
    await connectMongo();
  } catch (error) {
    console.error("Connexion à une base impossible :", error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Serveur PaLeonis démarré sur http://localhost:${PORT}`);
  });
}

start();

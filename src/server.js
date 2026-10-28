require("dotenv").config();
const express = require("express");

const ticketRoutes = require("./routes/ticket.routes");
const serveurRoutes = require("./routes/serveur.routes");
const abonnementRoutes = require("./routes/abonnement.routes");
const catalogueRoutes = require("./routes/catalogue.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const technicienRoutes = require("./routes/technicien.routes");
const clientRoutes = require("./routes/client.route");
const datacenterRoutes = require("./routes/datacenter.routes");

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", ticketRoutes);
app.use("/api", serveurRoutes);
app.use("/api", abonnementRoutes);
app.use("/api", catalogueRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/datacenters", datacenterRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", technicienRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});


app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON invalide." });
  }
  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error.code === "22P02") {
    return res.status(400).json({ error: "Donnée invalide." });
  }
  console.error(error);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`Serveur PaLeonis démarré sur http://localhost:${PORT}`);
});

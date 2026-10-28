require("dotenv").config();
const express = require("express");
const productRoutes = require("./routes/product.routes");
const ticketRoutes = require("./routes/ticket.routes");
const serveurRoutes = require("./routes/serveur.routes");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api", ticketRoutes);
app.use("/api", serveurRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

app.listen(PORT, () => {
  console.log(`Serveur PaLeonis démarré sur http://localhost:${PORT}`);
});

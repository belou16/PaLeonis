const express = require("express");
const {
  listServeurs,
  getServeur,
  deleteServeur,
  createEvenement,
  listEvenements,
  statsEvenements,
  alertesParJour,
} = require("../controllers/serveur.controller");

const router = express.Router();

router.get("/serveurs/alertes/par-jour", alertesParJour);
router.get("/serveurs/:id", getServeur);
router.get("/serveurs", listServeurs);
router.delete("/serveurs/:id", deleteServeur);

router.post("/serveurs/:id/evenements", createEvenement);
router.get("/serveurs/:id/evenements", listEvenements); // ?type=&debut=&fin=&limite=
router.get("/serveurs/:id/evenements/stats", statsEvenements);

module.exports = router;

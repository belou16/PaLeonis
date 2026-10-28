const express = require("express");
const { listServeurs, getServeur } = require("../controllers/serveur.controller");

const router = express.Router();

router.get("/serveurs/:id", getServeur);
router.get("/serveurs", listServeurs);

module.exports = router;

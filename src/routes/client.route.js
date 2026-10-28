const express = require("express");
const {
  listClients,
  getClient,
  createClient,
  getFicheClient,
} = require("../controllers/client.controller");

const router = express.Router();

router.get("/", listClients);
router.get("/:id/fiche", getFicheClient);
router.get("/:id", getClient);
router.post("/", createClient);

module.exports = router;

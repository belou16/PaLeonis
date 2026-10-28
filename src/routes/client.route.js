const express = require("express");
const {
  listClients,
  getClient,
  createClient,
} = require("../controllers/client.controller");

const router = express.Router();

router.get("/", listClients);
router.get("/:id", getClient);
router.post("/", createClient);

module.exports = router;

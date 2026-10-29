const express = require("express");
const {
  listCatalogues,
  getCatalogue,
  createCatalogue,
  updateCatalogue,
  retirerCatalogue,
} = require("../controllers/catalogue.controller");

const router = express.Router();

router.get("/offres", listCatalogues);
router.get("/offres/:id", getCatalogue);
router.post("/offres", createCatalogue);
router.put("/offres/:id", updateCatalogue);
router.patch("/offres/:id/retrait", retirerCatalogue);

module.exports = router;

const express = require("express");
const {
  listCatalogues,
  getCatalogue,
  createCatalogue,
  updateCatalogue,
  retirerCatalogue,
} = require("../controllers/catalogue.controller");

const router = express.Router();

router.get("/offres", listCatalogues); // Get all offers (?categorie=&en_vente=)
router.get("/offres/:id", getCatalogue); // Get a specific offer by ID

router.post("/offres", createCatalogue); // Create a new offer
router.put("/offres/:id", updateCatalogue); // Update an existing offer by ID

router.patch("/offres/:id/retrait", retirerCatalogue); // Withdraw an offer from sale

module.exports = router;

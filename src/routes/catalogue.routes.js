const express = require("express");
const {
  listCatalogues,
  getCatalogue,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
} = require("../controllers/catalogue.controller");

const router = express.Router();

router.get("/offres", listCatalogues); // Get all offers
router.get("/offres/:id", getCatalogue); // Get a specific offer by ID

router.post("/offres", createCatalogue); // Create a new offer
router.put("/offres/:id", updateCatalogue); // Update an existing offer by ID

router.patch("/offres/:id/resiliation", deleteCatalogue); // Delete an offer by ID

module.exports = router;

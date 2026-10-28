const express = require("express");
const {
  listCatalogues,
  getCatalogue,
  createCatalogue,
  updateCatalogue,
  retirerCatalogue,
  deleteCatalogue,
  getFiche,
  putFiche,
  rechercherFiches,
} = require("../controllers/catalogue.controller");

const router = express.Router();

router.get("/offres", listCatalogues); // Get all offers (?categorie=&en_vente=)
router.get("/offres/recherche", rechercherFiches); // Full-text search in technical sheets (?q=)
router.get("/offres/:id", getCatalogue); // Get a specific offer by ID, with its technical sheet

router.post("/offres", createCatalogue); // Create a new offer
router.put("/offres/:id", updateCatalogue); // Update an existing offer by ID
router.delete("/offres/:id", deleteCatalogue); // Delete an offer and its technical sheet

router.patch("/offres/:id/retrait", retirerCatalogue); // Withdraw an offer from sale

router.get("/offres/:id/fiche", getFiche); // Get the technical sheet of an offer
router.put("/offres/:id/fiche", putFiche); // Create or replace the technical sheet of an offer

module.exports = router;

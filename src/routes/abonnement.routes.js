const express = require("express");
const {
  listAbonnements,
  getAbonnement,
  createAbonnement,
  resilierAbonnement,
} = require("../controllers/abonnement.controller");

const router = express.Router();

router.get("/abonnements", listAbonnements); // Get all offers
router.get("/abonnements/:id", getAbonnement); // Get a specific offer by ID

router.post("/abonnements", createAbonnement); // Create a new offer

router.patch("/abonnements/:id/resiliation", resilierAbonnement);

module.exports = router;

const express = require("express");
const {
  listAbonnements,
  getAbonnement,
  createAbonnement,
  resilierAbonnement,
} = require("../controllers/abonnement.controller");

const router = express.Router();

router.get("/abonnements", listAbonnements); // List subscriptions
router.get("/abonnements/:id", getAbonnement); // Get a specific subscription by ID

router.post("/abonnements", createAbonnement); // Subscribe and assign a free server

router.patch("/abonnements/:id/resiliation", resilierAbonnement); // Cancel and free the server

module.exports = router;

const express = require("express");
const { getRevenus, getServeurs } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/dashboard/revenus", getRevenus);
router.get("/dashboard/serveurs", getServeurs);

module.exports = router;

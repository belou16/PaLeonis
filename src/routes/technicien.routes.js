const express = require("express");
const { } = require("../controllers/technicien.controller");

const router = express.Router();

router.get("/technicien/:id/tickets", ...); // Get tickets for a specific technician
router.get("/technicien/:id", ...); // Read specific technician
router.get("/technicien", ...); // list all technicians
 
module.exports = router;

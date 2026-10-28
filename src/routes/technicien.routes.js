const express = require("express");
const { listTechniciens, getTechnicien } = require("../controllers/technicien.controller");

const router = express.Router();

router.get("/techniciens/:id", getTechnicien); // Read specific technician
router.get("/techniciens", listTechniciens); // list all technicians

module.exports = router;

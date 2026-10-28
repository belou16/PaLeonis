const express = require("express");
const {
  createTicket,
  getTicket,
  assignTicket,
  updateTicketStatut,
  listTicketsTechnicien,
} = require("../controllers/ticket.controller");

const router = express.Router();

router.post("/tickets", createTicket);
router.get("/tickets/:id", getTicket);
router.patch("/tickets/:id/assignation", assignTicket);
router.patch("/tickets/:id/status", updateTicketStatut);
router.get("/techniciens/:id/tickets", listTicketsTechnicien);

module.exports = router;

const express = require("express");
const {
  createTicket,
  getTicket,
  addMessage,
  deleteTicket,
  assignTicket,
  updateTicketStatut,
  listTicketsTechnicien,
} = require("../controllers/ticket.controller");

const router = express.Router();

router.post("/tickets", createTicket);
router.get("/tickets/:id", getTicket);
router.delete("/tickets/:id", deleteTicket);
router.post("/tickets/:id/messages", addMessage);
router.patch("/tickets/:id/assignation", assignTicket);
router.patch("/tickets/:id/status", updateTicketStatut);
router.get("/techniciens/:id/tickets", listTicketsTechnicien);

module.exports = router;

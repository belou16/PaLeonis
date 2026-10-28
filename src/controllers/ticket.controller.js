const Ticket = require("../models/ticket.model");

const createTicket = async (req, res) => {
  const { clientId, serveurId, sujet, description, priorite } = req.body ?? {};
  if (!clientId || !sujet || !description) {
    return res.status(400).json({ error: "clientId, sujet et description sont obligatoires." });
  }
  try {
    res.status(201).json(await Ticket.create(clientId, serveurId, sujet, description, priorite));
  } catch (error) {
    if (error.code === "23503") return res.status(404).json({ error: "Client ou serveur introuvable." });
    if (error.code === "22P02") return res.status(400).json({ error: "Donnée invalide." });
    throw error;
  }
};

const getTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket introuvable." });
  res.status(200).json(ticket);
};

const assignTicket = async (req, res) => {
  const { technicienId } = req.body ?? {};
  if (!technicienId) return res.status(400).json({ error: "technicienId est obligatoire." });
  try {
    const ticket = await Ticket.assign(req.params.id, technicienId);
    if (!ticket) return res.status(404).json({ error: "Ticket introuvable." });
    res.status(200).json(ticket);
  } catch (error) {
    if (error.code === "23503") return res.status(404).json({ error: "Technicien introuvable." });
    throw error;
  }
};

const updateTicketStatut = async (req, res) => {
  const { statut } = req.body ?? {};
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket introuvable." });
  if (!ticket.peutPasserA(statut)) {
    return res.status(400).json({ error: `Transition ${ticket.statut} vers ${statut} impossible.` });
  }
  res.status(200).json(await Ticket.updateStatut(req.params.id, statut));
};

const listTicketsTechnicien = async (req, res) => {
  if (!(await Ticket.technicienExists(req.params.id))) {
    return res.status(404).json({ error: "Technicien introuvable." });
  }
  res.status(200).json(await Ticket.findOpenByTechnicien(req.params.id));
};

module.exports = { createTicket, getTicket, assignTicket, updateTicketStatut, listTicketsTechnicien };

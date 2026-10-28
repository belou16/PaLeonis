const Abonnement = require("../models/abonnement.model");

const listAbonnements = (req, res) => {
  try {
    const abonnements = Abonnement.findAll();
    return res.status(200).json(abonnements);
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const getAbonnement = (req, res) => {
  try {
    const abonnement = Abonnement.findById(req.params.id);
    if (!abonnement) {
      return res.status(404).json({ error: "Abonnement introuvable." });
    }
    return res.status(200).json(abonnement);
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const createAbonnement = (req, res) => {
  try {
    const abonnement = Abonnement.createOne(req.body);
    return res.status(201).json(abonnement);
  } catch (error) {
    return res.status(error.status ?? 400).json({ error: error.message });
  }
};

const resilierAbonnement = (req, res) => {
  try {
    const abonnement = Abonnement.resilier(req.params.id);
    if (!abonnement) {
      return res.status(404).json({ error: "Abonnement introuvable." });
    }
    return res.status(200).json(abonnement);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

module.exports = {
  listAbonnements,
  getAbonnement,
  createAbonnement,
  resilierAbonnement,
};

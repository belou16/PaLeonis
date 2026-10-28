const Abonnement = require("../models/abonnement.model");

const listAbonnements = async (req, res) => {
  return res.status(200).json(await Abonnement.findAll());
};

const getAbonnement = async (req, res) => {
  const abonnement = await Abonnement.findById(req.params.id);
  if (!abonnement) {
    return res.status(404).json({ error: "Abonnement introuvable." });
  }
  return res.status(200).json(abonnement);
};

const createAbonnement = async (req, res) => {
  const abonnement = await Abonnement.createOne(req.body);
  return res.status(201).json(abonnement);
};

const resilierAbonnement = async (req, res) => {
  const abonnement = await Abonnement.resilier(req.params.id);
  if (!abonnement) {
    return res.status(404).json({ error: "Abonnement introuvable." });
  }
  return res.status(200).json(abonnement);
};

module.exports = {
  listAbonnements,
  getAbonnement,
  createAbonnement,
  resilierAbonnement,
};

const Serveur = require("../models/serveur.model");

const listServeurs = async (req, res) => {
  const { datacenter, statut, attribue } = req.query;
  res.status(200).json(await Serveur.findAll(datacenter, statut, attribue));
};

const getServeur = async (req, res) => {
  const serveur = await Serveur.findById(req.params.id);
  if (!serveur) return res.status(404).json({ error: "Serveur introuvable." });
  res.status(200).json(serveur);
};

module.exports = { listServeurs, getServeur };

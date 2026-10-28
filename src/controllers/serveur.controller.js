const Serveur = require("../models/serveur.model");
const Technicien = require("../models/technicien.model");
const Evenement = require("../models/evenement.model");

const listServeurs = async (req, res) => {
  const { datacenter, statut, attribue } = req.query;
  res.status(200).json(await Serveur.findAll(datacenter, statut, attribue));
};

const getServeur = async (req, res) => {
  const serveur = await Serveur.findById(req.params.id);
  if (!serveur) return res.status(404).json({ error: "Serveur introuvable." });
  res.status(200).json(serveur);
};

// Suppression en cascade applicative : PostgreSQL d'abord, puis le journal MongoDB.
const deleteServeur = async (req, res) => {
  const serveur = await Serveur.findById(req.params.id);
  if (!serveur) return res.status(404).json({ error: "Serveur introuvable." });
  if (serveur.attribue) {
    return res.status(409).json({ error: "Serveur attribué à un abonnement." });
  }
  await Serveur.deleteOne(serveur.id);
  await Evenement.deleteMany({ serveurId: serveur.id });
  res.status(204).end();
};

const createEvenement = async (req, res) => {
  const serveur = await Serveur.findById(req.params.id);
  if (!serveur) return res.status(404).json({ error: "Serveur introuvable." });
  const { technicienId } = req.body ?? {};
  if (technicienId !== undefined && !(await Technicien.findById(technicienId))) {
    return res.status(404).json({ error: "Technicien introuvable." });
  }
  res.status(201).json(await Evenement.enregistrer(serveur.id, req.body));
};

const listEvenements = async (req, res) => {
  const serveur = await Serveur.findById(req.params.id);
  if (!serveur) return res.status(404).json({ error: "Serveur introuvable." });
  res.status(200).json(await Evenement.lister(serveur.id, req.query));
};

const statsEvenements = async (req, res) => {
  const serveur = await Serveur.findById(req.params.id);
  if (!serveur) return res.status(404).json({ error: "Serveur introuvable." });
  res.status(200).json({ serveurId: serveur.id, parType: await Evenement.statistiques(serveur.id) });
};

const alertesParJour = async (req, res) => {
  res.status(200).json(await Evenement.alertesParJour());
};

module.exports = {
  listServeurs,
  getServeur,
  deleteServeur,
  createEvenement,
  listEvenements,
  statsEvenements,
  alertesParJour,
};

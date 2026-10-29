const Catalogue = require("../models/catalogue.model");

const listCatalogues = async (req, res) => {
  const { categorie, en_vente } = req.query;
  return res.status(200).json(await Catalogue.findAll(categorie, en_vente));
};

const getCatalogue = async (req, res) => {
  const catalogue = await Catalogue.findById(req.params.id);
  if (!catalogue) {
    return res.status(404).json({ error: "Offre introuvable." });
  }
  return res.status(200).json(catalogue);
};

const createCatalogue = async (req, res) => {
  const catalogue = await Catalogue.createOne(req.body);
  return res.status(201).json(catalogue);
};

const updateCatalogue = async (req, res) => {
  const updatedCatalogue = await Catalogue.updateOne(req.params.id, req.body);
  if (!updatedCatalogue) {
    return res.status(404).json({ error: "Offre introuvable." });
  }
  return res.status(200).json(updatedCatalogue);
};

const retirerCatalogue = async (req, res) => {
  const catalogue = await Catalogue.retirer(req.params.id);
  if (!catalogue) {
    return res.status(404).json({ error: "Offre introuvable." });
  }
  return res.status(200).json(catalogue);
};

module.exports = {
  listCatalogues,
  getCatalogue,
  createCatalogue,
  updateCatalogue,
  retirerCatalogue,
};

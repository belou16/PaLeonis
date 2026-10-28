const Catalogue = require("../models/catalogue.model");

const listCatalogues = (req, res) => {
  try {
    const catalogues = Catalogue.findAll();
    return res.status(200).json(catalogues);
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const getCatalogue = (req, res) => {
  try {
    const catalogue = Catalogue.findById(req.params.id);
    if (!catalogue) {
      return res.status(404).json({ error: "Catalogue introuvable." });
    }
    return res.status(200).json(catalogue);
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const createCatalogue = (req, res) => {
  try {
    const catalogue = Catalogue.createOne(req.body);
    return res.status(201).json(catalogue);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const updateCatalogue = (req, res) => {
  try {
    const updatedCatalogue = Catalogue.updateOne(req.params.id, req.body);
    if (!updatedCatalogue) {
      return res.status(404).json({ error: "Catalogue introuvable." });
    }
    return res.status(200).json(updatedCatalogue);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteCatalogue = (req, res) => {
  try {
    const deletedCatalogue = Catalogue.deleteOne(req.params.id);
    if (!deletedCatalogue) {
      return res.status(404).json({ error: "Catalogue introuvable." });
    }
    return res.status(200).json({ message: "Catalogue supprimé avec succès." });
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

module.exports = {
  listCatalogues,
  getCatalogue,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
};

const Catalogue = require("../models/catalogue.model");

const validerOffre = ({ nom, categorie, prixMensuelHt, enVente }) => {
  if (typeof nom !== "string" || nom.trim() === "") return "nom est obligatoire.";
  if (!Catalogue.CATEGORIES.includes(categorie)) {
    return `categorie doit valoir ${Catalogue.CATEGORIES.join(", ")}.`;
  }
  if (typeof prixMensuelHt !== "number" || prixMensuelHt < 0) {
    return "prixMensuelHt doit être un nombre positif.";
  }
  if (enVente !== undefined && typeof enVente !== "boolean") return "enVente doit être un booléen.";
  return null;
};

const listCatalogues = async (req, res) => {
  const { categorie, enVente } = req.query;
  res.status(200).json(await Catalogue.findAll(categorie, enVente));
};

const getCatalogue = async (req, res) => {
  const offre = await Catalogue.findById(req.params.id);
  if (!offre) return res.status(404).json({ error: "Offre introuvable." });
  res.status(200).json(offre);
};

const createCatalogue = async (req, res) => {
  const erreur = validerOffre(req.body ?? {});
  if (erreur) return res.status(400).json({ error: erreur });
  res.status(201).json(await Catalogue.create(req.body));
};

const updateCatalogue = async (req, res) => {
  const erreur = validerOffre(req.body ?? {});
  if (erreur) return res.status(400).json({ error: erreur });
  const offre = await Catalogue.update(req.params.id, req.body);
  if (!offre) return res.status(404).json({ error: "Offre introuvable." });
  res.status(200).json(offre);
};

const retirerCatalogue = async (req, res) => {
  const offre = await Catalogue.retirer(req.params.id);
  if (!offre) return res.status(404).json({ error: "Offre introuvable." });
  res.status(200).json(offre);
};

module.exports = {
  listCatalogues,
  getCatalogue,
  createCatalogue,
  updateCatalogue,
  retirerCatalogue,
};

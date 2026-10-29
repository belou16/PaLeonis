// Dernier middleware : traduit les erreurs non gérées par les contrôleurs en codes HTTP.
const errorHandler = (error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Corps JSON invalide." });
  }
  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error.name === "ValidationError") {
    const details = Object.fromEntries(
      Object.entries(error.errors).map(([champ, e]) => [champ, e.message])
    );
    return res.status(422).json({ error: "Document invalide.", details });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ error: `Valeur invalide pour ${error.path}.` });
  }
  if (error.code === 11000) {
    return res.status(409).json({ error: "Valeur déjà existante." });
  }
  if (error.code === "22P02") {
    return res.status(400).json({ error: "Donnée invalide." });
  }

  console.error(error);
  res.status(500).json({ error: "Erreur interne du serveur." });
};

module.exports = errorHandler;

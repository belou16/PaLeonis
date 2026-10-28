const Technicien = require("../models/technicien.model");

const listTechniciens = async (req, res) => {
  res.status(200).json(await Technicien.findAll());
};

const getTechnicien = async (req, res) => {
  const technicien = await Technicien.findById(req.params.id);
  if (!technicien) return res.status(404).json({ error: "Technicien introuvable." });
  res.status(200).json(technicien);
};

module.exports = { listTechniciens, getTechnicien };

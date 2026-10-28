const Dashboard = require("../models/dashboard.model");

const getRevenus = async (req, res) => {
  res.status(200).json(await Dashboard.revenus());
};

const getServeurs = async (req, res) => {
  res.status(200).json(await Dashboard.serveurs());
};

module.exports = { getRevenus, getServeurs };

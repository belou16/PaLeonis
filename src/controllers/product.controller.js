const Product = require('../models/product.model');

const listProducts = (req, res) => {
  try {
    const products = Product.findAll();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

const getProduct = (req, res) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

const createProduct = (req, res) => {
  try {
    const product = Product.createOne(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { listProducts, getProduct, createProduct };

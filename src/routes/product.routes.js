const express = require("express");
const {
  listProducts,
  getProduct,
  createProduct,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);

module.exports = router;

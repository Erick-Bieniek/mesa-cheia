const productService = require('../services/productService');
const productModel = require('../models/productModel');
const asyncHandler = require('../utils/asyncHandler');

// GET /search?query=&cat=&page=&limit=
// page/limit ja foram validados pelo middleware validateSearch (req.pagination).
exports.search = asyncHandler(async (req, res) => {
  const { query = '', cat = '' } = req.query;
  const { page, limit } = req.pagination;

  const result = productService.search({ query, cat, page, limit });
  res.status(200).json(result);
});

// GET /categories -> lista de categorias (alimenta o filtro do front)
exports.categories = asyncHandler(async (_req, res) => {
  res.status(200).json({ categories: productModel.listCategories() });
});

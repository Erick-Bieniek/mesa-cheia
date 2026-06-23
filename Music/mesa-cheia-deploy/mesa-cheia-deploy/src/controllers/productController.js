const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');

// GET /product/:id  -> detalhe do produto (200 ou 404)
exports.getOne = asyncHandler(async (req, res) => {
  const product = productService.getById(req.params.id);
  res.status(200).json(product);
});

// GET /featured -> 4 destaques da home
exports.getFeatured = asyncHandler(async (_req, res) => {
  res.status(200).json({ items: productService.getFeatured() });
});

// POST /products (Basic Auth) -> cria produto (201)
exports.create = asyncHandler(async (req, res) => {
  const product = productService.create(req.body);
  res.status(201).json(product);
});

// DELETE /product/:id (Basic Auth) -> remove produto (200 ou 404)
exports.remove = asyncHandler(async (req, res) => {
  productService.remove(req.params.id);
  res.status(200).json({ message: 'Produto deletado com sucesso.' });
});

const cartService = require('../services/cartService');
const cartModel = require('../models/cartModel');
const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');

// POST /cart (publico) -> recebe itens + cupom e devolve o resumo calculado.
// E o coracao do carrinho do front (que guarda os itens no LocalStorage).
exports.summary = asyncHandler(async (req, res) => {
  const { items = [], cupomCode = '' } = req.body || {};
  const resumo = cartService.buildSummary(items, cupomCode);
  res.status(200).json(resumo);
});

// ---- Rotas BONUS: carrinho persistido no banco, por usuario (JWT) ----------

// GET /cart -> resumo do carrinho salvo na conta
exports.getUserCart = asyncHandler(async (req, res) => {
  const items = cartModel.getItems(req.user.id);
  const resumo = cartService.buildSummary(items, '');
  res.status(200).json(resumo);
});

// PUT /cart/items  body { productId, qty } -> adiciona/atualiza item
exports.putItem = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body || {};
  productService.getById(productId); // valida existencia (lanca 404 se nao houver)
  const q = Number(qty);
  if (!Number.isInteger(q) || q < 1) {
    return res.status(400).json({ error: { status: 400, message: 'qty deve ser inteiro >= 1.' } });
  }
  cartModel.upsertItem(req.user.id, Number(productId), q);
  const resumo = cartService.buildSummary(cartModel.getItems(req.user.id), '');
  res.status(200).json(resumo);
});

// PUT /cart/items/:productId  body { qty } -> altera quantidade
exports.updateQty = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const q = Number(req.body?.qty);
  if (!Number.isInteger(q) || q < 1) {
    return res.status(400).json({ error: { status: 400, message: 'qty deve ser inteiro >= 1.' } });
  }
  const ok = cartModel.setQty(req.user.id, productId, q);
  if (!ok) return res.status(404).json({ error: { status: 404, message: 'Item nao esta no carrinho.' } });
  const resumo = cartService.buildSummary(cartModel.getItems(req.user.id), '');
  res.status(200).json(resumo);
});

// DELETE /cart/items/:productId -> remove item
exports.removeItem = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const ok = cartModel.removeItem(req.user.id, productId);
  if (!ok) return res.status(404).json({ error: { status: 404, message: 'Item nao esta no carrinho.' } });
  const resumo = cartService.buildSummary(cartModel.getItems(req.user.id), '');
  res.status(200).json(resumo);
});

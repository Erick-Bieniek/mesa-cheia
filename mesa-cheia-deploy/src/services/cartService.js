const productModel = require('../models/productModel');
const AppError = require('../utils/AppError');

// Regras de negocio do carrinho (frete, cupom, totais). Mantidas FORA do
// controller pra poderem ser reusadas por POST /cart e pelo carrinho do usuario.

const FRETE_PADRAO = 25;       // R$ 25 quando subtotal < 200
const FRETE_GRATIS_ACIMA = 200; // frete gratis a partir de R$ 200
const CUPONS = { URI10: 0.10 }; // URI10 = 10% de desconto

// Arredonda pra 2 casas evitando lixo de ponto flutuante (ex.: 0.1+0.2).
const money = (n) => Math.round(n * 100) / 100;

/**
 * Recebe itens crus [{ productId, qty }] e um cupom; busca os precos reais no
 * banco (nunca confia no preco vindo do front) e devolve o resumo completo.
 */
function buildSummary(rawItems = [], cupomCode = '') {
  if (!Array.isArray(rawItems)) {
    throw new AppError(400, 'O campo "items" deve ser uma lista.');
  }

  // normaliza e valida quantidades
  const wanted = rawItems
    .map((i) => ({ productId: Number(i.productId), qty: Number(i.qty) }))
    .filter((i) => Number.isInteger(i.productId) && Number.isInteger(i.qty) && i.qty > 0);

  const ids = wanted.map((i) => i.productId);
  const produtos = productModel.findManyByIds(ids);
  const mapa = new Map(produtos.map((p) => [p.id, p]));

  const items = [];
  let subtotal = 0;

  for (const it of wanted) {
    const prod = mapa.get(it.productId);
    if (!prod) continue; // ignora produto inexistente em vez de quebrar o carrinho
    const lineTotal = money(prod.price * it.qty);
    subtotal += lineTotal;
    items.push({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      qty: it.qty,
      image: prod.image,
      lineTotal,
    });
  }

  subtotal = money(subtotal);

  // frete: gratis se atingiu o limite OU se o carrinho esta vazio
  const freight = (subtotal === 0 || subtotal >= FRETE_GRATIS_ACIMA) ? 0 : FRETE_PADRAO;

  // cupom (case-insensitive)
  let discount = 0;
  const codigo = (cupomCode || '').trim().toUpperCase();
  if (codigo) {
    const taxa = CUPONS[codigo];
    if (!taxa) throw new AppError(400, `Cupom invalido: ${codigo}`);
    discount = money(subtotal * taxa);
  }

  const total = money(subtotal - discount + freight);

  return { items, subtotal, freight, discount, total, coupon: codigo || null };
}

module.exports = { buildSummary };

const productModel = require('../models/productModel');
const AppError = require('../utils/AppError');

function getById(id) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId < 1) {
    throw new AppError(400, 'ID de produto invalido.');
  }
  const product = productModel.findById(numId);
  if (!product) throw new AppError(404, 'Produto nao encontrado.');
  return product;
}

function getFeatured() {
  return productModel.getFeatured(4);
}

function search(params) {
  const { items, total } = productModel.search(params);
  const { page, limit } = params;
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function create(data) {
  // validacao minima de campos obrigatorios
  if (!data || !data.name || typeof data.price !== 'number' || !data.category) {
    throw new AppError(400, 'Campos obrigatorios: name (texto), price (numero), category (texto).');
  }
  if (data.price < 0) throw new AppError(400, 'O preco nao pode ser negativo.');
  return productModel.create(data);
}

function remove(id) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId < 1) {
    throw new AppError(400, 'ID de produto invalido.');
  }
  const ok = productModel.remove(numId);
  if (!ok) throw new AppError(404, 'Produto nao encontrado para deletar.');
  return true;
}

module.exports = { getById, getFeatured, search, create, remove };

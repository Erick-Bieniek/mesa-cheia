// Carrinho do front: a LISTA de itens (productId + qty) vive no LocalStorage,
// mas os PRECOS e o resumo (subtotal/frete/desconto/total) vem sempre da API
// (POST /cart). E o "LocalStorage mesclado com o banco" pedido no enunciado:
// o navegador lembra O QUE voce colocou; o servidor diz QUANTO custa.

import { postCart } from './api.js';

const KEY = 'mesa-cheia:cart';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function write(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  updateBadge();
}

export const getItems = () => read();

export function addItem(productId, qty = 1) {
  const items = read();
  const found = items.find((i) => i.productId === productId);
  if (found) found.qty += qty;
  else items.push({ productId, qty });
  write(items);
}

export function setQty(productId, qty) {
  let items = read();
  if (qty <= 0) items = items.filter((i) => i.productId !== productId);
  else { const it = items.find((i) => i.productId === productId); if (it) it.qty = qty; }
  write(items);
}

export function removeItem(productId) {
  write(read().filter((i) => i.productId !== productId));
}

export const clear = () => write([]);

export const count = () => read().reduce((s, i) => s + i.qty, 0);

// Resumo calculado pelo servidor a partir dos itens locais
export const getSummary = (cupomCode = '') => postCart(read(), cupomCode);

// Atualiza o numerinho no icone do carrinho (no header)
export function updateBadge() {
  const el = document.querySelector('.cart-count');
  if (!el) return;
  const n = count();
  el.textContent = n;
  el.hidden = n === 0;
}

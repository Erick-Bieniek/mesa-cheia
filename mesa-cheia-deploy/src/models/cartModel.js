const { db } = require('../config/db');

// Carrinho persistido por usuario (rotas bonus). Cada linha = um item.
function getItems(userId) {
  return db.prepare('SELECT productId, qty FROM cart_items WHERE userId = ?')
    .all(userId);
}

// Insere ou atualiza (UPSERT) usando a restricao UNIQUE(userId, productId).
function upsertItem(userId, productId, qty) {
  db.prepare(`
    INSERT INTO cart_items (userId, productId, qty)
    VALUES (?, ?, ?)
    ON CONFLICT(userId, productId) DO UPDATE SET qty = excluded.qty
  `).run(userId, productId, qty);
}

function setQty(userId, productId, qty) {
  const info = db.prepare(
    'UPDATE cart_items SET qty = ? WHERE userId = ? AND productId = ?'
  ).run(qty, userId, productId);
  return info.changes > 0;
}

function removeItem(userId, productId) {
  const info = db.prepare(
    'DELETE FROM cart_items WHERE userId = ? AND productId = ?'
  ).run(userId, productId);
  return info.changes > 0;
}

module.exports = { getItems, upsertItem, setQty, removeItem };

const { db } = require('../config/db');

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function create({ name, email, passwordHash, isAdmin = 0 }) {
  const info = db.prepare(`
    INSERT INTO users (name, email, password, isAdmin)
    VALUES (?, ?, ?, ?)
  `).run(name, email, passwordHash, isAdmin ? 1 : 0);
  return findById(info.lastInsertRowid);
}

module.exports = { findByEmail, findById, create };

const { db } = require('../config/db');

// Camada de MODELO: aqui mora SOMENTE o acesso ao banco (SQL). Nenhuma regra
// de negocio. Isso mantem as camadas separadas e facil de explicar/testar.

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function findById(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

function findManyByIds(ids) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  return db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`).all(...ids);
}

function getFeatured(limit = 4) {
  // "destaques" = os com maior desconto (oldPrice preenchido), depois mais novos
  return db.prepare(`
    SELECT * FROM products
    ORDER BY (oldPrice IS NOT NULL) DESC, createdAt DESC
    LIMIT ?
  `).all(limit);
}

// Busca com filtro de texto (nome/descricao/designer/mecanica), categoria,
// e paginacao. Retorna { items, total }.
function search({ query = '', cat = '', page = 1, limit = 12 }) {
  const where = [];
  const params = {};

  if (query) {
    where.push(`(
      name      LIKE @q OR
      description LIKE @q OR
      designer  LIKE @q OR
      mechanic  LIKE @q OR
      category  LIKE @q
    )`);
    params.q = `%${query}%`;
  }
  if (cat) {
    where.push('category = @cat');
    params.cat = cat;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const total = db.prepare(`SELECT COUNT(*) AS n FROM products ${whereSql}`)
    .get(params).n;

  const items = db.prepare(`
    SELECT * FROM products
    ${whereSql}
    ORDER BY name ASC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset });

  return { items, total };
}

function listCategories() {
  return db.prepare('SELECT DISTINCT category FROM products ORDER BY category')
    .all().map((r) => r.category);
}

function create(data) {
  const stmt = db.prepare(`
    INSERT INTO products
      (name, slug, category, price, oldPrice, description, image, stock,
       players, playtime, age, weight, designer, mechanic)
    VALUES
      (@name, @slug, @category, @price, @oldPrice, @description, @image, @stock,
       @players, @playtime, @age, @weight, @designer, @mechanic)
  `);
  const info = stmt.run({
    name: data.name,
    slug: slugify(data.name),
    category: data.category,
    price: data.price,
    oldPrice: data.oldPrice ?? null,
    description: data.description ?? null,
    image: data.image ?? null,
    stock: data.stock ?? 0,
    players: data.players ?? null,
    playtime: data.playtime ?? null,
    age: data.age ?? null,
    weight: data.weight ?? null,
    designer: data.designer ?? null,
    mechanic: data.mechanic ?? null,
  });
  return findById(info.lastInsertRowid);
}

function remove(id) {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return info.changes > 0; // true se realmente apagou algo
}

module.exports = {
  findById, findManyByIds, getFeatured,
  search, listCategories, create, remove,
};

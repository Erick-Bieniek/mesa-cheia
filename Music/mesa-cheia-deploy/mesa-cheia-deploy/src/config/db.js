const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      slug        TEXT    NOT NULL,
      category    TEXT    NOT NULL,
      price       REAL    NOT NULL,
      oldPrice    REAL,
      description TEXT,
      image       TEXT,
      stock       INTEGER NOT NULL DEFAULT 0,
      players     TEXT,
      playtime    TEXT,
      age         TEXT,
      weight      REAL,
      designer    TEXT,
      mechanic    TEXT,
      createdAt   TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE,
      password  TEXT    NOT NULL,
      isAdmin   INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      userId    INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      qty       INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (userId)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE (userId, productId)
    );
  `);
}

function seed() {
  const total = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  if (total > 0) return;

  const produtos = [
    { name: 'Catan', category: 'Estrategia', price: 289.90, oldPrice: 349.90, description: 'O classico de troca de recursos e construcao de colonias. Negocie madeira, tijolo e ovelha para dominar a ilha.', image: '/img/catan.svg', stock: 12, players: '3-4', playtime: '60-90 min', age: '10+', weight: 2.3, designer: 'Klaus Teuber', mechanic: 'Gestao de recursos' },
    { name: 'Wingspan', category: 'Estrategia', price: 339.90, oldPrice: null, description: 'Construa habitats e atraia aves para sua reserva. Componentes lindos e mecanica de motor de acoes.', image: '/img/wingspan.svg', stock: 8, players: '1-5', playtime: '40-70 min', age: '10+', weight: 2.4, designer: 'Elizabeth Hargrave', mechanic: 'Engine building' },
    { name: 'Ticket to Ride', category: 'Familia', price: 259.90, oldPrice: 299.90, description: 'Cruze o mapa construindo rotas de trem e completando bilhetes de destino. Simples de aprender, dificil de largar.', image: '/img/ticket.svg', stock: 15, players: '2-5', playtime: '30-60 min', age: '8+', weight: 1.8, designer: 'Alan R. Moon', mechanic: 'Coleta de cartas' },
    { name: 'Pandemic', category: 'Cooperativo', price: 229.90, oldPrice: null, description: 'Trabalhe em equipe para conter quatro doencas antes que o mundo colapse. Ganha-se ou perde-se junto.', image: '/img/pandemic.svg', stock: 10, players: '2-4', playtime: '45 min', age: '8+', weight: 2.4, designer: 'Matt Leacock', mechanic: 'Cooperativo' },
    { name: 'Azul', category: 'Familia', price: 199.90, oldPrice: 239.90, description: 'Selecione azulejos e componha o padrao mais bonito (e pontuado) do palacio. Abstrato e elegante.', image: '/img/azul.svg', stock: 20, players: '2-4', playtime: '30-45 min', age: '8+', weight: 1.8, designer: 'Michael Kiesling', mechanic: 'Draft de pecas' },
    { name: 'Carcassonne', category: 'Familia', price: 189.90, oldPrice: null, description: 'Encaixe ladrilhos para formar cidades, estradas e campos, e posicione seus meeples para pontuar.', image: '/img/carcassonne.svg', stock: 18, players: '2-5', playtime: '35 min', age: '7+', weight: 1.9, designer: 'Klaus-Jurgen Wrede', mechanic: 'Posicionamento de ladrilhos' },
    { name: 'Codenames', category: 'Party', price: 129.90, oldPrice: 159.90, description: 'Dois espioes-chefes dao dicas de uma palavra para a equipe descobrir seus agentes. Ideal para grupos.', image: '/img/codenames.svg', stock: 25, players: '2-8+', playtime: '15 min', age: '10+', weight: 1.3, designer: 'Vlaada Chvatil', mechanic: 'Deducao por palavras' },
    { name: 'Dixit', category: 'Party', price: 219.90, oldPrice: null, description: 'Cartas onirico-ilustradas e dicas criativas: nem obvio demais, nem obscuro demais. Pura imaginacao.', image: '/img/dixit.svg', stock: 14, players: '3-6', playtime: '30 min', age: '8+', weight: 1.2, designer: 'Jean-Louis Roubira', mechanic: 'Narrativa e palpite' },
    { name: '7 Wonders', category: 'Estrategia', price: 279.90, oldPrice: 319.90, description: 'Lidere uma civilizacao por tres eras via draft simultaneo de cartas. Aguenta muita gente sem demorar.', image: '/img/7wonders.svg', stock: 9, players: '3-7', playtime: '30 min', age: '10+', weight: 2.3, designer: 'Antoine Bauza', mechanic: 'Draft simultaneo' },
    { name: 'Spirit Island', category: 'Cooperativo', price: 459.90, oldPrice: null, description: 'Espiritos da ilha unem forcas para expulsar colonizadores. Cooperativo pesado e cheio de combos.', image: '/img/spiritisland.svg', stock: 5, players: '1-4', playtime: '90-120 min', age: '13+', weight: 4.0, designer: 'R. Eric Reuss', mechanic: 'Cooperativo / Poderes' },
    { name: 'Splendor', category: 'Estrategia', price: 209.90, oldPrice: 249.90, description: 'Colete gemas, compre cartas de desenvolvimento e atraia nobres. Motor economico enxuto e viciante.', image: '/img/splendor.svg', stock: 16, players: '2-4', playtime: '30 min', age: '10+', weight: 1.8, designer: 'Marc Andre', mechanic: 'Engine building' },
    { name: 'The Crew', category: 'Cooperativo', price: 99.90, oldPrice: null, description: 'Um jogo de vazas cooperativo: cumpram missoes silenciosas no espaco. Pequeno, barato e genial.', image: '/img/thecrew.svg', stock: 30, players: '2-5', playtime: '20 min', age: '10+', weight: 2.0, designer: 'Thomas Sing', mechanic: 'Vazas cooperativas' },
  ];

  const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const insert = db.prepare(`INSERT INTO products (name, slug, category, price, oldPrice, description, image, stock, players, playtime, age, weight, designer, mechanic) VALUES (@name, @slug, @category, @price, @oldPrice, @description, @image, @stock, @players, @playtime, @age, @weight, @designer, @mechanic)`);
  const inserirTodos = db.transaction((lista) => { for (const p of lista) insert.run({ ...p, slug: slugify(p.name) }); });
  inserirTodos(produtos);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mesacheia.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const adminHash = bcrypt.hashSync(adminPass, 10);
  db.prepare('INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, 1)').run('Administrador', adminEmail, adminHash);
  const clienteHash = bcrypt.hashSync('cliente123', 10);
  db.prepare('INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, 0)').run('Erick Cliente', 'cliente@mesacheia.com', clienteHash);
  console.log('Banco populado com dados iniciais (produtos + usuarios).');
}

function initDb() { createTables(); seed(); }
module.exports = { db, initDb };
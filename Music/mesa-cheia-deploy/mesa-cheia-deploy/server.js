require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const { initDb } = require('./src/config/db');
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'database.sqlite');
if (fs.existsSync(dbPath)) { fs.unlinkSync(dbPath); console.log('Banco removido'); }
if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');
if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');
initDb();
app.listen(PORT, () => {
  console.log('Mesa Cheia API rodando em http://localhost:' + PORT);
  console.log('Swagger em http://localhost:' + PORT + '/docs');
});

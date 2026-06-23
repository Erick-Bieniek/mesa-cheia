// Script avulso para (re)popular o banco manualmente: `npm run seed`.
// Util se voce apagar o database.sqlite e quiser recriar do zero.
require('dotenv').config();
const { initDb } = require('./db');

initDb();
console.log('Seed concluido.');

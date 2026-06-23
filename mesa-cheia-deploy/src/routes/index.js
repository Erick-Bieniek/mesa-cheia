const router = require('express').Router();

const healthController = require('../controllers/healthController');
const productRoutes = require('./productRoutes');
const searchRoutes = require('./searchRoutes');
const cartRoutes = require('./cartRoutes');
const authRoutes = require('./authRoutes');

// Health check fica solto na raiz
router.get('/health', healthController.health);

// Demais grupos de rotas
router.use('/', productRoutes);
router.use('/', searchRoutes);
router.use('/', cartRoutes);
router.use('/', authRoutes);

module.exports = router;

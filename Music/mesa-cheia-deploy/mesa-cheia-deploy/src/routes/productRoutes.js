const router = require('express').Router();
const productController = require('../controllers/productController');
const { basicAuth } = require('../middlewares/auth');

// Publicas
router.get('/featured', productController.getFeatured);
router.get('/product/:id', productController.getOne);

// Protegidas por Basic Auth (somente admin) — exigido no enunciado
router.post('/products', basicAuth, productController.create);
router.delete('/product/:id', basicAuth, productController.remove);

module.exports = router;

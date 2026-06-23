const router = require('express').Router();
const cartController = require('../controllers/cartController');
const { jwtAuth } = require('../middlewares/auth');

// Publica: recalcula o resumo a partir dos itens enviados (LocalStorage do front)
router.post('/cart', cartController.summary);

// Bonus: carrinho persistido por usuario (precisa de token JWT)
router.get('/cart', jwtAuth, cartController.getUserCart);
router.put('/cart/items', jwtAuth, cartController.putItem);
router.put('/cart/items/:productId', jwtAuth, cartController.updateQty);
router.delete('/cart/items/:productId', jwtAuth, cartController.removeItem);

module.exports = router;

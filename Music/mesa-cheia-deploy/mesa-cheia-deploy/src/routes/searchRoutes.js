const router = require('express').Router();
const searchController = require('../controllers/searchController');
const validateSearch = require('../middlewares/validateSearch');

router.get('/search', validateSearch, searchController.search);
router.get('/categories', searchController.categories);

module.exports = router;

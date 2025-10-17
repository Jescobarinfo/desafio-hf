const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
    bulkCreateProducts,
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.post('/bulk', bulkCreateProducts); 
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);


module.exports = router;
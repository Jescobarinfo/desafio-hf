const pool = require('../config/database');

// GET /products
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_get_all_products()');
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error en sp_get_all_products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// POST /products
const createProduct = async (req, res) => {
  const { product_id, title, price, description, category_id, image_url, rating_score, review_count } = req.body;

  if (!product_id || !title || !price || !category_id) {
    return res.status(400).json({
      success: false,
      message: 'Campos requeridos: product_id, title, price, category_id'
    });
  }

  try {
    const result = await pool.query(
      'SELECT sp_create_product($1, $2, $3, $4, $5, $6, $7, $8) as product_id',
      [
        product_id,
        title,
        price,
        description || null,
        category_id,
        image_url || null,
        rating_score || null,
        review_count || 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        product_id: result.rows[0].product_id
      }
    });
  } catch (error) {
    console.error('Error en sp_create_product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// PUT /products/:id
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, description, category_id, image_url, rating_score, review_count } = req.body;

  if (!title || !price || !category_id) {
    return res.status(400).json({
      success: false,
      message: 'Campos requeridos: title, price, category_id'
    });
  }

  try {
    const result = await pool.query(
      'SELECT sp_update_product($1, $2, $3, $4, $5, $6, $7, $8) as updated',
      [
        parseInt(id),
        title,
        price,
        description || null,
        category_id,
        image_url || null,
        rating_score || null,
        review_count || null
      ]
    );

    if (result.rows[0].updated) {
      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
  } catch (error) {
    console.error('Error en sp_update_product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// DELETE /products/:id
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT sp_delete_product($1) as deleted',
      [parseInt(id)]
    );

    if (result.rows[0].deleted) {
      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
  } catch (error) {
    console.error('Error en sp_delete_product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

const bulkCreateProducts = async (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere un array de productos'
    });
  }

  try {
    const results = [];
    const errors = [];

    // Procesar cada producto
    for (const product of products) {
      try {
        const result = await pool.query(
          `SELECT sp_bulk_insert_product($1, $2, $3, $4, $5, $6, $7, $8) as product_id`,
          [
            product.id,
            product.title,
            product.price,
            product.description,
            product.category,
            product.image,
            product.rating?.rate || null,
            product.rating?.count || null
          ]
        );
        results.push(result.rows[0].product_id);
      } catch (error) {
        errors.push({
          product_id: product.id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Carga masiva completada`,
      inserted: results.length,
      errors: errors.length,
      details: { results, errors }
    });
  } catch (error) {
    console.error('Error en carga masiva:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la carga masiva',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
bulkCreateProducts
};
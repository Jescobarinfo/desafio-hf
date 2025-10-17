const pool = require('../config/database');

// GET /category
const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_get_all_categories()');
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error en sp_get_all_categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// POST /category
const createCategory = async (req, res) => {
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({
      success: false,
      message: 'El campo category_name es requerido'
    });
  }

  try {
    const result = await pool.query(
      'SELECT sp_create_category($1) as category_id',
      [category_name]
    );

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: {
        category_id: result.rows[0].category_id
      }
    });
  } catch (error) {
    console.error('Error en sp_create_category:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'La categoría ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory
};
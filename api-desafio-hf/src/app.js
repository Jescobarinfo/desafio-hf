const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/products', productRoutes);
app.use('/category', categoryRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '✅ API funcionando correctamente',
    endpoints: {
      products: {
        getAll: 'GET /products',
        create: 'POST /products',
        update: 'PUT /products/:id',
        delete: 'DELETE /products/:id'
      },
      categories: {
        getAll: 'GET /category',
        create: 'POST /category'
      }
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

module.exports = app;
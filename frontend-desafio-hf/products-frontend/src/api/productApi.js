import axiosInstance from './axiosConfig';

export const productApi = {
  // GET /products
  getAll: async () => {
    const response = await axiosInstance.get('/products');
    return response.data;
  },

  // POST /products
  create: async (productData) => {
    const response = await axiosInstance.post('/products', productData);
    return response.data;
  },

  // PUT /products/:id
  update: async (id, productData) => {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
  },

  // DELETE /products/:id
  delete: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },
    // POST /products/bulk
  bulkCreate: async (products) => {
    const response = await axiosInstance.post('/products/bulk', { products });
    return response.data;
  },
};
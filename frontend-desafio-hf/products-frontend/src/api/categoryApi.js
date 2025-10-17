import axiosInstance from './axiosConfig';

export const categoryApi = {
  // GET /category
  getAll: async () => {
    const response = await axiosInstance.get('/category');
    return response.data;
  },

  // POST /category
  create: async (categoryData) => {
    const response = await axiosInstance.post('/category', categoryData);
    return response.data;
  },
};
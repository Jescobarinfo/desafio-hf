import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../../api/productApi';
import { showSuccess, showError } from '../../utils/notifications';

// Thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productApi.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar productos');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const response = await productApi.create(productData);
      showSuccess('Producto creado exitosamente');
      // Recargar todos los productos después de crear uno nuevo
      dispatch(fetchProducts());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear producto';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await productApi.update(id, data);
      showSuccess('Producto actualizado exitosamente');
      // Recargar todos los productos después de actualizar
      dispatch(fetchProducts());
      return { id, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar producto';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await productApi.delete(id);
      showSuccess('Producto eliminado exitosamente');
      // Recargar todos los productos después de eliminar
      dispatch(fetchProducts());
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar producto';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

export const bulkCreateProducts = createAsyncThunk(
  'products/bulkCreate',
  async (products, { rejectWithValue, dispatch }) => {
    try {
      const response = await productApi.bulkCreate(products);
      showSuccess(`${response.inserted} productos cargados exitosamente`);
      // Recargar todos los productos después de la carga masiva
      dispatch(fetchProducts());
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Error en carga masiva';
      showError(message);
      return rejectWithValue(message);
    }
  }
);


// Slice
const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    filteredItems: [],
    loading: false,
    error: null,
    filters: {
      name: '',
      categoryId: null,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      
      // Aplicar filtros
      let filtered = state.items;
      
      if (state.filters.name) {
        filtered = filtered.filter(product =>
          product.title.toLowerCase().includes(state.filters.name.toLowerCase())
        );
      }
      
      if (state.filters.categoryId) {
        filtered = filtered.filter(product =>
          product.category_id === state.filters.categoryId
        );
      }
      
      state.filteredItems = filtered;
    },
    clearFilters: (state) => {
      state.filters = { name: '', categoryId: null };
      state.filteredItems = state.items;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        // No es necesario agregar manualmente, fetchProducts se encarga de recargar la lista
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state) => {
        // No es necesario actualizar manualmente, fetchProducts se encarga de recargar la lista
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state) => {
        // No es necesario eliminar manualmente, fetchProducts se encarga de recargar la lista
      })

      .addCase(bulkCreateProducts.pending, (state) => {
  state.loading = true;
})
.addCase(bulkCreateProducts.fulfilled, (state) => {
  state.loading = false;
  // Recargar productos después de carga masiva
})
.addCase(bulkCreateProducts.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
});
      
  },
});

export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;
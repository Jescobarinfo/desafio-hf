import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryApi } from '../../api/categoryApi';
import { showSuccess, showError } from '../../utils/notifications';

// Thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryApi.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar categorías');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (categoryData, { rejectWithValue, dispatch }) => {
    try {
      const response = await categoryApi.create(categoryData);
      showSuccess('Categoría creada exitosamente');
      // Recargar todas las categorías después de crear una nueva
      dispatch(fetchCategories());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear categoría';
      showError(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.loading = false;
        // No es necesario agregar manualmente, fetchCategories se encarga de recargar la lista
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
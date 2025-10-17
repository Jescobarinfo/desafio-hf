import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './slices/categorySlice';
import productReducer from './slices/productSlice';

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    products: productReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
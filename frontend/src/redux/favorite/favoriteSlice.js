// src/redux/favorite/favoriteSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favoriteItems: [],
  loading: false,
  error: null,
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const kostId = action.payload;
      if (!state.favoriteItems.includes(kostId)) {
        state.favoriteItems.push(kostId);
      }
    },
    removeFromFavorites: (state, action) => {
      const kostId = action.payload;
      state.favoriteItems = state.favoriteItems.filter((id) => id !== kostId);
    },
    clearFavorites: (state) => {
      state.favoriteItems = [];
    },
  },
});

export const { addToFavorites, removeFromFavorites, clearFavorites } =
  favoriteSlice.actions;

// Update selectors untuk mengakses state yang benar
export const selectFavoriteItems = (state) =>
  state?.favorite.favoriteItems || [];
export const selectIsFavorite = (state, kostId) =>
  state?.favorite.favoriteItems?.includes(kostId) || false;

export default favoriteSlice.reducer;

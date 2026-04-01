import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filters: {
    cuisine: "",
    area: "",
    date: "",
    guests: 2,
  },
  selectedRestaurant: null,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    },

    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },
  },
});

export const {
  setFilters,
  resetFilters,
  setSelectedRestaurant,
  clearSelectedRestaurant,
} = restaurantSlice.actions;

// Selectors
export const selectFilters = (state) => state.restaurant.filters;
export const selectSelectedRestaurant = (state) => state.restaurant.selectedRestaurant;

export default restaurantSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookingDetails: {
    restaurantId: null,
    restaurantName: "",
    date: "",
    time: "",
    guests: 2,
    specialRequests: "",
  },
};

const reservationSlice = createSlice({
  name: "reservation",
  initialState,
  reducers: {
    setBookingDetails: (state, action) => {
      state.bookingDetails = { ...state.bookingDetails, ...action.payload };
    },

    clearBookingDetails: (state) => {
      state.bookingDetails = initialState.bookingDetails;
    },
  },
});

export const {
  setBookingDetails,
  clearBookingDetails,
} = reservationSlice.actions;

// Selectors
export const selectBookingDetails = (state) => state.reservation.bookingDetails;

export default reservationSlice.reducer;
// src/store/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Product } from "../types";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as Product[] },
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload); // Immer makes this safe
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, clearCart } = cartSlice.actions; // actions made for us
export default cartSlice.reducer;

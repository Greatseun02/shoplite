import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Product } from "../types";
import { baseApi } from "../api/client";

type ProductsState = {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
};

// 1. The thunk: does the async work (the API call)
export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const { data } = await baseApi.get<Product[]>("/products");
  return data; // this becomes action.payload in "fulfilled"
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload; //mutating this would change the state of items.
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default productsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    cart: null,
  },
  reducers: {
    // action to set products
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    // ✅ action to set cart
    setCart: (state, action) => {
      state.cart = action.payload;
    },
  },
});

export const { setProducts, setCart } = productSlice.actions;
export default productSlice.reducer;

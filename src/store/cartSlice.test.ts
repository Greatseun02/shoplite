// src/store/cartSlice.test.ts
import { describe, it, expect } from "vitest";
import cartReducer, { addItem, clearCart } from "./cartSlice";
import type { Product } from "../types";

const backpack: Product = {
  id: 1,
  title: "Backpack",
  price: 109.95,
  description: "",
  category: "men's clothing",
  image: "",
};

function sumTwoNumbers(a: number, b: number): number {
  return a + b;
}

// function
describe("sumTwoNumbers", () => {
  it("should return the sum of two numbers", () => {
    expect(sumTwoNumbers(2, 3)).toBe(5);
  });
});

//slice / reducer test
describe("cartSlice", () => {
  it("adds an item to the cart", () => {
    const state = cartReducer({ items: [] }, addItem(backpack));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe("Backpack");
  });

  it("clears the cart", () => {
    const state = cartReducer({ items: [backpack, backpack] }, clearCart());
    expect(state.items).toHaveLength(0);
  });
});

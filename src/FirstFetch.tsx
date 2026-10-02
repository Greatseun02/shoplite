// src/components/FirstFetch.tsx
import { useEffect, useState } from "react";
import type { Product } from "./types";
import { getCategories, getProducts } from "./api/products";

export function FirstFetch() {
  const [products] = useState<Product[]>([]);

  const getData = async () => {
    // ❌ One after another: the second request waits for the first
    // const products = await getProducts();
    // const categories = await getCategories();

    // ✅ At the same time: both requests go out together
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    console.log(products);
    console.log(categories);
  };

  useEffect(() => {
    getData();
  }, []);

  return <p className="p-6">We have {products.length} products</p>;
}

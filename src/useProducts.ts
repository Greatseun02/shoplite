// src/hooks/useProducts.ts
import { useEffect, useState } from "react";
import { getProducts } from "./api/products";
import type { Product } from "./types";

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false; //ignore boolean representation, if i am true do not perform any operation after the promise is fulfilled. if false perform an operation.

    async function load() {
      try {
        const products = await getProducts();
        if (!ignore) setData(products);
      } catch (err) {
        if (!ignore) setError((err as Error).message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return { data, loading, error };
}

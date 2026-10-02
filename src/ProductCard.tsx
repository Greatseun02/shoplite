// src/components/ProductCard.tsx

import type { Product } from "./types";
import { useCreateProductMutation } from "./api/products";

export function ProductCard({ product }: { product: Product }) {
  const [addProduct] = useCreateProductMutation();

  return (
    <div style={{ width: "20%" }}>
      <img
        src={product.image}
        alt={product.title}
        style={{
          height: 200,
          width: 200,
        }}
      />
      <h3 className="mt-2 line-clamp-2 text-sm font-medium">{product.title}</h3>
      <p className="mt-auto font-bold">${product.price}</p>
      <button
        onClick={() => addProduct(product)} // dispatch({type: "cart/addItem", payload: product})
        className="mt-2 rounded bg-blue-600 px-3 py-1 text-white"
      >
        Add to cart
      </button>
    </div>
  );
}

// src/components/ProductGrid.tsx
import { useGetProductsQuery } from "./api/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  const {
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
    isError,
    data: items,
  } = useGetProductsQuery();

  if (isLoadingProducts) return <p>Loading....</p>;

  if (isFetchingProducts) return <p>Fetching...</p>;

  if (isError) return <p>Error</p>;

  return (
    <div
      className="flex gap-4 p-6"
      style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
    >
      {items?.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

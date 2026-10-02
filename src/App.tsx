import { ProductGrid } from "./ProductGrid";
import DisplayCart from "./DisplayCart";
import { useCreateProductMutation } from "./api/products";

export default function App() {
  const [addProduct] = useCreateProductMutation();

  return (
    <div>
      <button
        onClick={() =>
          addProduct({
            id: 100,
            category: "Shoe",
            description: "Shoes",
            price: 2000,
            image: "",
            title: "Shoesss",
          })
        }
      >
        Add Product
      </button>
      <ProductGrid />
      <DisplayCart />
    </div>
  );
}

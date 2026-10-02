import { useAppSelector } from "./store/store";

export default function DisplayCart() {
  const items = useAppSelector((state) => state.cart.items);
  return (
    <div style={{ padding: "100px 0" }}>
      <p>Cart</p>
      <div>
        {items.map((item) => (
          <div>
            <p>{item.title}</p>
            <p>{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

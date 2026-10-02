# Week 4 · Day 2: The Data Layer

**Date:** Wednesday, 30 Sep 2026
**Facilitator:** Goodnews

## Today's Plan

1. What is the Data Layer?
2. The Fetch API
3. Async/await
4. Loading & error states
5. Axios
6. Thunks with `createAsyncThunk`
7. RTK Query
8. Assignment

---

## 1. What is the Data Layer?

Yesterday we built the **Business Layer**: the store, slices and the rules for changing state. But our products were **hard-coded**. Real apps get their data from a **server**.

The **Data Layer** is the part of the app that talks to the server. It's the only part that knows **where** data comes from.

### Analogy: ordering from a supplier 📦

Your shop needs stock. You don't make it yourself. You **order it from a supplier**.

| Ordering stock                      | Talking to a server                                  |
| ----------------------------------- | ---------------------------------------------------- |
| Sending an order form               | Sending a**request**                                 |
| The supplier's address              | The**URL** (endpoint)                                |
| "Send me…" or "Here's a new order"  | The**method**: `GET` or `POST`                       |
| The delivery arriving               | The**response**                                      |
| A sealed box you have to open       | The response body, which you have to read as**JSON** |
| "Delivered ✅" or "Out of stock ❌" | The**status code**                                   |

### Key words

| Word            | Meaning                                                           |
| --------------- | ----------------------------------------------------------------- |
| **API**         | A server that gives you data when you send it requests            |
| **Endpoint**    | One URL on the API, e.g.`/products`                               |
| **GET**         | "Give me data"                                                    |
| **POST**        | "Here's some new data, save it"                                   |
| **JSON**        | The text format data travels in. It looks like JavaScript objects |
| **Status code** | A number saying how it went                                       |

**Status codes to know:**

| Code  | Meaning                         |
| ----- | ------------------------------- |
| `200` | OK                              |
| `201` | Created (after a POST)          |
| `404` | Not found (wrong URL)           |
| `500` | Server error (the server broke) |

### The API we'll use: Fake Store API

A free practice API with real-looking products: https://fakestoreapi.com

| Endpoint                             | Returns                                           |
| ------------------------------------ | ------------------------------------------------- |
| `GET /products`                      | All products                                      |
| `GET /products/1`                    | One product                                       |
| `GET /products/categories`           | All category names                                |
| `GET /products/category/electronics` | Products in one category                          |
| `POST /carts`                        | Pretends to save a cart (nothing is really saved) |

**Try it now:** open https://fakestoreapi.com/products in your browser. That's the raw JSON your app will receive.

A single product looks like this:

```json
{
  "id": 1,
  "title": "Fjallraven - Foldsack No. 1 Backpack",
  "price": 109.95,
  "description": "Your perfect pack for everyday use...",
  "category": "men's clothing",
  "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
}
```

This matches the `Product` type in `src/types.ts`. That's not an accident. The type describes the data the API sends.

### Setup

Use your **ShopLite** project. We'll add a new folder for the Data Layer:

```
src/
├── api/        ← NEW: the Data Layer (talks to the server)
├── hooks/      ← NEW: custom hooks
├── components/ ← Presentation layer
└── store/      ← Business layer
```

---

## 2. The Fetch API

`fetch` is **built into the browser**. You don't need to install anything.

### Your first fetch

```ts
fetch("https://fakestoreapi.com/products")
  .then((res) => res.json()) // open the box: read the JSON
  .then((data) => console.log(data));
```

Two steps, every time:

1. `fetch(url)` sends the request and gives you back the **response** (the sealed box).
2. `res.json()` **reads** the body and turns the JSON into JavaScript.

Both steps take time, so both give you a **Promise**. We'll explain Promises properly in Section 3. For now: `.then()` means "when it's ready, do this".

### 🧪 Practical: fetch products into a component

Create `src/components/FirstFetch.tsx`:

```tsx
// src/components/FirstFetch.tsx
import { useEffect, useState } from "react";
import type { Product } from "../types";

export function FirstFetch() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json()) // 1. open the box (read the JSON)
      .then((data) => {
        console.log(data); // 2. look at what came back
        setProducts(data); // 3. put it in state
      });
  }, []); // [] = run once, when the component first appears

  return <p className="p-6">We have {products.length} products</p>;
}
```

Show it in `App.tsx`:

```tsx
import { Header } from "./components/Header";
import { FirstFetch } from "./components/FirstFetch";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FirstFetch />
    </div>
  );
}
```

You should see **"We have 0 products"** for a moment, then **"We have 20 products"**.

**Why `useEffect`?** Fetching is a **side effect**: it reaches outside the component. We don't want to fetch on every render, only once when the component appears. That's what `useEffect(..., [])` does.

### 🔍 The Network tab

This is the most useful tool for the Data Layer. Press **F12** → **Network** → refresh the page. Click the `products` request and you'll see:

- **Headers:** the URL, method and **status code**
- **Response:** the raw JSON the server sent

> 💡 When data doesn't show up, check the **Network tab first**. Did the request happen? What was the status code? What came back?

You might see the request **twice**. In development, React's **StrictMode** runs effects twice to help catch bugs. It only happens in development, not when the app is live.

### ⚠️ The big fetch gotcha

**`fetch` does NOT treat 404 or 500 as an error.** It only fails if there's no network at all. As far as `fetch` is concerned, "the server replied with 404" is still a successful delivery.

That's why you always check **`res.ok`** (it's `true` for status 200–299):

```ts
const res = await fetch("https://fakestoreapi.com/products");
if (!res.ok) {
  throw new Error(`Failed to load products (status ${res.status})`);
}
const data = await res.json();
```

### Sending data with POST

```ts
const res = await fetch("https://fakestoreapi.com/carts", {
  method: "POST",
  headers: { "Content-Type": "application/json" }, // "I'm sending JSON"
  body: JSON.stringify({ userId: 1, products: [{ id: 1 }] }), // object → JSON text
});
const newCart = await res.json();
console.log(newCart); // the server sends it back with an id
```

With a POST you need to:

1. set `method: "POST"`
2. say you're sending JSON with the `Content-Type` header
3. turn your object into JSON text with `JSON.stringify`

---

## 3. Async/Await

### What is a Promise?

A **Promise** is like the **tracking number** you get when you order something. You don't have the parcel yet, but you've been promised it will either **arrive** or **fail**.

| Promise state | Parcel                          |
| ------------- | ------------------------------- |
| **Pending**   | On its way                      |
| **Fulfilled** | Delivered ✅ (you get the data) |
| **Rejected**  | Lost ❌ (you get an error)      |

`fetch` and `res.json()` both return Promises.

### `async` / `await`: a cleaner way to wait

`.then()` chains get messy. `async`/`await` lets you write the same thing like normal, top-to-bottom code:

```ts
// With .then()
function getProducts() {
  return fetch("https://fakestoreapi.com/products").then((res) => res.json());
}

// With async/await: same thing
async function getProducts() {
  const res = await fetch("https://fakestoreapi.com/products");
  const data = await res.json();
  return data;
}
```

| Keyword | Meaning                                                           |
| ------- | ----------------------------------------------------------------- |
| `async` | "This function does waiting inside." It always returns a Promise  |
| `await` | "Pause here until this Promise is ready, then give me the result" |

> `await` only works **inside** an `async` function.

### Handling errors with `try/catch`

```ts
async function loadProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Something went wrong:", err); // runs if anything above fails
  }
}
```

- **`try`**: "attempt this"
- **`catch`**: "if anything in `try` fails, run this instead of crashing"

### 🧪 Practical: move the fetching into the Data Layer

Components shouldn't know URLs. Let's put all the API calls in one file.

Create `src/api/products.ts`:

```ts
// src/api/products.ts
import type { Product } from "../types";

const BASE_URL = "https://fakestoreapi.com";

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) {
    throw new Error(`Failed to load products (status ${res.status})`);
  }
  return res.json();
}

export async function getCategories(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/products/categories`);
  if (!res.ok) {
    throw new Error(`Failed to load categories (status ${res.status})`);
  }
  return res.json();
}
```

Now if the API address changes, you change **one line**, not every component.

### One after another, or at the same time?

You need products **and** categories. Two ways to get them:

**Analogy:** you need rice and meat from two different sellers.

- **One after another:** buy the rice, walk back, then go and buy the meat. Slow.
- **At the same time (`Promise.all`):** you buy the rice while your friend buys the meat. You're done when **both** come back.

```ts
// ❌ One after another: the second request waits for the first
const products = await getProducts();
const categories = await getCategories();

// ✅ At the same time: both requests go out together
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
]);
```

| Use…              | When…                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| One after another | The second request**needs** something from the first (e.g. get the user, then get _that user's_ orders) |
| `Promise.all`     | The requests don't depend on each other                                                                 |

> ⚠️ If **any** request in `Promise.all` fails, the whole thing fails and jumps to `catch`.

### 🧪 Practical: shop stats with `Promise.all`

Create `src/components/ShopStats.tsx`:

```tsx
// src/components/ShopStats.tsx
import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../api/products";

export function ShopStats() {
  const [text, setText] = useState("Loading stats…");

  useEffect(() => {
    async function load() {
      try {
        const [products, categories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setText(
          `${products.length} products in ${categories.length} categories`,
        );
      } catch (err) {
        setText("Could not load stats");
        console.error(err);
      }
    }
    load();
  }, []);

  return <p className="px-6 pt-4 text-sm text-gray-600">{text}</p>;
}
```

Add `<ShopStats />` under `<Header />` in `App.tsx`. You should see **"20 products in 4 categories"**.

In the **Network tab**, notice that both requests start at the **same time**.

> 💡 Why is `load` a separate function inside `useEffect`? Because the function you pass to `useEffect` can't be `async` itself. So we write an `async` function inside it and call it.

#### ✏️ Your turn

1. Change `ShopStats` to fetch one after another (two `await`s). Compare the timing in the Network tab.
2. Break one URL in `products.ts` (e.g. `/categoriez`). What does `ShopStats` show now, and why?

---

## 4. Loading & Error States

### Analogy: a food delivery app 🛵

A good delivery app never leaves you staring at a blank screen. It says **"Preparing…"**, then **"Delivered ✅"**, or **"Sorry, the restaurant is closed ❌"**.

Every screen that loads data needs the same **three states**:

| State       | Meaning                   | Show the user           |
| ----------- | ------------------------- | ----------------------- |
| **loading** | The request is on its way | "Loading…" or a spinner |
| **error**   | Something went wrong      | An error message        |
| **data**    | It worked                 | The actual content      |

`FirstFetch` only handled the happy path. If the network is slow, the user sees "0 products". If the API is down, they see nothing useful.

### 🧪 Practical: a `useProducts` custom hook

We'll put the three states in a **custom hook** (Week 3), so any component can reuse them.

Create `src/hooks/useProducts.ts`:

```ts
// src/hooks/useProducts.ts
import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import type { Product } from "../types";

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false; // becomes true if the component goes away

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
      ignore = true; // cleanup: ignore any late answer
    };
  }, []);

  return { data, loading, error };
}
```

**What's new here?**

- **`finally`** runs after `try` **or** `catch`, whichever happened. It's the right place to say "loading is over".
- **`ignore`**: if the user leaves the page before the answer arrives, we shouldn't update a component that's gone. The cleanup function sets `ignore = true`, and the late answer is ignored.

Now a component to show products. First, a card for one product.

Create `src/components/ProductCard.tsx`:

```tsx
// src/components/ProductCard.tsx
import { useDispatch } from "react-redux";
import { addItem } from "../store/cartSlice";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col rounded border border-gray-200 bg-white p-3">
      <img
        src={product.image}
        alt={product.title}
        className="h-32 object-contain"
      />
      <h3 className="mt-2 line-clamp-2 text-sm font-medium">{product.title}</h3>
      <p className="mt-auto font-bold">${product.price}</p>
      <button
        onClick={() => dispatch(addItem(product))}
        className="mt-2 rounded bg-blue-600 px-3 py-1 text-white"
      >
        Add to cart
      </button>
    </div>
  );
}
```

Then the grid. Create `src/components/ProductGrid.tsx`:

```tsx
// src/components/ProductGrid.tsx
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  const { data, loading, error } = useProducts();

  if (loading) return <p className="p-6">Loading products…</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
      {data.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

Replace `<FirstFetch />` with `<ProductGrid />` in `App.tsx`.

**Notice how the layers connect:**

- `ProductGrid` (**Presentation**) doesn't know any URLs. It just uses the hook.
- `useProducts` calls `getProducts` (**Data**).
- **Add to cart** dispatches `addItem` into the Redux store (**Business**), and the 🛒 count in the Header goes up.

#### Test the other two states

1. **Loading:** Network tab → change **No throttling** to **Slow 4G** (or **3G**) → refresh. You'll see "Loading products…" for longer.
2. **Error:** in `products.ts`, change `/products` to `/productz` and save. You'll see the error message. **Change it back** afterwards.

---

## 5. Axios

**Axios** is a popular library for making requests. Many real projects use it instead of `fetch`.

```bash
npm install axios
```

### Analogy: raw ingredients vs a meal kit 🥘

`fetch` is buying **raw ingredients**. You check `res.ok`, call `.json()`, stringify the body, and set the headers yourself. **Axios is a meal kit**: the preparation is done, you just cook.

### Side by side

```ts
// ─── fetch ───
const res = await fetch("https://fakestoreapi.com/products");
if (!res.ok) throw new Error(`Status ${res.status}`);
const products = await res.json();

// ─── axios ───
const res = await axios.get("https://fakestoreapi.com/products");
const products = res.data; // already turned into JavaScript
```

```ts
// ─── fetch POST ───
await fetch("https://fakestoreapi.com/carts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(cart),
});

// ─── axios POST ───
await axios.post("https://fakestoreapi.com/carts", cart);
```

|                            | `fetch`            | `axios`                   |
| -------------------------- | ------------------ | ------------------------- |
| Built into the browser     | ✅                 | ❌ (install it)           |
| Reads the JSON for you     | ❌                 | ✅ (`res.data`)           |
| Treats 404 / 500 as errors | ❌ (check`res.ok`) | ✅ (throws automatically) |
| Sends JSON for you         | ❌                 | ✅                        |
| Set a base URL once        | ❌                 | ✅                        |

### A shared axios "client"

Instead of typing the full URL every time, create one axios **instance** with the base URL.

Create `src/api/client.ts`:

```ts
// src/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "https://fakestoreapi.com",
});
```

Now every request only needs the path:

```ts
const { data } = await api.get<Product[]>("/products");
```

> `const { data } = ...` is **destructuring**. It takes the `data` field out of the response in one line.

### Interceptors (just so you know)

Axios lets you run code on **every** request or response, like an **airport security checkpoint** every passenger goes through. Teams use this to attach a login token to every request, or to handle "session expired" errors in one place.

```ts
api.interceptors.request.use((config) => {
  console.log("Sending:", config.method, config.url);
  return config;
});
```

It works like **middleware** from yesterday, but for requests instead of Redux actions.

#### ✏️ Your turn

Rewrite `getProducts` and `getCategories` in `src/api/products.ts` to use the `api` client instead of `fetch`. Nothing else in the app should need to change. Why not?

---

## 6. Thunks with `createAsyncThunk`

### Where do API calls go in Redux?

Yesterday's rule: **reducers must be pure. No API calls.** So if we want our **products** in the Redux store, where does the fetching happen?

The answer is a **thunk**.

### What's a thunk?

Normally you dispatch a **plain object**: `dispatch({ type: "cart/addItem", ... })`.

A **thunk** lets you dispatch a **function** instead. That function can do async work (like an API call), then dispatch normal actions with the result.

Remember yesterday's **middleware**, the security desk that every action passes? `configureStore` includes a **thunk middleware** by default. When it sees a function instead of an object, it **runs the function** instead of passing it to the reducer.

```
dispatch(function) ──► thunk middleware ──► runs the function ──► API call
                                                     │
                                                     ▼
                                       dispatch({ type, payload }) ──► reducer
```

### Analogy: the errand runner 🏃

The teller (reducer) can't leave the counter to fetch anything. So the bank has an **errand runner** (the thunk). You give the runner a job: "go to the other branch and get the file". The runner goes, comes back, and hands the result to the teller as a normal slip.

### `createAsyncThunk`

Redux Toolkit's `createAsyncThunk` builds the thunk for you, and it **automatically dispatches three actions**, the same three states from Section 4:

| Action                     | When               | Like the delivery app saying… |
| -------------------------- | ------------------ | ----------------------------- |
| `products/fetch/pending`   | The request starts | "Preparing…"                  |
| `products/fetch/fulfilled` | It worked          | "Delivered ✅"                |
| `products/fetch/rejected`  | It failed          | "Sorry ❌"                    |

### 🧪 Practical: products in the Redux store

Create `src/store/productsSlice.ts`:

```ts
// src/store/productsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/client";
import type { Product } from "../types";

// 1. The thunk: does the async work (the API call)
export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const { data } = await api.get<Product[]>("/products");
  return data; // this becomes action.payload in "fulfilled"
});

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

// 2. The slice: updates state for each stage of the request
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
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default productsSlice.reducer;
```

**What's `extraReducers`?** `reducers` is for actions **this slice creates** (like `addItem`). `extraReducers` is for actions created **somewhere else**. Here, the three actions come from `fetchProducts`.

Add it to the store, and export an `AppDispatch` type (needed to dispatch thunks with TypeScript):

```ts
// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import themeReducer from "./themeSlice";
import productsReducer from "./productsSlice";
import { logger, saveCart } from "./middleware";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    theme: themeReducer,
    products: productsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger, saveCart),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

> Keep any other slices you already have (like `user`) in the `reducer` object too.

Now a grid that reads products from the **store**. Create `src/components/ThunkProductGrid.tsx`:

```tsx
// src/components/ThunkProductGrid.tsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchProducts } from "../store/productsSlice";
import { ProductCard } from "./ProductCard";

export function ThunkProductGrid() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, error } = useSelector(
    (state: RootState) => state.products,
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts()); // send the errand runner
    }
  }, [status, dispatch]);

  if (status === "loading" || status === "idle")
    return <p className="p-6">Loading products…</p>;
  if (status === "failed")
    return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

Swap `<ProductGrid />` for `<ThunkProductGrid />` in `App.tsx`.

Open the **Console**. Yesterday's **logger middleware** shows the three actions happening:

```
➡️ Action: { type: "products/fetch/pending", ... }
➡️ Action: { type: "products/fetch/fulfilled", payload: [ ...20 products ] }
```

**Why bother, if `useProducts` already worked?** Because now the products live in the **store**. Any component can read them with `useSelector`, with no refetching and no prop drilling.

---

## 7. RTK Query

### The problem

Look at how much code we wrote for **one** endpoint: a slice, three `addCase`s, a status field, an effect to trigger it. Now imagine an app with **30 endpoints**. And we still haven't handled caching (not refetching data we already have).

**RTK Query** is part of Redux Toolkit, and it writes all of that for you.

### Analogy: an assistant with a notebook 📒

You ask your assistant, "What are our product categories?" They call the supplier, **write the answer in a notebook** (the **cache**), and tell you.

Five minutes later a colleague asks the same question. The assistant **reads it from the notebook**, with no phone call needed.

### 🧪 Practical: categories with RTK Query

#### Step 1: describe the API

Create `src/api/shopApi.ts`:

```ts
// src/api/shopApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const shopApi = createApi({
  reducerPath: "shopApi", // where the cache lives in the store
  baseQuery: fetchBaseQuery({ baseUrl: "https://fakestoreapi.com" }), // fetch with a base URL
  endpoints: (builder) => ({
    getCategories: builder.query<string[], void>({
      query: () => "/products/categories",
    }),
  }),
});

// RTK Query writes this hook for you: getCategories → useGetCategoriesQuery
export const { useGetCategoriesQuery } = shopApi;
```

`builder.query<string[], void>` means:

- `string[]`: what the endpoint **returns** (a list of category names)
- `void`: what you **pass in** (nothing)

The hook name is built from the endpoint name: `getCategories` → `use` + `GetCategories` + `Query`.

#### Step 2: add it to the store

RTK Query needs **two things** in the store: its **reducer** (the notebook) and its **middleware** (the assistant who makes the calls).

```ts
// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import themeReducer from "./themeSlice";
import productsReducer from "./productsSlice";
import { shopApi } from "../api/shopApi";
import { logger, saveCart } from "./middleware";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    theme: themeReducer,
    products: productsReducer,
    [shopApi.reducerPath]: shopApi.reducer, // 1. the cache
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger, saveCart, shopApi.middleware), // 2. the middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

> ⚠️ Forget either of these and RTK Query won't work. It's the most common RTK Query mistake.

`[shopApi.reducerPath]` just means "use the value of `reducerPath` as the key", so it's the same as writing `shopApi: shopApi.reducer`.

#### Step 3: use the hook

Create `src/components/CategoryList.tsx`:

```tsx
// src/components/CategoryList.tsx
import { useGetCategoriesQuery } from "../api/shopApi";

export function CategoryList() {
  const { data, isLoading, isError } = useGetCategoriesQuery();

  if (isLoading) return <p className="px-6">Loading categories…</p>;
  if (isError)
    return <p className="px-6 text-red-600">Could not load categories</p>;

  return (
    <div className="flex flex-wrap gap-2 px-6 pt-6">
      {data?.map((category) => (
        <span
          key={category}
          className="rounded-full bg-gray-200 px-3 py-1 text-sm capitalize"
        >
          {category}
        </span>
      ))}
    </div>
  );
}
```

Add `<CategoryList />` under `<Header />` in `App.tsx`.

**That's it.** No `useState`, no `useEffect`, no slice, no `addCase`. The hook gives you `data`, `isLoading` and `isError` for free.

> `data?.map` uses **optional chaining**: `?.` means "only call `.map` if `data` exists". Before the answer arrives, `data` is `undefined`.

#### Step 4: see the cache work

Put `<CategoryList />` in `App.tsx` **twice**. Refresh and open the **Network tab**.

**Only one** `categories` request is sent, even though two components asked for it (and even with StrictMode). The second component read it from the notebook.

Compare that with `useProducts`: each component that uses it sends its **own** request.

### What the hook gives you

| Field        | Meaning                                                              |
| ------------ | -------------------------------------------------------------------- |
| `data`       | The result (`undefined` until it arrives)                            |
| `isLoading`  | `true` during the **first** load                                     |
| `isFetching` | `true` during **any** request, including a refresh in the background |
| `isError`    | `true` if the request failed                                         |
| `error`      | Details of what went wrong                                           |
| `refetch`    | A function to ask again                                              |

### Comparing the three ways

|                           | Custom hook (`useProducts`)  | `createAsyncThunk`            | RTK Query           |
| ------------------------- | ---------------------------- | ----------------------------- | ------------------- |
| Where the data lives      | Inside the component         | Redux store                   | Redux store (cache) |
| Loading/error code        | You write it                 | You write it (in the slice)   | ✅ Done for you     |
| Shared between components | ❌ Each one fetches          | ✅                            | ✅                  |
| Caching                   | ❌                           | ❌                            | ✅                  |
| Best for                  | Small apps, one-off requests | Custom logic, multi-step work | Most server data    |

### Common mistakes

| Mistake                                                          | What happens / the fix                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Forgetting`shopApi.reducer` or `shopApi.middleware` in the store | Errors in the console, or the request never happens                 |
| Importing from`"@reduxjs/toolkit/query"`                         | Use`"@reduxjs/toolkit/query/react"` to get the auto-generated hooks |
| `data.map(...)` without `?.`                                     | Crashes before the data arrives, because`data` is `undefined`       |
| Calling the hook inside an`if` or a loop                         | Hooks must always run at the top of the component                   |

---

## ✅ Check Your Understanding

1. What's the difference between a `GET` and a `POST` request?
2. `fetch` gets a 404 back. Does it throw an error? What should you check?
3. What does `await` do, and where can you use it?
4. When should you use `Promise.all`, and when must requests go one after another?
5. What are the three states every data-loading screen should handle?
6. Name two things axios does for you that `fetch` doesn't.
7. Why can't a reducer make the API call? Where does it go instead?
8. What three actions does `createAsyncThunk` dispatch?
9. What two things must you add to the store for RTK Query to work?
10. Two components use `useGetCategoriesQuery()`. How many requests are sent, and why?

---

## 📝 Assignment: Data Layer

**Task:** Convert the product grid from the `useProducts` custom hook to RTK Query's auto-generated `useGetProductsQuery` hook, and compare the amount of code needed.

You'll be given a starter project. Read its README before you begin.

---

### 📚 Read more

- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- Axios: https://axios-http.com/docs/intro
- `createAsyncThunk`: https://redux-toolkit.js.org/api/createAsyncThunk
- RTK Query overview: https://redux-toolkit.js.org/rtk-query/overview

**Next class:** Integration: connecting the UI, the business logic and the API end-to-end.

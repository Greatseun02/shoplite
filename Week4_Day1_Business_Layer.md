# Week 4 · Day 1: The Business Layer

**Date:** Tuesday, 29 Sep 2026
**Facilitator:** Goodnews

## Today's Plan

1. The big picture: the 3 layers of a React app
2. Context API as business-layer state
3. Redux basics
4. Redux Toolkit
5. Combining reducers
6. Middleware
7. Assignment

---

## 1. The Big Picture: A React App Is a Restaurant 🍽️

A well-built React app is split into **three layers**. Think of a restaurant:

| Layer                | Restaurant                                       | In our React app           | Tools                   |
| -------------------- | ------------------------------------------------ | -------------------------- | ----------------------- |
| **Presentation**     | The dining room: tables, menus, waiters          | Components, JSX, Tailwind  | React components        |
| **Business** (today) | The kitchen: recipes, rules, what's been ordered | App state and logic        | Context, Redux Toolkit  |
| **Data** (tomorrow)  | The market and suppliers                         | Talking to the backend API | fetch, axios, RTK Query |

- The **waiter** (a component) doesn't cook. They take the order and pass it to the kitchen.
- The **kitchen** (business layer) holds the rules: prices, discounts, what's in the cart.
- The **market** (data layer) is where ingredients (data) come from.

### Our project this week: ShopLite 🛒

We'll build one small shop app all week. Set it up now:

```bash
npm create vite@latest shoplite -- --template react-ts
cd shoplite
npm install
npm install @reduxjs/toolkit react-redux
npm run dev
```

Create `src/types.ts`:

```ts
export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

export type User = {
  name: string;
  email: string;
  isLoggedIn: boolean;
};
```

Folder structure we're aiming for:

```
src/
├── components/      ← Presentation layer
├── store/           ← Business layer (today!)
│   ├── index.ts
│   ├── cartSlice.ts
│   └── userSlice.ts
├── api/             ← Data layer (tomorrow)
└── types.ts
```

> 💡 When you're unsure where some code should go, ask yourself **"which layer is this?"**

---

## 2. Context API as Business-Layer State

### Analogy: the office notice board 📌

Instead of passing a memo from person to person down the hallway (**prop drilling**), you pin it on a **notice board** that everyone can see.

| Context API     | Notice board              |
| --------------- | ------------------------- |
| `createContext` | Putting up the board      |
| `Provider`      | Pinning information to it |
| `useContext`    | Walking over to read it   |

### Code: a CartContext

```tsx
// src/context/CartContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../types";

type CartContextType = {
  items: Product[];
  addItem: (p: Product) => void;
  removeItem: (id: number) => void;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  // The business logic lives HERE, not in the components
  const addItem = (p: Product) => setItems((prev) => [...prev, p]);
  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((item) => item.id !== id));
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, total }}>
      {children}
    </CartContext.Provider>
  );
}

// A custom hook so components never touch the context directly
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
```

```tsx
// Using it: this component has no idea HOW the cart works
function CartSummary() {
  const { items, total } = useCart();
  return (
    <p>
      {items.length} items · ₦{total.toLocaleString()}
    </p>
  );
}
```

**Key ideas**

- The `useCart` hook with the error check gives you a **clear error message** if you forget the Provider.
- `total` is **derived state**: it's calculated from `items`, not stored separately.

🤔 **Think about it:** why not store `total` in its own `useState`?

### When Context starts to hurt

1. **Every component using the context re-renders** when any value in it changes.
2. **Too many providers** ("Provider hell"):
   ```tsx
   <UserProvider><CartProvider><ThemeProvider><NotifProvider>...
   ```
3. **Complex updates** make the provider file messy.
4. **Hard to debug.** There's no history of what changed and why.

> ✅ **Rule of thumb:** use Context for a few simple global values that don't change often. Use **Redux Toolkit** when global state is large, changes often, or a whole team works on it.

---

## 3. Redux Basics

### The problem Redux solves

As ShopLite grows, the same data is needed in many places. For example, the **cart**:

- the **Header** shows how many items are in the cart
- every **Product card** adds items
- the **Cart page** removes items

Passing this through props is messy, and if every component can change it however it likes, bugs are hard to find. Redux's idea is simple:

> **Keep the shared state in ONE place (the store), and change it in ONE way (by dispatching actions).**

### Analogy: the bank 🏦

- The **store** is the bank's **ledger**. It holds the balance.
- You **cannot** walk into the vault and change the number yourself.
- You fill a **deposit slip** (an **action**) that says what you want to happen.
- The **teller** (the **reducer**) reads the slip, follows the bank's rules, and writes the **new** balance.
- Your balance on the app (the **UI**) updates.

| Bank                           | Redux           |
| ------------------------------ | --------------- |
| The ledger                     | **Store**       |
| A deposit slip                 | **Action**      |
| Handing the slip to the teller | **Dispatch**    |
| The teller                     | **Reducer**     |
| Checking your balance          | **useSelector** |

### The Redux cycle

```
  UI ──dispatch(action)──► Reducer ──new state──► Store ──► UI re-renders
```

---

### 3.1 Action: "what happened"

An action is just a **plain object** with a `type`. Any extra data goes in `payload`.

```ts
{ type: "counter/increment" }
{ type: "counter/add", payload: 5 }
{ type: "cart/addItem", payload: { id: 1, title: "Backpack", price: 15000 } }
```

### 3.2 Reducer: "how the state changes"

A reducer is a function: it takes the **current state** and an **action**, and returns the **new state**.

```ts
function counterReducer(state = 0, action) {
  switch (action.type) {
    case "counter/increment":
      return state + 1;
    case "counter/decrement":
      return state - 1;
    default:
      return state; // an action we don't know → no change
  }
}
```

### 3.3 Store: "where the state lives"

The store holds the state for the **whole app**. You change it only by **dispatching** actions:

```ts
dispatch({ type: "counter/increment" }); // 0 → 1
dispatch({ type: "counter/increment" }); // 1 → 2
dispatch({ type: "counter/decrement" }); // 2 → 1
```

### 📏 The 3 reducer rules

1. **Same input → same output.** No random values, no API calls.
2. **Never change (mutate) the old state.** Return a **new** one.
3. **Always return state** in the `default` case.

#### Why "never mutate"?

React only re-renders when it sees a **new** object. If you change the old one, React thinks nothing happened.

```ts
// ❌ Changes the old array. React doesn't notice.
state.push(newItem);
return state;

// ✅ Makes a new array. React notices and re-renders.
return [...state, newItem];
```

---

### Why we practise twice: `useReducer` first, then Redux

We'll write the **same counter reducer** in two ways:

1. **Practical A: `useReducer`**, a hook **built into React**. It uses the exact same reducer, action and dispatch idea as Redux, but the state lives **inside one component**. It needs no installs, so it's the easiest place to practise writing reducers and see the pattern clearly.
2. **Practical B: plain Redux.** We take the **same reducer** and move it into a Redux **store**, so the state is **shared by the whole app**.

**Why both?** They show that Redux is **not** a new way of thinking. It's the reducer pattern you already know from `useReducer`, moved to a place every component can reach. You'll also meet `useReducer` in real codebases, for components with complicated local state such as a multi-step form.

|                                       | `useReducer`                        | Redux                               |
| ------------------------------------- | ----------------------------------- | ----------------------------------- |
| Comes with                            | React (built in)                    | The`redux` + `react-redux` packages |
| Uses a reducer, actions and`dispatch` | ✅                                  | ✅                                  |
| Where the state lives                 | Inside**one** component             | In a**store** for the whole app     |
| Other components can read it          | ❌ Only by passing props            | ✅ With`useSelector`                |
| Use it for                            | Complex state in a single component | State shared across many components |

---

### 🧪 Practical A: a counter with `useReducer`

Create `src/components/LocalCounter.tsx`:

```tsx
import { useReducer } from "react";

// The reducer: all the rules in ONE place
function counterReducer(state: number, action: { type: string }) {
  switch (action.type) {
    case "counter/increment":
      return state + 1;
    case "counter/decrement":
      return state - 1;
    case "counter/reset":
      return 0;
    default:
      return state;
  }
}

export function LocalCounter() {
  //      current state ↓   ↓ the function that sends actions
  const [count, dispatch] = useReducer(counterReducer, 0);
  //                          reducer to use ↑        ↑ starting value

  return (
    <div className="space-x-2 p-6">
      <p className="text-2xl font-bold">{count}</p>
      <button onClick={() => dispatch({ type: "counter/decrement" })}>
        ➖
      </button>
      <button onClick={() => dispatch({ type: "counter/increment" })}>
        ➕
      </button>
      <button onClick={() => dispatch({ type: "counter/reset" })}>Reset</button>
    </div>
  );
}
```

Show it in `App.tsx`:

```tsx
import { LocalCounter } from "./components/LocalCounter";

export default function App() {
  return <LocalCounter />;
}
```

**Notice:** the buttons don't change `count` themselves. They send an **action**, and the **reducer decides** the new value. That's exactly how Redux works.

#### ❗ The limitation

Put **two** counters on the page:

```tsx
export default function App() {
  return (
    <>
      <LocalCounter />
      <LocalCounter />
    </>
  );
}
```

Click ➕ on the first one. **The second one doesn't change.** Each component has its **own private** state. You can't show this count in the Header either, unless you pass props all the way down.

That's the problem the Redux **store** solves. Let's move the same reducer into one. 👇

---

### 🧪 Practical B: a shared counter with plain Redux

Now we take the **same reducer** and put it in a Redux store. We'll build a counter where the **number** and the **buttons** are in **two different components**. They share the number through the Redux store, with no props at all.

#### Step 1: install Redux

```bash
npm install redux
```

(`react-redux`, which connects Redux to React, was already installed during setup.)

#### Step 2: create the store

```ts
// src/store/index.ts
import { createStore } from "redux";

// The reducer (the teller)
function counterReducer(state = 0, action: { type: string; payload?: number }) {
  switch (action.type) {
    case "counter/increment":
      return state + 1;
    case "counter/decrement":
      return state - 1;
    case "counter/add":
      return state + (action.payload ?? 0);
    case "counter/reset":
      return 0;
    default:
      return state;
  }
}

// The store (the ledger)
export const store = createStore(counterReducer);

export type RootState = ReturnType<typeof store.getState>;
```

> 💡 In VS Code, `createStore` will have a **line through it**. That's Redux saying _"there's a newer way now"_ (Redux Toolkit, Section 4). It still works fine, and it's the best way to see how Redux works.

#### Step 3: give the store to the app

Wrap `<App />` with `<Provider>` so every component can reach the store.

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
```

#### Step 4: read the state with `useSelector`

```tsx
// src/components/CounterDisplay.tsx
import { useSelector } from "react-redux";
import { RootState } from "../store";

export function CounterDisplay() {
  const count = useSelector((state: RootState) => state);
  return <p className="text-3xl font-bold">Count: {count}</p>;
}
```

#### Step 5: change the state with `useDispatch`

```tsx
// src/components/CounterButtons.tsx
import { useDispatch } from "react-redux";

export function CounterButtons() {
  const dispatch = useDispatch();

  return (
    <div className="space-x-2">
      <button onClick={() => dispatch({ type: "counter/decrement" })}>
        ➖
      </button>
      <button onClick={() => dispatch({ type: "counter/increment" })}>
        ➕
      </button>
      <button onClick={() => dispatch({ type: "counter/add", payload: 5 })}>
        +5
      </button>
      <button onClick={() => dispatch({ type: "counter/reset" })}>Reset</button>
    </div>
  );
}
```

#### Step 6: put them on the page

```tsx
// src/App.tsx
import { CounterDisplay } from "./components/CounterDisplay";
import { CounterButtons } from "./components/CounterButtons";

export default function App() {
  return (
    <div className="space-y-4 p-6">
      <CounterDisplay />
      <CounterButtons />
    </div>
  );
}
```

Click the buttons and watch the number change.

**What just happened?**

- `CounterDisplay` and `CounterButtons` are **separate components**. We passed **no props** between them.
- The buttons **don't change the number themselves**. They dispatch an action, and the **reducer decides** the new number.
- Every component that uses `useSelector` gets the new value automatically. That's the store being **shared across the whole app**.

#### ✏️ Your turn

1. Add a **"Double"** button with a `"counter/double"` action.
2. Add a rule in the reducer: **the count can't go below 0**.
3. Put a second `<CounterDisplay />` somewhere else on the page. Does it stay in sync?

### 🐞 Spot the bug

```ts
case "cart/addItem":
  state.push(action.payload);
  return state;
```

Which rule does this break, and what will the user see?

### Writing Redux by hand gets tiring…

Look at what we had to type:

- action type strings like `"counter/increment"`, which are easy to misspell
- a big `switch` statement
- copying state by hand to avoid mutation (painful when the state is an object or array)

It works, and now you **understand** how Redux works. But real apps have many more actions, so there's a lot of repeated code. **Redux Toolkit** fixes this.

---

## 4. Redux Toolkit (RTK)

### Analogy: the bank's mobile app 📱

Plain Redux is filling paper slips by hand. **Redux Toolkit is the bank's mobile app**: same bank, same rules, much less work. It's the **official, recommended** way to write Redux today.

Here's our counter, before and after:

```ts
// ─── Plain Redux (what you just wrote) ───
function counterReducer(state = 0, action) {
  switch (action.type) {
    case "counter/increment":
      return state + 1;
    case "counter/decrement":
      return state - 1;
    default:
      return state;
  }
}
dispatch({ type: "counter/increment" });
```

```ts
// ─── Redux Toolkit ───
const counterSlice = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
  },
});
dispatch(counterSlice.actions.increment()); // action made for you
```

Same store, same actions, same reducer idea, with no `switch` and no typed-out strings.

RTK gives us:

- **`createSlice`**: write the state and its reducers together, and it creates the actions for you
- **`configureStore`**: replaces `createStore` and sets up DevTools for you
- **Immer**: built in, so updating objects and arrays is much easier (see below)

---

### 4.1 What is Immer? 🪄

Remember rule 2: **never mutate state, always return a new copy.** For small state that's fine. But for **nested** state, making copies gets painful.

Say we want to change a user's city:

```ts
const state = {
  user: {
    name: "Ada",
    address: { city: "Lagos" },
  },
};
```

**Without Immer**, you have to copy every level by hand:

```ts
return {
  ...state,
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      city: "Abuja",
    },
  },
};
```

**With Immer**, you just write the change you want:

```ts
state.user.address.city = "Abuja";
```

Same result, much easier to read.

#### How does that work if we're not allowed to mutate?

**Immer** is a small library that **comes built into Redux Toolkit**, so there's nothing extra to install. It works like this:

#### Analogy: the photocopy 📄

1. You want to change an important document.
2. The clerk gives you a **photocopy** (Immer calls it a **draft**).
3. You write on the photocopy however you like.
4. The clerk looks at what you changed and makes a **brand-new official document**.
5. The **original is never touched**.

```
 original state ──► draft (photocopy) ──► you "change" it ──► Immer makes a NEW state
   (untouched)                                                   (React re-renders ✅)
```

So inside a Redux Toolkit reducer, the `state` you get is the **photocopy**. You can "change" it directly, and Immer turns your changes into a new, safe state for you.

| Without Immer (plain Redux)               | With Immer (Redux Toolkit)                             |
| ----------------------------------------- | ------------------------------------------------------ |
| `return [...state.items, item]`           | `state.items.push(item)`                               |
| `return { ...state, name: "Ada" }`        | `state.name = "Ada"`                                   |
| `return state.filter((p) => p.id !== id)` | `state.items = state.items.filter((p) => p.id !== id)` |

#### ⚠️ Immer rules

1. **Only inside `createSlice` reducers.** In components, you still never mutate state.
2. **Either change the draft OR return a new value. Not both.**

```ts
// ✅ change the draft
addItem: (state, action) => {
  state.items.push(action.payload);
},

// ✅ or return a new value
clearCart: () => {
  return { items: [] };
},
```

3. **Don't write `state = something`.** It only changes your local variable and does nothing. Use `return something` instead.

---

### 4.2 Build the cart with RTK

#### Step 1: create the cart slice

A **slice** is one piece of your app's state, plus the reducers that change it.

```ts
// src/store/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../types";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as Product[] },
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload); // Immer makes this safe
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, clearCart } = cartSlice.actions; // actions made for us
export default cartSlice.reducer;
```

`addItem(product)` creates the action `{ type: "cart/addItem", payload: product }` for you, so you never type it by hand.

#### Step 2: create the store

**Replace** everything in `src/store/index.ts` (our plain Redux store) with:

```ts
// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
```

#### Step 3: the Provider

Nothing to change! `src/main.tsx` already wraps the app in `<Provider store={store}>` from Section 3.

#### Step 4: use it in a component

The same two hooks you used with plain Redux:

| Hook          | Bank analogy                 | Job                     |
| ------------- | ---------------------------- | ----------------------- |
| `useSelector` | Checking your balance        | **Read** from the store |
| `useDispatch` | Handing a slip to the teller | **Send** an action      |

```tsx
// src/components/CartButton.tsx
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { addItem } from "../store/cartSlice";

const backpack = {
  id: 1,
  title: "Backpack",
  price: 15000,
  description: "",
  category: "bags",
  image: "",
};

export function CartButton() {
  const count = useSelector((state: RootState) => state.cart.items.length);
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(addItem(backpack))}
      className="rounded bg-blue-600 px-4 py-2 text-white"
    >
      Add backpack ({count})
    </button>
  );
}
```

```tsx
// src/App.tsx
import { CartButton } from "./components/CartButton";

export default function App() {
  return (
    <div className="space-x-2 p-6">
      <CartButton />
      <CartButton />
    </div>
  );
}
```

Click either button. **Both show the same count**, because the cart now lives in the global store instead of inside one component.

### 🔍 Redux DevTools

Install the **Redux DevTools** browser extension. Click the button a few times and you'll see every `cart/addItem` action and how the state changed after each one.

### Common mistakes

| Mistake                              | Fix                                                |
| ------------------------------------ | -------------------------------------------------- |
| Forgetting`<Provider store={store}>` | Error:_"could not find react-redux context value"_ |
| `dispatch(addItem)`                  | Call it:`dispatch(addItem(product))`               |
| `state = []` in a reducer            | Use`state.items = []` or `return { items: [] }`    |

---

## 5. Combining Reducers

### Analogy: departments in a company 🏢

One company (the **store**), many departments (the **slices**): Accounts, HR, Sales. Each department manages **only its own files**, but they all belong to one company.

In ShopLite, the cart is one department. Let's add a second one: a **light/dark theme**.

### 🧪 Practical: add a theme slice

#### Step 1: create the slice

```ts
// src/store/themeSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: "light" },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
```

#### Step 2: combine it in the store

Just add it to the `reducer` object. `configureStore` combines them for you.

```ts
// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer, // → state.cart
    theme: themeReducer, // → state.theme
  },
});

export type RootState = ReturnType<typeof store.getState>;
```

Your whole app state now looks like this:

```ts
{
  cart:  { items: [] },
  theme: { mode: "light" }
}
```

#### Step 3: read from BOTH slices in one component

```tsx
// src/components/Header.tsx
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { toggleTheme } from "../store/themeSlice";

export function Header() {
  const count = useSelector((state: RootState) => state.cart.items.length);
  const mode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch();

  return (
    <header
      className={`flex justify-between p-4 ${
        mode === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <h1 className="font-bold">ShopLite</h1>
      <div className="space-x-4">
        <span>🛒 {count}</span>
        <button onClick={() => dispatch(toggleTheme())}>
          {mode === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </header>
  );
}
```

```tsx
// src/App.tsx
import { Header } from "./components/Header";
import { CartButton } from "./components/CartButton";

export default function App() {
  return (
    <div>
      <Header />
      <main className="p-6">
        <CartButton />
      </main>
    </div>
  );
}
```

Click **Add backpack** and the 🛒 count goes up. Click **🌙 Dark** and the header changes colour. **Two separate slices, one store, one component reading both.** Open Redux DevTools and look at the State tab to see `cart` and `theme` side by side.

---

## 6. Middleware

### What is middleware?

When you dispatch an action, it normally goes **straight to the reducer**. **Middleware** is code that sits **in between**. Every action passes through it **before** it reaches the reducer.

```
  Without middleware:   dispatch(action) ─────────────────────────► Reducer ──► Store

  With middleware:      dispatch(action) ──► Middleware ──► next() ──► Reducer ──► Store
                                             (look, log,
                                              save, block…)
```

Reducers must stay **pure**: no logging, no saving, no API calls. But real apps **need** those things. Middleware is where they go.

### Analogy: the bank's security desk 🛂

Before your deposit slip reaches the teller, it passes the **security desk**. The officer can:

- **write it in the visitors' log** (logging)
- **let it through** to the teller (`next(action)`)
- **stop it**, for example a suspicious slip that never reaches the teller
- **do something after** the teller is done, such as sending you an SMS with your new balance

The teller (reducer) keeps doing one job, following the rules. Everything else happens at the desk.

### What middleware is used for

| Use        | Example                                                       |
| ---------- | ------------------------------------------------------------- |
| Logging    | Print every action and the new state while developing         |
| Saving     | Save the cart to`localStorage` after it changes               |
| Analytics  | Tell a tracking tool "user added an item to the cart"         |
| Async work | Call an API, then dispatch the result (**thunk**, next class) |

> 💡 You've **already been using middleware** without knowing it. `configureStore` adds some by default, including **thunk** (for API calls) and a **checker** that warns you if you accidentally mutate state.

---

### 6.1 The shape of a middleware

A middleware looks strange the first time. It's **three functions inside each other**:

```ts
const myMiddleware = (store) => (next) => (action) => {
  // 1. BEFORE: the action has NOT reached the reducer yet

  const result = next(action); // 2. pass it on to the reducer
  // 3. AFTER: the reducer has run, and the state is updated

  return result;
};
```

| Part     | What it gives you                         | Bank analogy                           |
| -------- | ----------------------------------------- | -------------------------------------- |
| `store`  | `store.getState()` and `store.dispatch()` | The officer can check the ledger       |
| `next`   | Passes the action along the line          | Letting the slip through to the teller |
| `action` | The action that was just dispatched       | The slip in the officer's hand         |

**The one rule to remember:** you must call `next(action)`. If you forget, the action **never reaches the reducer** and nothing in your app changes.

> Why three arrows? Redux sets your middleware up **once** (giving it `store` and `next`), then calls the last function for **every action**. You don't need to understand this deeply yet. Just copy the shape.

---

### 🧪 Practical: a logger middleware

Let's build a middleware that prints every action and the state after it.

#### Step 1: write the middleware

```ts
// src/store/middleware.ts
import { Middleware } from "@reduxjs/toolkit";

export const logger: Middleware = (store) => (next) => (action) => {
  console.log("➡️ Action:", action);
  console.log("   State before:", store.getState());

  const result = next(action); // let the action reach the reducer

  console.log("   State after:", store.getState());
  return result;
};
```

#### Step 2: add it to the store

```ts
// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import themeReducer from "./themeSlice";
import { logger } from "./middleware";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
```

What does that `middleware:` line mean?

- `getDefaultMiddleware()` gives you the middleware RTK already adds (thunk and the mutation checker).
- `.concat(logger)` **adds ours to the end** of that list.

> ⚠️ Always use `getDefaultMiddleware().concat(...)`. If you write `middleware: () => [logger]`, you **replace** the defaults and lose thunk, which we need next class.

#### Step 3: try it

Open the browser **Console** (F12 → Console) and click **Add backpack** or **🌙 Dark**. You'll see:

```
➡️ Action: { type: "cart/addItem", payload: { id: 1, title: "Backpack", ... } }
   State before: { cart: { items: [] }, theme: { mode: "light" } }
   State after:  { cart: { items: [ {...} ] }, theme: { mode: "light" } }
```

**Every** action passes through the logger, from any slice. We didn't change a single component or reducer.

---

### 🧪 Practical: keep the cart after a page refresh

Right now, if you refresh the page, the cart is **emptied**. Let's fix that with a middleware that **saves the cart to `localStorage`** after every cart action.

#### Step 1: write the middleware

Add this to `src/store/middleware.ts`:

```ts
export const saveCart: Middleware = (store) => (next) => (action) => {
  const result = next(action); // let the reducer update the cart FIRST

  // AFTER: the state now has the updated cart, so save it
  const items = store.getState().cart.items;
  localStorage.setItem("cart", JSON.stringify(items));

  return result;
};
```

Why do we call `next(action)` **first**? Because we want to save the cart **after** the reducer has added the item. If we saved before, we'd always be one item behind.

#### Step 2: load the saved cart when the app starts

In `src/store/cartSlice.ts`, change `initialState` so it reads what we saved:

```ts
initialState: {
  items: JSON.parse(localStorage.getItem("cart") ?? "[]") as Product[],
},
```

(`?? "[]"` means: if nothing is saved yet, start with an empty list.)

#### Step 3: add it to the store

```ts
middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger, saveCart),
```

#### Step 4: try it

1. Add a few backpacks to the cart.
2. **Refresh the page.** The 🛒 count is still there. 🎉
3. Open DevTools → **Application** → **Local Storage** to see the saved `cart`.

**Notice:** the reducer is still **pure**. It only updates the cart. Saving is a side job, so it lives in the middleware.

#### ✏️ Your turn

1. Make `saveCart` only save when the action is a cart action.
   _(Hint: every cart action's `type` starts with `"cart/"`. Try `(action as { type: string }).type.startsWith("cart/")`.)_
2. Write a `countActions` middleware that counts how many actions have been dispatched and logs `"Action #1"`, `"Action #2"`, and so on.

---

## ✅ Check Your Understanding

1. In the bank analogy, what is the **action** and what is the **reducer**?
2. Why must a reducer return a **new** state instead of changing the old one?
3. In your own words, what does **Immer** do?
4. Inside a slice, why does `state = []` not work?
5. How would you read the theme `mode` in a component?
6. When would you choose Context over Redux Toolkit?
7. What's the difference between `useReducer` and a Redux store?
8. Where does middleware sit in the Redux cycle, and what happens if it never calls `next(action)`?
9. Why doesn't saving to `localStorage` belong inside a reducer?

---

## 📝 Assignment: Business Layer

**Task:** Add a `user` slice to your Redux Toolkit store alongside `cart`, and read from both in a single component with `useSelector`.

**Requirements**

- [ ] Create `src/store/userSlice.ts` with state `{ name: "", isLoggedIn: false }`
- [ ] Add two actions: `login(name)` and `logout()`
- [ ] Add the slice to `configureStore`
- [ ] In `<Header />`, show **"Welcome, {name}"** when logged in, or a **Log in** button when not, next to the cart count
- [ ] Clicking **Lo\*\***g out\*\* clears the user

**Starter hint**

```ts
login: (state, action: PayloadAction<string>) => {
  state.name = action.payload;
  state.isLoggedIn = true;
},
```

**⭐ Stretch:** add a **Clear cart** button to the Header using the `clearCart` action.

---

### 📚 Read more

- Redux Toolkit Quick Start: https://redux-toolkit.js.org/tutorials/quick-start
- React Context docs: https://react.dev/learn/passing-data-deeply-with-context

**Next class:** the Data Layer, where we fetch real products from an API (and meet **thunk** middleware properly).

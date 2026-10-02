# Week 4: CI/CD with GitHub Actions

**Date:** Friday, 2 Oct 2026
**Facilitator:** Goodnews

## Today in one paragraph

When you push code to GitHub, GitHub can **automatically run your project's checks** for you: install the packages, check the code, run the tests, and build the app. If everything passes, you get a green ✅. If anything fails, you get a red ❌, and you know something is broken **before** it gets merged. This is called **CI** (Continuous Integration). Automatically putting the app live afterwards is called **CD** (Continuous Deployment). The tool we'll use is **GitHub Actions**, and you set it up by writing one small file.

## Today's Plan

1. What is CI/CD?
2. The pipeline
3. Getting ready: automated tests
4. Your first GitHub Actions workflow
5. Triggers: when does it run?
6. Break it on purpose
7. Debugging a failing run
8. Branch protection
9. A peek at CD
10. Assignment

---

## 1. What is CI/CD?

Right now, the only thing stopping broken code from reaching `main` is a person remembering to test it. People forget. **CI/CD hands that job to a computer.**

### The two words

- **CI = Continuous Integration.** "Integration" means joining everyone's code together. "Continuous" means doing it all the time. In practice: **every time someone pushes, a computer checks the code automatically.**
- **CD = Continuous Deployment (or Delivery).** After the checks pass, the app is **released**, so users get the new version.

**An easy way to remember it:**

- **CI** asks: _"Is this code good?"_
- **CD** says: _"Good. Now ship it."_

### Analogy: a bottling factory 🏭

Think of a bottling factory. Each bottle passes stations: fill, cap, inspect, label, ship. If a bottle fails inspection, it's thrown out and never reaches a shop.

| Factory            | CI/CD              |
| ------------------ | ------------------ |
| A bottle           | Your code change   |
| The stations       | The checks         |
| Failing inspection | A red ❌           |
| Shipping to shops  | Deploying to users |

### Why teams use it

- **Bugs are caught in minutes**, not days later by a customer.
- **Nobody merges broken code**, because the checks must pass first.
- **"It works on my machine" stops being an excuse**, because the checks run on a fresh computer every time.

---

## 2. The Pipeline

A **pipeline** is just a **list of commands that run one after another**.

> 💡 **They're the same commands you already type in your terminal.** Nothing magic.

| Step    | Command         | What it checks                                          |
| ------- | --------------- | ------------------------------------------------------- |
| Install | `npm ci`        | "Can we download all the packages?"                     |
| Lint    | `npm run lint`  | "Does the code look right?" (like spell-check for code) |
| Test    | `npm test`      | "Does the code do what it should?"                      |
| Build   | `npm run build` | "Can we turn it into a finished app?"                   |
| Deploy  | (later)         | "Put it live"                                           |

### Fail fast

If one step fails, **the steps after it don't run**. There's no point building an app if its tests already failed.

```
 Install ✅ ─► Lint ✅ ─► Test ❌ ─► Build ⏭️ skipped
```

### How does the computer know a step failed?

When any command finishes, it quietly returns a number called an **exit code**:

- **`0`** means "everything went fine"
- **any other number** means "something went wrong"

The pipeline **doesn't read the error message**. It only looks at that number. When a test fails, Vitest prints a red message for **you** to read, and returns `1` for the **pipeline**.

See it yourself:

```bash
npm test
echo $?
```

`echo $?` means "print the number the last command returned". You'll see `0` when the tests pass, and `1` when one fails.

> On Windows PowerShell, use `echo $LASTEXITCODE` instead.

---

## 3. Getting Ready: Automated Tests

The pipeline can only check what you **tell** it to check. ShopLite has no tests yet, so right now the pipeline could only prove the app **builds**, not that it **works**. Let's add tests first.

### What is a test?

A test is a few lines of code that **use your code and check the result**. Every test follows the same three steps:

1. **Set up** the starting point
2. **Do** the thing
3. **Check** what happened

```ts
it("adds an item to the cart", () => {
  const state = cartReducer({ items: [] }, addItem(backpack)); // set up + do
  expect(state.items).toHaveLength(1); // check
});
```

Read it as English:

- `it("adds an item to the cart", ...)` → "**It** adds an item to the cart." This is the test's name.
- `cartReducer({ items: [] }, addItem(backpack))` → "Start with an empty cart, and add a backpack."
- `expect(state.items).toHaveLength(1)` → "I **expect** the cart to **have** 1 item."

If the cart has 1 item, the test passes ✅. If not, it fails ❌.

### Why test reducers?

Remember the Day 1 rule: **reducers are pure**. Same input, same output, no clicking, no internet. That makes them the **easiest thing to test**. You just call the function and look at what comes back. No store, no button, no browser.

### 🧪 Practical: add tests to ShopLite

#### Step 1: install the tools

```bash
npm install -D vitest jsdom
```

- **Vitest** is the tool that runs tests.
- **jsdom** is a **fake browser**. Tests run in Node (on your computer, not in Chrome), and Node doesn't have browser things like `localStorage`. Our cart reads `localStorage` to load the saved cart, so without a fake browser the test crashes with `localStorage is not defined`.
- `-D` means "this is a tool for developers, not part of the app users download".

#### Step 2: tell Vitest to use the fake browser

Replace everything in `vite.config.ts` with:

```ts
/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom", // gives tests a fake browser (window, localStorage, ...)
  },
});
```

- The `test:` part tells Vitest: "run the tests inside the fake browser".
- The first line (`/// <reference …>`) only stops VS Code showing a red underline under `test:`.

#### Step 3: add a test command

In `package.json`, add a `"test"` line to `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "oxlint",
  "preview": "vite preview",
  "test": "vitest run"
}
```

Now `npm test` runs `vitest run`. The word `run` means "run the tests **once** and stop". (Plain `vitest` keeps watching your files and re-runs every time you save, which is handy while coding.)

#### Step 4: write the tests

Test files sit **next to** the file they test, and end in `.test.ts`. Vitest finds them automatically.

Create `src/store/cartSlice.test.ts`:

```ts
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
```

**Where does `cartReducer` come from?** Look at the bottom of `cartSlice.ts`:

```ts
export const { addItem, clearCart } = cartSlice.actions; // named exports
export default cartSlice.reducer; // default export
```

- `cartReducer` (outside the curly braces) is the **default export**, which is `cartSlice.reducer`. With a default import you choose the name yourself.
- `{ addItem, clearCart }` (inside the curly braces) are the **named exports**, which must use their exact names.

It's the same reducer the store uses. The test just calls it directly instead of going through the store.

Now create `src/store/themeSlice.test.ts`:

```ts
// src/store/themeSlice.test.ts
import { describe, it, expect } from "vitest";
import themeReducer, { toggleTheme } from "./themeSlice";

describe("themeSlice", () => {
  it("switches from light to dark", () => {
    const state = themeReducer({ mode: "light" }, toggleTheme());
    expect(state.mode).toBe("dark");
  });

  it("switches back from dark to light", () => {
    const state = themeReducer({ mode: "dark" }, toggleTheme());
    expect(state.mode).toBe("light");
  });
});
```

**The new words:**

| Word                         | Meaning                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `describe("cartSlice", ...)` | A**folder** for related tests. It groups them under one name |
| `it("...", ...)`             | One test                                                     |
| `expect(value)`              | "I expect this value…"                                       |
| `.toBe(x)`                   | "…to be exactly`x`"                                          |
| `.toHaveLength(n)`           | "…to have`n` items"                                          |

#### Step 5: run them

```bash
npm test
```

```
 ✓ src/store/themeSlice.test.ts (2 tests)
 ✓ src/store/cartSlice.test.ts (2 tests)

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

#### Step 6: check the whole pipeline on your laptop

Before giving it to GitHub, run all three checks yourself:

```bash
npm run lint
npm test
npm run build
```

All three should finish with no errors. **If it fails on your laptop, it'll fail on GitHub too.**

Then commit:

```bash
git add .
git commit -m "Add Vitest and reducer tests"
```

---

## 4. Your First GitHub Actions Workflow

**GitHub Actions** is GitHub's built-in robot. You give it a **to-do list** in a file. Every time you push, GitHub gets a **brand-new, empty computer**, and the robot follows your list on it.

### What happens when you push

```
You push
   ↓
GitHub finds your list (.github/workflows/ci.yml)
   ↓
GitHub starts a brand-new, empty Linux computer
   ↓
It follows the list: get the code → install Node → npm ci → lint → test → build
   ↓
Shows ✅ or ❌ next to your commit / pull request
   ↓
Throws the computer away
```

**The computer starts completely empty.** It doesn't have your code, Node or your packages. That's why the first items on the list are "get the code" and "install Node".

### The words

| Word                 | Simple meaning                                             |
| -------------------- | ---------------------------------------------------------- |
| **Workflow**         | The whole to-do list (the`.yml` file)                      |
| **Trigger** (`on:`)  | **When** to start the list                                 |
| **Job**              | A group of steps that run on one computer                  |
| **Runner**           | The borrowed computer                                      |
| **Step**             | One item on the list                                       |
| **Action** (`uses:`) | A ready-made step someone else wrote, so you don't have to |

### YAML

The file is written in **YAML**, a way of writing settings that uses **indentation** (spaces) to show what belongs to what.

> ⚠️ **The one rule that matters:** use **spaces, not tabs**, and line things up **exactly**. One space out of place and the file breaks.

### 🧪 Practical: create the workflow

Create this file in your ShopLite project. The path must be **exactly** this, with the dot at the start:

```
.github/workflows/ci.yml
```

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Check out the code
        uses: actions/checkout@v7

      - name: Set up Node
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

### What each part means

```yaml
name: CI
```

The name you'll see on GitHub. It could be anything.

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**When to run:** whenever someone pushes to `main`, and whenever someone opens a pull request into `main`.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

"There's one job, called `build`. Run it on a Linux computer." (`ubuntu-latest` means the newest standard Linux.)

```yaml
- name: Check out the code
  uses: actions/checkout@v7
```

**Step 1: download your code onto the empty computer.** `uses:` means "use a ready-made action". `actions/checkout` is the action's name, and `@v7` is its version. Without this step there's no code, and everything after it fails.

```yaml
- name: Set up Node
  uses: actions/setup-node@v7
  with:
    node-version: 24
    cache: npm
```

**Step 2: install Node.js, version 24.** `with:` passes settings to the action. `cache: npm` means "remember the downloaded packages for next time", so later runs are faster.

```yaml
- name: Install dependencies
  run: npm ci
```

**Step 3: install the packages.** `run:` means "type this command in the terminal". It's just a normal command.

```yaml
- name: Lint
  run: npm run lint
- name: Test
  run: npm test
- name: Build
  run: npm run build
```

**Steps 4, 5 and 6:** the same commands you just ran on your laptop.

**`uses` vs `run`:**

- `uses:` = use a ready-made tool (like buying a machine)
- `run:` = run a command yourself (like doing the job by hand)

### `npm ci` vs `npm install`

Both install packages, but:

- **`npm install`** is flexible. It might update versions and change your lock file. Use it on your laptop.
- **`npm ci`** is strict. It installs **exactly** what's written in `package-lock.json`, nothing else. If anything doesn't match, it stops with an error.

The pipeline uses `npm ci` because you want **the exact same packages every time**.

> ⚠️ That's also why **`package-lock.json` must be committed** to GitHub. Without it, `npm ci` fails.

### Push it and watch it run

```bash
git add .github
git commit -m "Add CI workflow"
git push
```

Open your repo on GitHub → the **Actions** tab:

- 🟡 = running
- ✅ = all steps passed
- ❌ = a step failed

Click the run, then the **build** job. You can open each step to see its output, exactly like your terminal.

### Why "it works on my machine" stops here

Because the runner is **brand new every time**, it only has what's actually in your repo. If you forgot to commit a file, or installed a package without saving it, your laptop works but the pipeline fails. That's a good thing: it caught a problem your teammates would have hit.

---

## 5. Triggers: When Does It Run?

`on:` decides **when** the list runs.

| Trigger             | Runs when…                                                 |
| ------------------- | ---------------------------------------------------------- |
| `push`              | Someone pushes commits                                     |
| `pull_request`      | Someone opens a pull request, or pushes more commits to it |
| `workflow_dispatch` | Someone clicks a**Run workflow** button on GitHub          |
| `schedule`          | At a set time, like every night                            |

**The one that matters most is `pull_request`.** It checks the code **before** anyone clicks Merge. That's the whole point of CI.

**Why have `push` as well?** Two pull requests can each pass on their own but break when they're both merged. Checking `main` after every merge catches that.

---

## 6. Break It on Purpose

The best way to understand CI is to **watch it catch a mistake**.

### 🧪 Practical: a red pull request

**Step 1:** make a new branch

```bash
git switch main
git pull
git switch -c test/break-the-build
```

**Step 2:** break a test. In `src/store/cartSlice.test.ts`, change:

```ts
expect(state.items).toHaveLength(1);
```

to:

```ts
expect(state.items).toHaveLength(2);
```

**Step 3:** see it fail on your laptop first:

```bash
npm test
```

```
 FAIL  src/store/cartSlice.test.ts > cartSlice > adds an item to the cart
AssertionError: expected [ { id: 1, title: 'Backpack', …(4) } ] to have a length of 2 but got 1

      Tests  1 failed | 3 passed (4)
```

In plain words: _"You said the cart should have 2 items, but it had 1."_

**Step 4:** push it anyway, and open a pull request into `main`:

```bash
git commit -am "Break a test on purpose"
git push -u origin test/break-the-build
```

**Step 5:** watch the pull request page. After a minute you'll see:

> ❌ **Some checks were not successful**

Click **Details**. You'll see the red ❌ on the **Test** step, and **Build** was **skipped** (fail fast).

**Step 6:** fix it. Change `2` back to `1`, then:

```bash
git commit -am "Fix the cart test"
git push
```

**You don't need a new pull request.** A pull request follows its branch, so every new push re-runs the checks. The **same** pull request turns ✅ green.

> 💡 That ❌ appeared **before** anyone merged anything. In a real team, the broken code never reaches `main`.

---

## 7. Debugging a Failing Run

When something goes red, follow four steps:

1. **Find the step with the ❌.**
2. **Open it and read the first error**, not the last line. The last lines usually just say "exit code 1".
3. **Run the same command on your laptop.** Most of the time it fails there too, and you can fix it there.
4. **If it works on your laptop but fails on GitHub,** something on your laptop isn't in the repo. Check `git status`.

### Common problems

| What you see                             | What it really means                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm ci` complains about being "in sync" | You installed a package but didn't commit`package-lock.json`. Run `npm install`, then commit it                                |
| `Missing script: "test"`                 | There's no`test` line in `package.json`                                                                                        |
| `localStorage is not defined`            | The fake browser isn't set up. Check`jsdom` is installed and `environment: 'jsdom'` is in `vite.config.ts`                     |
| `Cannot find module …`                   | A file isn't committed, or the capital letters are wrong. Linux cares about capitals:`header` and `Header` are different files |
| An error in**Build** only                | A TypeScript mistake.`npm run build` checks types, `npm run dev` doesn't. Run `npm run build` on your laptop                   |
| No run appears at all                    | The file isn't at`.github/workflows/ci.yml`, or the YAML spacing is wrong                                                      |

---

## 8. Branch Protection

On its own, a red ❌ is **just a warning**. Someone can still click Merge.

**Branch protection** turns it into a **rule**: nobody can merge into `main` unless the checks are green. The Merge button is greyed out until they pass.

> The red ❌ is a security guard saying "don't let this in". Branch protection is **locking the door**.

### Set it up

1. Repo → **Settings** → **Branches**
2. Add a branch protection rule for `main`
3. Tick **Require a pull request before merging**
4. Tick **Require status checks to pass before merging**, then search for and select **build**
5. Save

> 💡 The **build** check only appears in the list **after the workflow has run at least once**. If it's missing, push something first.

---

## 9. A Peek at CD

CI checks the code. **CD puts it live.**

`npm run build` creates a `dist/` folder: the finished website. **Deploying** just means copying that folder to a server people can visit.

The easiest way is a service like **Vercel** or **Netlify**:

1. Connect your GitHub repo
2. Every push to `main` automatically builds and puts the site live
3. Every pull request gets its own **preview link**, so you can see the change before merging

You don't write any extra code for this. The service does it for you.

```
 Pull request ─► CI checks ✅ ─► Merge to main ─► CD deploys 🚀
```

---

## 📋 Cheat Sheet

| I want to…                                  | Do this                                               |
| ------------------------------------------- | ----------------------------------------------------- |
| Run tests once                              | `npm test`                                            |
| Run tests while I code                      | `npx vitest` (press `q` to quit)                      |
| Check everything on my laptop               | `npm run lint`, then `npm test`, then `npm run build` |
| See the last command's exit code            | `echo $?` (PowerShell: `echo $LASTEXITCODE`)          |
| Create a workflow                           | Add a`.yml` file in `.github/workflows/`              |
| Run checks on every pull request into`main` | `on: pull_request: branches: [main]`                  |
| See why a run failed                        | Actions tab → the run → the job → the step with ❌    |
| Stop red pull requests being merged         | Settings → Branches → require status checks           |

---

## ✅ Check Your Understanding

1. What does CI stand for, and what does it do on every push?
2. What's the difference between CI and CD?
3. Name the four pipeline steps we used, in order.
4. What does "fail fast" mean?
5. How does GitHub know a step failed?
6. Why do our cart tests need `jsdom`?
7. What's the difference between `vitest run` and plain `vitest`?
8. Where must the workflow file live?
9. What does `actions/checkout` do, and what happens without it?
10. Why use `npm ci` instead of `npm install` in a pipeline?
11. Which trigger checks code **before** it's merged?
12. Your tests pass on your laptop but fail on GitHub. Name two possible reasons.
13. What does branch protection add that a red ❌ on its own doesn't?

---

## 📝 Assignment: CI/CD

**Task:** Add a GitHub Actions workflow that runs automatically on every pull request into `main`, and break a test on purpose to see the workflow fail red.

**What to do**

1. Use your **ShopLite** repository on GitHub
2. Add Vitest and write at least **4 tests**. At least one must test a slice **you** wrote (for example the `user` slice: does `login` save the name? does `logout` clear it?)
3. Add `.github/workflows/ci.yml` that runs **install → lint → test → build** on every pull request into `main`
4. Open a pull request with a test broken on purpose, and let it fail ❌
5. Push a fix to the **same** pull request, and let it pass ✅
6. Merge the pull request

**Submit**

1. The link to your GitHub repository
2. A screenshot of the pull request with the **red ❌**
3. A screenshot of the **same** pull request with the **green ✅**
4. A screenshot of the failed run's log, showing the test's error message

**⭐ Stretch goals**

1. Turn on **branch protection**, and screenshot the greyed-out Merge button on a failing pull request
2. Add `workflow_dispatch:` under `on:`, and run the workflow by hand from the Actions tab
3. Deploy ShopLite to **Vercel** or **Netlify**, and put the live link in your README

---

### 📚 Read more

- GitHub Actions quickstart: https://docs.github.com/en/actions/quickstart
- Vitest getting started: https://vitest.dev/guide/
- Deploying a Vite app: https://vite.dev/guide/static-deploy

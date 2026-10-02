# Week 4: Version Control with Git & GitHub

**Date:** Thursday, 1 Oct 2026
**Facilitator:** Goodnews

## Today's Plan

1. Why version control?
2. Setting up Git
3. How Git thinks: the three areas
4. Your first repository
5. Undoing mistakes
6. GitHub: push, clone and pull
7. Branches
8. Merging
9. Merge conflicts
10. Working as a team: pull requests
11. Assignment

---

## 1. Why Version Control?

Have you ever had a folder like this?

```
project.zip
project-final.zip
project-final-v2.zip
project-final-v2-FIXED.zip
project-final-v2-FIXED-use-this-one.zip
```

Now imagine five developers working on the same app, each sending zip files back and forth. Someone overwrites someone else's work. Nobody knows which version is the real one. A bug appears and no one can tell what changed.

**Git** fixes this. It's a **version control system**: it records every change to your project, who made it, when, and why.

### Analogy: save points in a video game 🎮

| Video game                            | Git                            |
| ------------------------------------- | ------------------------------ |
| A save point                          | A**commit**                    |
| The save folder                       | A**repository** (repo)         |
| Loading an old save                   | Going back to an old commit    |
| Saves on your console                 | Your**local** repo             |
| Cloud saves your friends can download | A**remote** repo on **GitHub** |

### Git vs GitHub

These are **not** the same thing:

|               | Git                        | GitHub                                    |
| ------------- | -------------------------- | ----------------------------------------- |
| What it is    | A**tool** on your computer | A**website** that stores Git repos online |
| Works offline | ✅                         | ❌                                        |
| Used for      | Tracking changes           | Sharing code, teamwork, reviewing code    |

Git is the camera. GitHub is the online photo album where you share the pictures.

---

## 2. Setting Up Git

### Check Git is installed

```bash
git --version
```

If you see a version number (e.g. `git version 2.43.0`), you're ready. If not, install it from https://git-scm.com/downloads.

### Tell Git who you are (once per computer)

Every commit records who made it. Use the **same email as your GitHub account**.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### Three settings that save you trouble later

```bash
# Call the first branch "main" (GitHub's default)
git config --global init.defaultBranch main

# When you pull, merge other people's work into yours
git config --global pull.rebase false

# Open VS Code when Git needs you to type a message
git config --global core.editor "code --wait"
```

> 💡 Without the last one, Git may open an editor called **Vim** inside your terminal. If you ever get stuck in it: press `Esc`, type `:wq`, and press `Enter`.

Check your settings:

```bash
git config --global --list
```

---

## 3. How Git Thinks: The Three Areas

This is the most important idea of the day. A file moves through **three areas** before it's saved in history:

```
 Working Directory  ──git add──►  Staging Area  ──git commit──►  Repository
  (your files, as you                (the box you're             (saved history:
   edit them)                         packing)                    your save points)
```

### Analogy: sending a parcel 📦

1. **Working directory:** items lying around your room. You're still changing them.
2. **`git add`:** you put the items you want to send **into the box**. That's the **staging area**.
3. **`git commit`:** you **seal and label** the box. It's now a saved snapshot with a message.
4. **`git push`** (later): you **send the box** to the post office (GitHub).

**Why have a staging area at all?** So you can choose **what** goes into each commit. You changed five files, but only three are about the new feature? Stage those three, commit them, then commit the rest separately.

---

## 4. Your First Repository

### 🧪 Practical: create a repo and make commits

Make a new practice folder and open it in VS Code:

```bash
mkdir git-practice
cd git-practice
```

**Step 1: turn the folder into a repo**

```bash
git init
```

Git creates a hidden `.git` folder. **That folder is the repository.** It holds all the history. Never edit it by hand.

**Step 2: create two files**

Create `README.md`:

```md
# My Shop
```

Create `Header.tsx`:

```tsx
export function Header() {
  return <h1>My Shop</h1>;
}
```

**Step 3: ask Git what's going on**

```bash
git status
```

```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	Header.tsx
	README.md
```

**Untracked** means Git can see the files but isn't tracking them yet.

> 💡 Run `git status` **all the time**. It always tells you where you are and often tells you what to do next.

**Step 4: stage the files (put them in the box)**

```bash
git add .
```

The `.` means "everything in this folder". To stage a single file: `git add Header.tsx`.

Run `git status` again. The files are now listed under **"Changes to be committed"**.

**Step 5: commit (seal the box)**

```bash
git commit -m "Add header and readme"
```

```
[main (root-commit) c5d6418] Add header and readme
 2 files changed, 4 insertions(+)
```

`c5d6418` is the commit's **ID** (a short version of its hash). Every commit gets a unique one.

**Step 6: make a change and commit again**

Change the heading in `Header.tsx` to `My Awesome Shop`, then:

```bash
git diff                    # see exactly what changed (before staging)
git add Header.tsx
git commit -m "Update shop name in header"
```

**Step 7: look at the history**

```bash
git log --oneline
```

```
a1b2c3d Update shop name in header
c5d6418 Add header and readme
```

Newest at the top. Each line is a save point you can go back to.

### Useful commands so far

| Command                        | What it does                          |
| ------------------------------ | ------------------------------------- |
| `git init`                     | Turn a folder into a repo             |
| `git status`                   | What's changed? What's staged?        |
| `git add <file>` / `git add .` | Stage a file / everything             |
| `git commit -m "message"`      | Save the staged changes as a commit   |
| `git diff`                     | Show changes that aren't staged yet   |
| `git log --oneline`            | Show the history, one line per commit |

### Writing good commit messages

A good message completes the sentence: **"If applied, this commit will…"**

| ❌ Bad   | ✅ Good                                        |
| -------- | ---------------------------------------------- |
| `update` | `Add user slice with login and logout`         |
| `fix`    | `Fix cart count not updating after clear`      |
| `stuff`  | `Load products with RTK Query`                 |
| `asdfgh` | `Add loading and error states to product grid` |

**Small commits, one idea each.** "Add login and fix footer and change colours" should be three commits.

### `.gitignore`: files Git should never track

Some files should **never** be committed:

- `node_modules/`: huge, and anyone can recreate it with `npm install`
- `dist/`: build output, recreated with `npm run build`
- `.env`: secret keys and passwords 🔒

List them in a file called `.gitignore` in the project root:

```
node_modules
dist
.env
```

Your ShopLite project already has one (Vite created it). Open it and have a look.

> ⚠️ **Never commit passwords or API keys.** Once something is pushed to GitHub, assume it's public forever, even if you delete it later.

---

## 5. Undoing Mistakes

Everyone makes mistakes with Git. Here's how to fix the common ones.

| Situation                                            | Command                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| "I edited a file and want to throw the changes away" | `git restore <file>`                                          |
| "I staged a file by mistake"                         | `git restore --staged <file>` (the changes stay in your file) |
| "I made a typo in my last commit message"            | `git commit --amend -m "Better message"`                      |
| "I forgot to add a file to my last commit"           | `git add <file>` then `git commit --amend --no-edit`          |

> ⚠️ `git restore <file>` **permanently deletes** your uncommitted changes to that file. There's no undo for that one.
>
> ⚠️ Only use `--amend` on commits you **haven't pushed** yet. Changing a commit that teammates already have causes problems for them.

---

## 6. GitHub: Push, Clone and Pull

So far everything is on **your computer only**. Let's put it online.

### Analogy: cloud saves ☁️

- **Push:** upload your save points to the cloud.
- **Pull:** download the latest save points your friends uploaded.
- **Clone:** download someone's whole save folder for the first time.

### 🧪 Practical: push your repo to GitHub

**Step 1:** sign in to https://github.com (create a free account if you don't have one).

**Step 2:** click **New** (the green button) to create a repository.

- Name: `git-practice`
- Leave **"Add a README"** unticked (we already have one)
- Click **Create repository**

**Step 3:** GitHub shows you some commands. Copy the ones under **"…or push an existing repository from the command line"**. They look like this:

```bash
git remote add origin https://github.com/YOUR-USERNAME/git-practice.git
git branch -M main
git push -u origin main
```

| Command                       | Meaning                                                                     |
| ----------------------------- | --------------------------------------------------------------------------- |
| `git remote add origin <url>` | "My online copy lives at this address. Call it`origin`."                    |
| `git branch -M main`          | Make sure the branch is called`main`                                        |
| `git push -u origin main`     | Upload`main` to `origin`. `-u` remembers this, so next time just `git push` |

**Step 4:** refresh the GitHub page. Your files and commits are there. 🎉

### Signing in when you push

The first time you push, Git asks you to sign in.

- A **browser window or VS Code pop-up** usually appears. Sign in there and approve.
- If the terminal asks for a **password**, your GitHub account password **won't work**. GitHub needs a **personal access token** instead: GitHub → **Settings** → **Developer settings** → **Personal access tokens**. Create one and paste it as the password.

### The daily loop

```bash
git pull          # 1. get your team's latest work FIRST
# ...write code...
git add .
git commit -m "Describe what you did"
git push          # 2. share your work
```

### Clone: getting a project for the first time

```bash
git clone https://github.com/SOMEONE/some-project.git
cd some-project
npm install       # node_modules isn't in the repo (it's in .gitignore)
```

`git clone` downloads the **whole project and its history**, and sets up `origin` for you.

### When `git push` is rejected

```
error: failed to push some refs to 'https://github.com/...'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally.
```

This means **a teammate pushed before you**. GitHub won't let you overwrite their work.

**Fix:** pull first, then push again:

```bash
git pull
git push
```

---

## 7. Branches

### Why branches?

On a team, `main` should **always work**. But new features take days and break things along the way. You can't experiment on `main` while everyone else depends on it.

### Analogy: drafts of an essay ✍️

`main` is the version you've **handed in**. When you want to try a new paragraph, you make a **copy** (a **branch**) and experiment there.

- If it's good, you **merge** it into the final version.
- If it's bad, you throw the copy away. The final version was never at risk.

```
main:            A───B───────────E   (always works)
                      \         /
feature/footer:        C───D───      (work in progress)
```

### Branch commands

```bash
git branch                       # list branches (* marks the one you're on)
git switch -c feature/footer     # create a new branch AND switch to it
git switch main                  # switch back to main
git branch -d feature/footer     # delete a branch (after it's merged)
```

> Older tutorials use `git checkout -b feature/footer` and `git checkout main`. They do the same thing. `git switch` is the newer, clearer command.

### Naming branches

Use a **type** and a short description:

| Type       | Example              |
| ---------- | -------------------- |
| `feature/` | `feature/cart-page`  |
| `fix/`     | `fix/cart-count-bug` |
| `docs/`    | `docs/update-readme` |

### 🧪 Practical: work on a branch

In `git-practice`:

```bash
git switch -c feature/footer
```

Create `Footer.tsx`:

```tsx
export function Footer() {
  return <footer>© 2026 My Shop</footer>;
}
```

```bash
git add .
git commit -m "Add footer"
```

Now switch back:

```bash
git switch main
```

**Look at your folder.** `Footer.tsx` has **disappeared**! It's not lost. It only exists on the `feature/footer` branch. Switch back and it reappears:

```bash
git switch feature/footer   # Footer.tsx is back
git switch main             # gone again
```

> ⚠️ **Commit (or stash) your work before switching branches.** If you have uncommitted changes, Git may refuse to switch, or carry the changes with you to the other branch.

---

## 8. Merging

**Merging** brings the commits from one branch into another.

**Rule:** switch to the branch you want to merge **into**, then merge the other one **in**.

```bash
git switch main               # 1. go to the branch that RECEIVES the work
git merge feature/footer      # 2. bring the feature in
```

```
Updating c5d6418..32aeddd
Fast-forward
 Footer.tsx | 1 +
 1 file changed, 1 insertion(+)
```

`Footer.tsx` is now on `main`. Clean up the branch:

```bash
git branch -d feature/footer
```

### Two kinds of merge

| Kind             | When                                     | What happens                                                      |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| **Fast-forward** | `main` hasn't changed since you branched | Git just moves`main` forward to your latest commit. No new commit |
| **Merge commit** | **Both** branches have new commits       | Git combines them and creates a new**merge commit**               |

If Git makes a merge commit, it may open your editor for a message. The default message is fine: save and close the file.

See it as a picture with `git log --oneline --graph`. For example, after a merge commit:

```
*   7f144a8 Merge branch 'feature/a'
|\
| * 6a3583f Add A
* | 3d5f7ee Add B
|/
* 32aeddd Add footer
```

---

## 9. Merge Conflicts

### What is a conflict?

Usually Git merges by itself, even when both branches changed the same file, as long as they changed **different lines**.

A **conflict** happens when **two branches changed the same line in different ways**. Git can't guess which one is right, so it asks **you** to decide.

### Analogy: two editors, one sentence

You and a classmate each have a copy of the essay. You both rewrite **the same sentence** differently. When you combine the copies, someone has to decide which sentence to keep, or how to combine them. Git hands that decision to you.

> 💡 **A conflict is not an error, and you didn't break anything.** It's Git asking a question.

### 🧪 Practical: cause and fix a conflict

Do this in `git-practice`. Make sure `git status` says **"nothing to commit, working tree clean"** before you start.

**Step 1: on a new branch, change the heading**

```bash
git switch -c feature/rename
```

In `Header.tsx`, change the heading to:

```tsx
return <h1>ShopLite Nigeria</h1>;
```

```bash
git commit -am "Rename shop"
```

> `-am` = stage all **tracked** files that changed **and** commit, in one step. (It doesn't add brand-new files.)

**Step 2: go back to main and change the SAME line differently**

```bash
git switch main
```

In `Header.tsx`:

```tsx
return <h1 className="text-blue-600">My Awesome Shop</h1>;
```

```bash
git commit -am "Style header"
```

**Step 3: merge, and watch the conflict happen**

```bash
git merge feature/rename
```

```
Auto-merging Header.tsx
CONFLICT (content): Merge conflict in Header.tsx
Automatic merge failed; fix conflicts and then commit the result.
```

**Step 4: open `Header.tsx`**

```tsx
export function Header() {
<<<<<<< HEAD
  return <h1 className="text-blue-600">My Awesome Shop</h1>;
=======
  return <h1>ShopLite Nigeria</h1>;
>>>>>>> feature/rename
}
```

### Reading the conflict markers

| Marker                   | Meaning                                                  |
| ------------------------ | -------------------------------------------------------- |
| `<<<<<<< HEAD`           | Start of**your current branch's** version (here: `main`) |
| `=======`                | The dividing line                                        |
| `>>>>>>> feature/rename` | End of the**incoming branch's** version                  |

**Your job:** decide what the final code should be, then **delete all three marker lines**.

You can keep yours, keep theirs, or **combine both**:

```tsx
export function Header() {
  return <h1 className="text-blue-600">ShopLite Nigeria</h1>;
}
```

**In VS Code**, you'll see clickable buttons above the conflict:

- **Accept Current Change**: keep `HEAD` (yours)
- **Accept Incoming Change**: keep the other branch's
- **Accept Both Changes**: keep both, one after the other (you'll usually need to tidy up)

**Step 5: tell Git it's resolved, and finish the merge**

```bash
git add Header.tsx
git commit -m "Merge feature/rename into main"
```

**Step 6: see what happened**

```bash
git log --oneline --graph
```

```
*   f8c9366 Merge feature/rename into main
|\
| * aed1756 Rename shop
* | 16755b4 Style header
|/
* 32aeddd Add footer
```

You can see the two branches splitting and joining again. 🎉

### Changed your mind mid-conflict?

```bash
git merge --abort
```

This puts everything back to how it was before you ran `git merge`.

### How to avoid painful conflicts

- **Pull often**, especially before you start work each day
- **Keep branches short**: merge them in a day or two, not weeks
- **Make small commits** that each do one thing
- **Talk to your team**: "I'm working on the Header today"

### ⚠️ Before you commit a resolved conflict

Search the file for `<<<<<<<`, `=======` and `>>>>>>>`. **If any marker is left, your code won't run.** Committing leftover markers is the most common conflict mistake.

---

## 10. Working as a Team: Pull Requests

On real teams you **don't** merge into `main` on your own computer. You use a **Pull Request (PR)** on GitHub.

A PR says: **"I've finished work on my branch. Please review it and merge it into `main`."**

### Analogy: handing your essay to an editor 📝

Before an article goes in the newspaper, an editor reads it, leaves comments, and asks for fixes. Only then does it get printed. A PR is how your code gets reviewed before it reaches `main`.

### The team workflow

```
1. git switch main
2. git pull                          ← start from the latest main
3. git switch -c feature/my-thing    ← make a branch
4. ...write code, commit often...
5. git push -u origin feature/my-thing
6. On GitHub: open a Pull Request
7. A teammate reviews it, you fix anything they ask for (just commit and push again)
8. Merge the PR on GitHub
9. git switch main
10. git pull                         ← get the merged work
11. git branch -d feature/my-thing   ← clean up
```

### 🧪 Practical: your first pull request

In `git-practice`:

```bash
git switch -c feature/about
```

Create `About.tsx`:

```tsx
export function About() {
  return <p>We sell great things.</p>;
}
```

```bash
git add .
git commit -m "Add about section"
git push -u origin feature/about
```

On GitHub:

1. You'll see a yellow banner: **"feature/about had recent pushes"** → click **Compare & pull request**
2. Write a short title and description: _what_ you changed and _why_
3. Click **Create pull request**
4. Look at the **Files changed** tab. This is what a reviewer sees
5. Click **Merge pull request** → **Confirm merge**
6. Click **Delete branch** (it's merged, so you don't need it on GitHub any more)

Back on your computer:

```bash
git switch main
git pull
git branch -d feature/about
```

`About.tsx` is now on your `main`.

### Conflicts in a pull request

If `main` changed while you were working, GitHub may say **"This branch has conflicts that must be resolved"**. Fix it on your computer:

```bash
git switch feature/my-thing
git pull origin main          # bring the latest main INTO your branch
# ...resolve the conflict, as in Section 9...
git add .
git commit -m "Resolve conflict with main"
git push
```

The PR updates by itself and the conflict warning disappears.

---

## 📋 Git Cheat Sheet

| I want to…                                   | Command                                                   |
| -------------------------------------------- | --------------------------------------------------------- |
| See what's going on                          | `git status`                                              |
| Stage everything                             | `git add .`                                               |
| Commit                                       | `git commit -m "message"`                                 |
| See history                                  | `git log --oneline --graph`                               |
| See unstaged changes                         | `git diff`                                                |
| Create a branch and switch to it             | `git switch -c feature/name`                              |
| Switch branch                                | `git switch name`                                         |
| List branches                                | `git branch`                                              |
| Merge a branch into the current one          | `git merge name`                                          |
| Stop a merge                                 | `git merge --abort`                                       |
| Upload                                       | `git push` (first time: `git push -u origin branch-name`) |
| Download the latest                          | `git pull`                                                |
| Copy a repo from GitHub                      | `git clone <url>`                                         |
| Throw away changes to a file                 | `git restore <file>`                                      |
| Unstage a file                               | `git restore --staged <file>`                             |
| Fix the last commit message (not pushed yet) | `git commit --amend -m "new message"`                     |

---

## ✅ Check Your Understanding

1. What's the difference between Git and GitHub?
2. Name the three areas a change moves through, and the command that moves it from one to the next.
3. What does `git status` tell you?
4. Why should `node_modules` be in `.gitignore`?
5. What's the difference between `git push` and `git pull`?
6. Your `git push` is rejected. What does that usually mean, and what do you do?
7. Why do teams work on branches instead of committing straight to `main`?
8. You want to merge `feature/cart` into `main`. Which branch must you be on?
9. When does a merge conflict happen?
10. What do `<<<<<<<`, `=======` and `>>>>>>>` mean, and what must you do with them?
11. What is a pull request for?

---

## 📝 Assignment: Version Control

**Task:** Create a feature branch, intentionally cause a merge conflict with a partner (or with a second local branch), and resolve it.

**Requirements**

- Push your **ShopLite** project to a new GitHub repository. Make sure `node_modules` is **not** in the repo.
- **With a partner** (recommended):
  1. Add your partner as a collaborator: repo → **Settings** → **Collaborators**
  2. You each create your own branch, and you **both change the same line** (for example, the shop name in `Header.tsx`) in different ways
  3. Each of you opens a pull request
  4. Merge the first PR. The second PR will now have a conflict
  5. Resolve the conflict on your computer, push, and merge the second PR
- **On your own** (if you don't have a partner): create two branches that change the same line differently, merge one into `main`, then merge the other and resolve the conflict. Push `main` to GitHub.
- Every commit has a clear message.

**Submit**

1. The link to your GitHub repository
2. A screenshot of the **conflict markers** in VS Code, taken **before** you resolved them
3. A screenshot of the output of `git log --oneline --graph`, showing the merge

**⭐ Stretch:** turn on **branch protection** for `main` (repo → **Settings** → **Branches**, then add a protection rule for `main` that requires a pull request), so changes can only reach `main` through a pull request.

---

### 📚 Read more

- Pro Git book (free): https://git-scm.com/book/en/v2
- GitHub's Git cheat sheet: https://education.github.com/git-cheat-sheet-education.pdf
- Learn Git Branching (an interactive game in the browser): https://learngitbranching.js.org

**Next class:** CI/CD, where GitHub automatically checks your code every time you push.

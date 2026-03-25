# SPENDLY

**Student Toolkit Document — Moringa AI Capstone**
**Project:** Spendly — Personal Expense Tracker
**Stack:** HTML · CSS · JavaScript (Vanilla ES6+)

---

## 1. Title & Objective

**Project Title:** Spendly — Personal Expense Tracker

**Technology Chosen:** Browser `localStorage` API + DOM Manipulation with Vanilla JavaScript

**Why I chose it:**
- No API keys, no internet connection, no backend required — works offline instantly
- Teaches real-world JavaScript: array methods, event listeners, DOM updates, and data persistence
- Solves a practical everyday problem (tracking spending) making it relatable and useful
- Covers multiple beginner JavaScript concepts in one project

**End Goal:** Build a working single-page expense tracker where users can:
1. Log income and expense transactions with categories and dates
2. See a live summary of total income, expenses, and net balance
3. Track spending against a monthly budget with a visual progress bar
4. Filter, view, and delete transactions — with all data saved between sessions

---

## 2. Quick Summary of the Technology

**What is localStorage?**

`localStorage` is a built-in browser API that lets web pages store key-value data directly in the user's browser — with no server, no database, and no sign-in required. Data stored in `localStorage` persists even after closing and reopening the browser tab.

**Where is it used?**
- Saving user preferences (dark mode, language settings)
- Caching form data so it isn't lost on page refresh
- Simple offline-first apps (notes, to-do lists, trackers)
- Shopping cart persistence without a backend

**One real-world example:**
Many simple productivity tools like [Excalidraw](https://excalidraw.com/) use `localStorage` to auto-save your work in the browser so nothing is lost if you close the tab without manually saving.

---

## 3. System Requirements

| Requirement | Detail |
|---|---|
| OS | Windows, macOS, or Linux |
| Browser | Any modern browser (Chrome, Firefox, Edge, Safari) |
| Code Editor | VS Code recommended |
| Internet | Only needed to load Google Fonts (the app logic works offline) |
| Node.js / npm | Not required |
| Accounts / Keys | None required |

---

## 4. Installation & Setup Instructions

### Step 1 — Download the 3 project files
```
Spendly/
├── index.html
├── style.css
└── app.js
```
All three files must be in the **same folder**.

### Step 2 — Open in your browser
```
Double-click index.html
```
The app opens immediately. No terminal, no build step, no install.

### Step 3 — (Optional) Use a local server for development
With VS Code + Live Server extension:
1. Right-click `index.html` → **Open with Live Server**
2. App opens at `http://localhost:5500` with auto-refresh on save



### Understanding localStorage in this project
The key localStorage calls used:
```js
// Save data
localStorage.setItem('spendly_txns', JSON.stringify(transactions));

// Load data on page open
let transactions = JSON.parse(localStorage.getItem('spendly_txns') || '[]');

// Clear data
localStorage.removeItem('spendly_txns');
```

---

## 5. Minimal Working Example

### What does it do?
The simplest version of a localStorage-powered expense tracker: add items to a list and persist them.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Mini Expense Tracker</title>
</head>
<body>
  <h1>My Expenses</h1>

  <!-- Input form -->
  <input type="text"   id="desc"   placeholder="Description"/>
  <input type="number" id="amount" placeholder="Amount"/>
  <button onclick="addExpense()">Add</button>

  <!-- Display list -->
  <ul id="list"></ul>

  <!-- Running total -->
  <p>Total: KSh <span id="total">0</span></p>

  <script>
    // 1. Load saved expenses from localStorage (or start with empty array)
    let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

    function addExpense() {
      const desc   = document.getElementById('desc').value.trim();
      const amount = parseFloat(document.getElementById('amount').value);

      // 2. Basic validation
      if (!desc || !amount || amount <= 0) {
        alert('Please enter a valid description and amount');
        return;
      }

      // 3. Add to array
      expenses.push({ desc, amount });

      // 4. Save to localStorage (must stringify the array to JSON)
      localStorage.setItem('expenses', JSON.stringify(expenses));

      // 5. Re-render the page
      render();

      // 6. Reset inputs
      document.getElementById('desc').value   = '';
      document.getElementById('amount').value = '';
    }

    function render() {
      // Build the list HTML
      const list  = document.getElementById('list');
      list.innerHTML = expenses.map((e, i) =>
        `<li>${e.desc} — KSh ${e.amount.toFixed(2)}
           <button onclick="deleteExpense(${i})">Delete</button>
        </li>`
      ).join('');

      // Update total
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      document.getElementById('total').textContent = total.toFixed(2);
    }

    function deleteExpense(index) {
      expenses.splice(index, 1);                              // Remove from array
      localStorage.setItem('expenses', JSON.stringify(expenses)); // Re-save
      render();                                               // Re-render
    }

    render(); // Show saved data when page loads
  </script>
</body>
</html>
```

**Expected output:**
- Type a description and amount, click Add
- The item appears in the list and the total updates
- Refresh the page — the items are still there (saved in localStorage)
- Click Delete to remove an item

**Key concepts demonstrated:**
- `localStorage.setItem` / `getItem` — storing and retrieving data
- `JSON.stringify` / `JSON.parse` — converting arrays to storable strings
- `Array.push`, `splice`, `reduce` — manipulating data arrays
- DOM manipulation — updating the page using `innerHTML`

---

## 6. AI Prompt Journal

### Prompt 1 — Understanding localStorage

**Prompt used:**
> "Explain how localStorage works in JavaScript for a beginner. Show me how to save, load, and delete data, and explain why JSON.stringify is needed."

**AI's response summary:**
The AI explained that localStorage only stores strings, so objects and arrays must be converted to JSON strings before saving. It showed the three core methods: `setItem`, `getItem`, and `removeItem`, and demonstrated the round-trip: `JSON.stringify` when saving, `JSON.parse` when reading.

**Evaluation of helpfulness:**
This cleared up why `JSON.stringify` is needed — I had no idea localStorage couldn't store objects directly.

---

### Prompt 2 — Array methods for finance calculations

**Prompt used:**
> "Show me how to use JavaScript array methods like filter, reduce, and map to calculate total income, total expenses, and net balance from an array of transaction objects."

**AI's response summary:**
The AI demonstrated chaining `.filter()` to get only income/expense entries, then `.reduce()` to sum amounts. It showed a clean one-liner for each: `transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)`.

**Evaluation of helpfulness:**
Taught me that `reduce` is the right tool for summing arrays. Much cleaner than a manual for-loop.

---

### Prompt 3 — Dynamic DOM rendering

**Prompt used:**
> "What's the best way to re-render a list of items in JavaScript every time the data changes? Should I use innerHTML or createElement?"

**AI's response summary:**
The AI explained both approaches. For a beginner project, `innerHTML` with template literals is simpler and readable. It warned about XSS (cross-site scripting) when using `innerHTML` with user input, and showed a simple `escapeHtml` helper function to sanitize text before inserting it.

**Evaluation of helpfulness:**
The XSS warning was something I hadn't thought about. I added the `escHtml` function to my project as a result.

---

### Prompt 4 — CSS Grid for dashboard layout

**Prompt used:**
> "How do I create a two-column layout in CSS where the left column is a fixed width form and the right column takes up the remaining space?"

**AI's response summary:**
The AI showed `display: grid; grid-template-columns: 380px 1fr;` for a fixed left column and flexible right column. It also showed how to collapse to a single column on mobile using a media query.

**Evaluation of helpfulness:**
 Clean solution. The `1fr` unit was new to me — it means "take up whatever space is left", which is exactly what I needed.

---

### Prompt 5 — Progress bar with CSS

**Prompt used:**
> "How do I create an animated progress bar in HTML and CSS that fills based on a percentage set from JavaScript?"

**AI's response summary:**
The AI showed a container div with a fixed height and a fill div inside. Setting `width: X%` on the fill div — combined with `transition: width 0.5s ease` — creates a smooth animation. The percentage is calculated in JS and applied via `element.style.width`.

**Evaluation of helpfulness:**
 Simple and effective. The `transition` property made it look polished with minimal effort.

---

## 7. Common Issues & Fixes

### Issue 1 — Data disappears after refresh
**Symptom:** Transactions are lost every time the page is refreshed.

**Cause:** Data is stored in a JavaScript variable but not saved to `localStorage`.

**Fix:** Call `localStorage.setItem(...)` every time the data array changes (after add and after delete).

---

### Issue 2 — localStorage shows `[object Object]` instead of data
**Symptom:** `localStorage.getItem('expenses')` returns `"[object Object]"` and `JSON.parse` throws an error.

**Cause:** Saving the object directly without `JSON.stringify`: `localStorage.setItem('key', myArray)`.

**Fix:** Always wrap the value in `JSON.stringify`:
```js
localStorage.setItem('key', JSON.stringify(myArray));
```

---

### Issue 3 — `JSON.parse` throws on first load
**Symptom:** `Uncaught SyntaxError: Unexpected token u in JSON` on the first time the page loads.

**Cause:** `localStorage.getItem('key')` returns `null` when the key doesn't exist yet. `JSON.parse(null)` throws.

**Fix:** Use a fallback:
```js
let data = JSON.parse(localStorage.getItem('key') || '[]');
```

---

### Issue 4 — Negative balance shows wrong sign
**Symptom:** Balance shows `-KSh -500` (double negative).

**Cause:** Using `Math.abs()` on a number that's already negative AND prepending a minus sign in the template.

**Fix:** Separate the sign from the formatting:
```js
const sign = balance < 0 ? '-' : '';
const display = sign + 'KSh ' + Math.abs(balance).toFixed(2);
```

---

### Issue 5 — Clicking delete inside `innerHTML` doesn't work
**Symptom:** Delete button inside dynamically generated HTML fires no event.

**Cause:** Event listeners added before `innerHTML` renders are wiped when `innerHTML` is overwritten.

**Fix:** Use inline `onclick` attributes in the template string, or use event delegation on the parent element.

---

## 8. References

### Official Documentation
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: JSON.stringify / JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [MDN: Array.prototype.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- [MDN: CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
- [MDN: CSS Custom Properties (Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

### Learning Resources
- [JavaScript.info: localStorage](https://javascript.info/localstorage)
- [JavaScript.info: Array methods](https://javascript.info/array-methods)
- [CSS Tricks: A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Traversy Media — JS Expense Tracker Tutorial (YouTube)](https://www.youtube.com/watch?v=XF1cy0KCeaE)

### Community Help
- [Stack Overflow: localStorage tag](https://stackoverflow.com/questions/tagged/localstorage)
- [r/learnjavascript](https://www.reddit.com/r/learnjavascript/)

---

*Toolkit Document — Moringa AI Capstone Project*
*Technology: localStorage API & DOM Manipulation | Stack: HTML / CSS / JavaScript*

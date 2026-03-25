
let transactions = JSON.parse(localStorage.getItem('spendly_txns') || '[]');
let budget       = parseFloat(localStorage.getItem('spendly_budget') || '0');
let activeType   = 'expense'; // 'expense' | 'income'

// ── Category Config
const CATEGORIES = {
  food:          { emoji: '🍽', label: 'Food & Dining' },
  transport:     { emoji: '🚗', label: 'Transport' },
  shopping:      { emoji: '🛍', label: 'Shopping' },
  bills:         { emoji: '💡', label: 'Bills & Utilities' },
  health:        { emoji: '💊', label: 'Health' },
  entertainment: { emoji: '🎬', label: 'Entertainment' },
  education:     { emoji: '📚', label: 'Education' },
  salary:        { emoji: '💼', label: 'Salary' },
  freelance:     { emoji: '💻', label: 'Freelance' },
  other:         { emoji: '📦', label: 'Other' },
};

// ── Helpers 
const fmt = (n) =>
  'KSh ' + Math.abs(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function save() {
  localStorage.setItem('spendly_txns', JSON.stringify(transactions));
  localStorage.setItem('spendly_budget', budget.toString());
}

function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── DOM refs 
const descEl       = document.getElementById('desc');
const amountEl     = document.getElementById('amount');
const categoryEl   = document.getElementById('category');
const dateEl       = document.getElementById('date');
const addBtn       = document.getElementById('add-btn');
const filterType   = document.getElementById('filter-type');
const filterCat    = document.getElementById('filter-cat');
const budgetInput  = document.getElementById('budget-input');
const clearBtn     = document.getElementById('clear-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalCancel  = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// ── Init ──────────────────────────────────────
dateEl.value = new Date().toISOString().split('T')[0];
document.getElementById('current-month').textContent =
  new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

if (budget > 0) budgetInput.value = budget;

// ── Type Toggle ───────────────────────────────
document.getElementById('btn-expense').addEventListener('click', () => setType('expense'));
document.getElementById('btn-income').addEventListener('click',  () => setType('income'));

function setType(type) {
  activeType = type;
  const expBtn = document.getElementById('btn-expense');
  const incBtn = document.getElementById('btn-income');
  expBtn.classList.toggle('active', type === 'expense');
  incBtn.classList.toggle('active', type === 'income');
  expBtn.classList.toggle('expense-mode', type === 'expense');
  incBtn.classList.toggle('income-mode',  type === 'income');
  expBtn.classList.remove('income-mode');
  incBtn.classList.remove('expense-mode');
}

// Initialise toggle visuals
setType('expense');

// ── Add Transaction 
addBtn.addEventListener('click', () => {
  const desc   = descEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const cat    = categoryEl.value;
  const date   = dateEl.value;

  if (!desc)        { showToast('⚠ Please enter a description.'); descEl.focus();   return; }
  if (!amount || amount <= 0) { showToast('⚠ Enter a valid amount.');  amountEl.focus(); return; }
  if (!date)        { showToast('⚠ Please pick a date.');            dateEl.focus();   return; }

  const txn = {
    id:     genId(),
    desc,
    amount,
    type:   activeType,
    cat,
    date,
  };

  transactions.unshift(txn); // newest first
  save();
  render();

  // Reset form
  descEl.value   = '';
  amountEl.value = '';
  dateEl.value   = new Date().toISOString().split('T')[0];
  descEl.focus();

  showToast(`✓ ${activeType === 'expense' ? 'Expense' : 'Income'} added!`);
});

// Allow Enter key in description to submit
descEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') addBtn.click(); });

// ── Delete Transaction 
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  save();
  render();
  showToast('🗑 Transaction removed.');
}

// ── Budget 
budgetInput.addEventListener('input', () => {
  budget = parseFloat(budgetInput.value) || 0;
  save();
  renderSummary();
});

// ── Filters 
filterType.addEventListener('change', renderList);
filterCat.addEventListener('change',  renderList);

// ── Clear All 
clearBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
modalCancel.addEventListener('click', () => modalOverlay.classList.remove('open'));
modalConfirm.addEventListener('click', () => {
  transactions = [];
  save();
  render();
  modalOverlay.classList.remove('open');
  showToast('🗑 All transactions cleared.');
});

// Close modal on overlay click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('open');
});

// ── Render 
function render() {
  renderSummary();
  renderList();
  renderBreakdown();
}

// ── Summary Cards & Budget Bar 
function renderSummary() {
  const income  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  document.getElementById('total-income').textContent  = fmt(income);
  document.getElementById('total-expense').textContent = fmt(expense);

  const balEl = document.getElementById('net-balance');
  balEl.textContent = (balance < 0 ? '-' : '') + fmt(balance);
  balEl.className = 'card-amount ' + (balance >= 0 ? 'positive' : 'negative');

  // Budget bar
  const fill  = document.getElementById('progress-fill');
  const hint  = document.getElementById('budget-hint');
  const label = document.getElementById('budget-used-label');

  if (budget > 0) {
    const pct = Math.min((expense / budget) * 100, 100);
    fill.style.width = pct + '%';
    fill.className   = 'progress-fill' + (pct >= 100 ? ' over' : pct >= 75 ? ' warn' : '');
    label.textContent = `${fmt(expense)} of KSh ${budget.toLocaleString('en-KE')} —`;
    const remaining = budget - expense;
    hint.textContent = remaining >= 0
      ? `KSh ${remaining.toLocaleString('en-KE', { minimumFractionDigits: 2 })} remaining (${pct.toFixed(0)}% used)`
      : `Over budget by KSh ${Math.abs(remaining).toLocaleString('en-KE', { minimumFractionDigits: 2 })}!`;
    hint.style.color = pct >= 100 ? 'var(--red)' : pct >= 75 ? 'var(--gold)' : 'var(--ink-dim)';
  } else {
    fill.style.width  = '0%';
    fill.className    = 'progress-fill';
    label.textContent = 'KSh 0 of';
    hint.textContent  = 'Set a monthly budget above to track progress';
    hint.style.color  = '';
  }
}

// ── Transaction List 
function renderList() {
  const typeF = filterType.value;
  const catF  = filterCat.value;

  const filtered = transactions.filter((t) => {
    if (typeF !== 'all' && t.type !== typeF) return false;
    if (catF  !== 'all' && t.cat  !== catF)  return false;
    return true;
  });

  const list = document.getElementById('transaction-list');

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📋</span>
        <p>${transactions.length === 0 ? 'No transactions yet.' : 'No results for this filter.'}</p>
        <p class="empty-sub">${transactions.length === 0 ? 'Add one using the form on the left.' : 'Try changing the filter above.'}</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map((t) => {
    const cat   = CATEGORIES[t.cat] || CATEGORIES.other;
    const dObj  = new Date(t.date + 'T00:00:00');
    const dFmt  = dObj.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
    const sign  = t.type === 'income' ? '+' : '-';
    return `
      <div class="txn-item">
        <div class="txn-emoji">${cat.emoji}</div>
        <div class="txn-main">
          <div class="txn-desc">${escHtml(t.desc)}</div>
          <div class="txn-meta">${cat.label} · ${dFmt}</div>
        </div>
        <span class="txn-amount ${t.type}">${sign}${fmt(t.amount)}</span>
        <button class="txn-delete" onclick="deleteTransaction('${t.id}')" title="Delete">✕</button>
      </div>`;
  }).join('');
}

// ── Category Breakdown 
function renderBreakdown() {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const total    = expenses.reduce((s, t) => s + t.amount, 0);

  // Group by category
  const groups = {};
  expenses.forEach((t) => {
    groups[t.cat] = (groups[t.cat] || 0) + t.amount;
  });

  const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const el     = document.getElementById('breakdown-list');

  if (sorted.length === 0) {
    el.innerHTML = '<p style="font-size:0.8rem;color:var(--ink-dim)">No expense data yet.</p>';
    return;
  }

  el.innerHTML = sorted.map(([cat, amt]) => {
    const info = CATEGORIES[cat] || CATEGORIES.other;
    const pct  = total > 0 ? (amt / total) * 100 : 0;
    return `
      <div class="breakdown-item">
        <span class="breakdown-cat">${info.emoji} ${info.label}</span>
        <div class="breakdown-bar-wrap">
          <div class="breakdown-bar" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <span class="breakdown-amt">${fmt(amt)}</span>
      </div>`;
  }).join('');
}

// ── XSS-safe HTML escape 
function escHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// ── Initial render 
render();

// fungsi.js

// Utility
function formatRupiah(num) {
  return "Rp " + num.toLocaleString("id-ID");
}

function toDate(str) {
  return new Date(str + "T00:00:00");
}

function sortByDate(a, b) {
  return toDate(a.date) - toDate(b.date);
}

function getRawTransactions() {
  if (window.kas && typeof window.kas.getAllTransactions === "function") {
    return window.kas.getAllTransactions();
  }
  console.warn("window.kas tidak tersedia, menggunakan array kosong.");
  return [];
}

// Compute running balance
function computeLedger(startingBalance = 0) {
  const raw = getRawTransactions();
  const sorted = raw.slice().sort(sortByDate);
  let balance = startingBalance;
  return sorted.map(tx => {
    if (tx.type === "income") balance += tx.amount;
    else balance -= tx.amount;
    return { ...tx, balanceAfter: balance };
  });
}

// Summary totals
function summary() {
  const raw = getRawTransactions();
  const income = raw
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = raw
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  return { income, expense, net };
}

// Render summary table (tanggal | masuk | keluar | saldo)
// Tanggal jadi link untuk filter history
let activeFilterDate = null; // "YYYY-MM-DD" string

function renderSummaryTable() {
  const ledger = computeLedger();
  const tbody = document.querySelector("#summary-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  ledger.forEach(row => {
    const tr = document.createElement("tr");

    // Tanggal (link)
    const dateTd = document.createElement("td");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = row.date;
    a.dataset.date = row.date;
    a.style.color = "var(--text)";
    a.style.textDecoration = "underline";
    a.addEventListener("click", e => {
      e.preventDefault();
      activeFilterDate = e.currentTarget.dataset.date;
      renderHistoryList(); // re-render history filtered
    });
    dateTd.appendChild(a);

    // Masuk
    const incomeTd = document.createElement("td");
    if (row.type === "income") {
      incomeTd.textContent = row.amount.toLocaleString("id-ID"); // tanpa "Rp"
      incomeTd.classList.add("income");
    } else {
      incomeTd.textContent = "-";
    }

    // Keluar
    const expenseTd = document.createElement("td");
    if (row.type === "expense") {
      expenseTd.textContent = row.amount.toLocaleString("id-ID"); // tanpa "Rp"
      expenseTd.classList.add("expense");
    } else {
      expenseTd.textContent = "-";
    }

    // Saldo
    const balanceTd = document.createElement("td");
    balanceTd.textContent = row.balanceAfter.toLocaleString("id-ID"); // tanpa "Rp"

    tr.append(dateTd, incomeTd, expenseTd, balanceTd);
    tbody.appendChild(tr);
  });

  // Totals row
  const sums = summary();
  const tfoot = document.querySelector("#summary-foot");
  if (!tfoot) return;
  tfoot.innerHTML = `
    <tr class="totals">
      <td><strong>Total</strong></td>
      <td class="income"><strong>${sums.income.toLocaleString("id-ID")}</strong></td>
      <td class="expense"><strong>${sums.expense.toLocaleString("id-ID")}</strong></td>
      <td><strong>${(sums.income - sums.expense).toLocaleString("id-ID")}</strong></td>
    </tr>
  `;
}

// Render history with detailed format and filter
function renderHistoryList() {
  const historyContainer = document.querySelector("#history");
  if (!historyContainer) return;
  historyContainer.innerHTML = "";

  const ledger = computeLedger();
  const filtered = activeFilterDate
    ? ledger.filter(tx => tx.date === activeFilterDate)
    : ledger;

  if (filtered.length === 0) {
    const msg = document.createElement("div");
    msg.style.opacity = "0.9";
    msg.style.padding = "12px";
    msg.style.borderRadius = "8px";
    msg.style.background = "rgba(255,255,255,0.05)";
    msg.textContent = activeFilterDate
      ? `Tidak ada transaksi di tanggal ${activeFilterDate}.`
      : "Belum ada transaksi.";
    historyContainer.appendChild(msg);
    return;
  }

  filtered.forEach(tx => {
    const wrapper = document.createElement("div");
    wrapper.className = "history-item";

    // Header line: tanggal - keterangan
    const header = document.createElement("div");
    header.style.marginBottom = "6px";
    header.innerHTML = `<strong>${tx.date}</strong> - ${tx.description}`;

    // Catatan
    const noteDiv = document.createElement("div");
    noteDiv.style.margin = "6px 0";
    noteDiv.textContent = tx.note || "-";

    // Detail block
    const detail = document.createElement("div");
    detail.className = "h-details";
    detail.innerHTML = `
      <div><strong>Tipe:</strong> ${tx.type === "income" ? "Pemasukan" : "Pengeluaran"}</div>
      <div><strong>Nominal:</strong> ${formatRupiah(tx.amount)}</div>
      <div><strong>Saldo setelah:</strong> ${formatRupiah(tx.balanceAfter)}</div>
    `;

    // Separator line
    const sep = document.createElement("hr");
    sep.style.border = "none";
    sep.style.height = "1px";
    sep.style.background = "rgba(255,255,255,0.08)";
    sep.style.margin = "10px 0";

    wrapper.append(header, noteDiv, detail, sep);
    historyContainer.appendChild(wrapper);
  });
}

// Clear filter button
function setupClearFilter() {
  const btn = document.getElementById("clearFilter");
  if (!btn) return;
  btn.addEventListener("click", e => {
    activeFilterDate = null;
    renderHistoryList();
  });
}

// Init UI
function initUI() {
  renderSummaryTable();
  renderHistoryList();
  setupClearFilter();
}

// Auto init
document.addEventListener("DOMContentLoaded", () => {
  initUI();
});
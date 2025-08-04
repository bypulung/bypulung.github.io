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

// Ambil transaksi dengan fallback
function getRawTransactions() {
  if (window.kas && typeof window.kas.getAllTransactions === "function") {
    return window.kas.getAllTransactions();
  }
  console.warn("window.kas tidak tersedia, menggunakan array kosong.");
  return [];
}

// Hitung ledger (running balance)
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

// Ringkasan
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

// Render tabel mendatar: keterangan | masuk | keluar | saldo
function renderSummaryTable() {
  const ledger = computeLedger();
  const tbody = document.querySelector("#summary-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  ledger.forEach(row => {
    const tr = document.createElement("tr");

    // Keterangan
    const desc = document.createElement("td");
    desc.textContent = row.description;

    // Masuk
    const incomeTd = document.createElement("td");
    if (row.type === "income") {
      incomeTd.textContent = formatRupiah(row.amount);
      incomeTd.classList.add("income");
    } else {
      incomeTd.textContent = "-";
    }

    // Keluar
    const expenseTd = document.createElement("td");
    if (row.type === "expense") {
      expenseTd.textContent = formatRupiah(row.amount);
      expenseTd.classList.add("expense");
    } else {
      expenseTd.textContent = "-";
    }

    // Saldo
    const balanceTd = document.createElement("td");
    balanceTd.textContent = formatRupiah(row.balanceAfter);

    tr.append(desc, incomeTd, expenseTd, balanceTd);
    tbody.appendChild(tr);
  });

  // Total
  const sums = summary();
  const tfoot = document.querySelector("#summary-foot");
  if (!tfoot) return;
  tfoot.innerHTML = `
    <tr class="totals">
      <td><strong>Total</strong></td>
      <td class="income"><strong>${formatRupiah(sums.income)}</strong></td>
      <td class="expense"><strong>${formatRupiah(sums.expense)}</strong></td>
      <td><strong>${formatRupiah(sums.net)}</strong></td>
    </tr>
  `;
}

// Render riwayat dengan detail termasuk catatan
function renderHistoryList() {
  const historyContainer = document.querySelector("#history");
  if (!historyContainer) return;
  historyContainer.innerHTML = "";
  const ledger = computeLedger();
  ledger.forEach(tx => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="h-row">
        <div><strong>${tx.date}</strong> — ${tx.description}</div>
        <div class="type ${tx.type}">${tx.type === "income" ? "Masuk" : "Keluar"}</div>
      </div>
      <div class="h-details">
        Tipe: ${tx.type === "income" ? "Pemasukan" : "Pengeluaran"} |
        Nominal: <strong>${formatRupiah(tx.amount)}</strong> |
        Saldo setelah: <strong>${formatRupiah(tx.balanceAfter)}</strong>
        ${tx.note ? `| Catatan: <em>${tx.note}</em>` : ""}
      </div>
    `;
    historyContainer.appendChild(div);
  });
}

function initUI() {
  renderSummaryTable();
  renderHistoryList();
}

// Inisialisasi setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  initUI();
});
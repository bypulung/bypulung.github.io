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

// Compute running balance (kronologis naik)
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

// Popup untuk transaksi pada tanggal tertentu
function showDatePopup(date, transactionsForDate, anchorElement) {
  // Hapus popup lama jika ada
  const existing = document.getElementById("datePopup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "datePopup";
  popup.className = "date-popup";

  const header = document.createElement("div");
  header.className = "popup-header";
  header.innerHTML = `<strong>${date}</strong> - Riwayat Transaksi <span class="close-btn">&times;</span>`;
  popup.appendChild(header);

  if (transactionsForDate.length === 0) {
    const empty = document.createElement("div");
    empty.className = "popup-empty";
    empty.textContent = `Tidak ada transaksi di tanggal ${date}.`;
    popup.appendChild(empty);
  } else {
    transactionsForDate.forEach(tx => {
      const item = document.createElement("div");
      item.className = "popup-item";
      item.innerHTML = `
        <div style="margin-bottom:6px;"><strong>${tx.date}</strong> - ${tx.description}</div>
        <div class="note" style="margin-bottom:8px;">${tx.note || "-"}</div>
        <div class="small-details" style="display:flex; gap:12px; flex-wrap:wrap; font-size:0.85rem; color: var(--muted);">
          <div><strong>Tipe:</strong> ${tx.type === "income" ? "Pemasukan" : "Pengeluaran"}</div>
          <div><strong>Nominal:</strong> ${formatRupiah(tx.amount)}</div>
          <div><strong>Saldo setelah:</strong> ${formatRupiah(tx.balanceAfter)}</div>
        </div>
        <hr />
      `;
      popup.appendChild(item);
    });
  }

  // close handler
  const closeBtn = header.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("click", () => {
      popup.remove();
    });
  }

  document.body.appendChild(popup);
  // position near anchor
  const rect = anchorElement.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 6;
  let left = rect.left + window.scrollX;
  // pastikan tidak overflow kanan
  const popupRect = popup.getBoundingClientRect();
  if (left + popupRect.width > window.innerWidth - 10) {
    left = window.innerWidth - popupRect.width - 10;
  }
  popup.style.position = "absolute";
  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
}

// Render summary table (tanggal | masuk | keluar | saldo)
function renderSummaryTable() {
  const ledger = computeLedger();
  const tbody = document.querySelector("#summary-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  ledger.forEach(row => {
    const tr = document.createElement("tr");

    // Tanggal (klik memunculkan popup)
    const dateTd = document.createElement("td");
    const span = document.createElement("span");
    span.textContent = row.date;
    span.className = "clickable-date";
    span.style.cursor = "pointer";
    span.style.textDecoration = "underline";
    span.addEventListener("click", e => {
      const ledgerFull = computeLedger();
      const sameDate = ledgerFull.filter(tx => tx.date === row.date);
      showDatePopup(row.date, sameDate, span);
    });
    dateTd.appendChild(span);

    // Masuk
    const incomeTd = document.createElement("td");
    if (row.type === "income") {
      incomeTd.textContent = row.amount.toLocaleString("id-ID"); // tanpa Rp
      incomeTd.classList.add("income");
    } else {
      incomeTd.textContent = "-";
    }

    // Keluar
    const expenseTd = document.createElement("td");
    if (row.type === "expense") {
      expenseTd.textContent = row.amount.toLocaleString("id-ID");
      expenseTd.classList.add("expense");
    } else {
      expenseTd.textContent = "-";
    }

    // Saldo
    const balanceTd = document.createElement("td");
    balanceTd.textContent = row.balanceAfter.toLocaleString("id-ID");

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

// Render full history (terbaru dulu)
function renderHistoryList() {
  const historyContainer = document.querySelector("#history");
  if (!historyContainer) return;
  historyContainer.innerHTML = "";

  const ledger = computeLedger();
  if (ledger.length === 0) {
    const msg = document.createElement("div");
    msg.style.opacity = "0.9";
    msg.style.padding = "12px";
    msg.style.borderRadius = "8px";
    msg.style.background = "rgba(255,255,255,0.05)";
    msg.textContent = "Belum ada transaksi.";
    historyContainer.appendChild(msg);
    return;
  }

  // tampilkan dari terbaru: reverse tanpa mengubah original
  const reversed = ledger.slice().reverse();

  reversed.forEach(tx => {
    const wrapper = document.createElement("div");
    wrapper.className = "history-item";

    // Header line: tanggal - keterangan
    const header = document.createElement("div");
    header.style.marginBottom = "6px";
    header.innerHTML = `<strong>${tx.date}</strong> - ${tx.description}`;

    // Catatan
    const noteDiv = document.createElement("div");
    noteDiv.className = "note";
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

// Init UI
function initUI() {
  renderSummaryTable();
  renderHistoryList();
}

// Auto init
document.addEventListener("DOMContentLoaded", () => {
  initUI();
});
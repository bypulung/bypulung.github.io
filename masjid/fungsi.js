// Tombol chat WhatsApp 
const admins = {
  bendahara: {
    name: "Pulung Riswanto",
    img: "/risma/img/pulung.png",
    number: "6288971344131"
  },
  ketua: {
    name: "Nurman Wibowo",
    img: "/risma/img/nurman.jpg",
    number: "6282373877424"
  },
  wakil: {
    name: "Suhdi Efendi",
    img: "/risma/img/suhdi.jpg",
    number: "6283811530676"
  }
};

function toggleForm() {
  const form = document.getElementById('formPopup');
  const bantuan = document.getElementById('bantuanPopup');

  if (form.style.display === 'block') {
    form.style.display = 'none';
    bantuan.style.display = 'flex';
  } else {
    form.style.display = 'block';
    bantuan.style.display = 'none';
    updateProfile(); // refresh admin info
  }
}

function closeForm() {
  document.getElementById('formPopup').style.display = 'none';
  document.getElementById('bantuanPopup').style.display = 'flex';
}

function updateProfile() {
  const selected = document.getElementById('adminSelect').value;
  const data = admins[selected];

  document.getElementById('adminName').textContent = data.name;
  document.getElementById('adminImg').src = data.img;
  document.getElementById('bantuanImg').src = data.img;
}

function sendWA() {
  const selected = document.getElementById('adminSelect').value;
  const msg = document.getElementById('message').value.trim();

  if (msg === "") {
    alert("Silakan isi pesan dulu ges.");
    return;
  }

  const phone = admins[selected].number;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}


// API sederhana untuk arus kas
function addTransaction({ date, description, type, amount }) {
  if (!date || !description || !["income", "expense"].includes(type) || typeof amount !== "number") {
    throw new Error("Format transaksi tidak valid");
  }
  transactions.push({ date, description, type, amount });
}

function getAllTransactions() {
  // return shallow copy
  return transactions.slice();
}

if (typeof window !== "undefined") {
  // expose untuk fungsi.js atau UI
  window.kas = {
    addTransaction,
    getAllTransactions,
    raw: transactions, // untuk debugging/inspeksi
  };
}

module.exports = {
  addTransaction,
  getAllTransactions,
  transactions, // untuk penggunaan di Node if needed
};


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

// Ambil transaksi dari kas.js (global window.kas)
function computeLedger(startingBalance = 0) {
  const raw = window.kas.getAllTransactions();
  const sorted = raw.slice().sort(sortByDate);
  let balance = startingBalance;
  return sorted.map(tx => {
    if (tx.type === "income") balance += tx.amount;
    else balance -= tx.amount;
    return { ...tx, balanceAfter: balance };
  });
}

function summary() {
  const raw = window.kas.getAllTransactions();
  const income = raw
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = raw
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  return { income, expense, net };
}

// Rendering
function renderSummaryTable() {
  const ledger = computeLedger();
  const tbody = document.querySelector("#summary-body");
  tbody.innerHTML = "";

  ledger.forEach(row => {
    const tr = document.createElement("tr");
    const desc = document.createElement("td");
    desc.textContent = row.description;
    const incomeTd = document.createElement("td");
    const expenseTd = document.createElement("td");
    if (row.type === "income") {
      incomeTd.textContent = formatRupiah(row.amount);
      incomeTd.classList.add("income");
      expenseTd.textContent = "-";
    } else {
      incomeTd.textContent = "-";
      expenseTd.textContent = formatRupiah(row.amount);
      expenseTd.classList.add("expense");
    }
    const balanceTd = document.createElement("td");
    balanceTd.textContent = formatRupiah(row.balanceAfter);

    tr.append(desc, incomeTd, expenseTd, balanceTd);
    tbody.appendChild(tr);
  });

  const sums = summary();
  const tfoot = document.querySelector("#summary-foot");
  tfoot.innerHTML = `
    <tr class="totals">
      <td><strong>Total</strong></td>
      <td class="income"><strong>${formatRupiah(sums.income)}</strong></td>
      <td class="expense"><strong>${formatRupiah(sums.expense)}</strong></td>
      <td><strong>${formatRupiah(sums.net)}</strong></td>
    </tr>
  `;
}

function renderHistoryList() {
  const historyContainer = document.querySelector("#history");
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
        Tipe: ${tx.type === "income" ? "Pemasukan" : "Pengeluaran"} | Nominal: <strong>${formatRupiah(tx.amount)}</strong> | Saldo setelah: <strong>${formatRupiah(tx.balanceAfter)}</strong>
      </div>
    `;
    historyContainer.appendChild(div);
  });
}

function initUI() {
  renderSummaryTable();
  renderHistoryList();
}

// Auto-init setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  if (!window.kas) {
    console.warn("kas.js belum dimuat, data tidak tersedia.");
    return;
  }
  initUI();
}
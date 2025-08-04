// kas.js

// Data transaksi (arus kas) — bisa diganti nanti dengan persistence
const transactions = [
  {
    date: "2025-08-01",
    description: "Saldo Awal",
    type: "income", // "income" atau "expense"
    amount: 5000000,
  },
  {
    date: "2025-08-01",
    description: "Infak Jumat",
    type: "income",
    amount: 850000,
  },
  {
    date: "2025-08-04",
    description: "Bayar Listrik",
    type: "expense",
    amount: 250000,
  },
  {
    date: "2025-08-07",
    description: "Konsumsi Pengajian",
    type: "expense",
    amount: 150000,
  },
];


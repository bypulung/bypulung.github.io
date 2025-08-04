// kas.js
// Penyimpanan data arus kas sederhana di browser

// Data awal (contoh)
const transactions = [
  { date: "2025-08-01", description: "Setoran awal kas", type: "income", amount: 500000 },
  { date: "2025-08-02", description: "Pembelian bola voli", type: "expense", amount: 150000 },
  { date: "2025-08-03", description: "Iuran anggota", type: "income", amount: 200000 },
  { date: "2025-08-04", description: "Beli air minum", type: "expense", amount: 50000 },
];

// Fungsi untuk menambah transaksi
function addTransaction({ date, description, type, amount }) {
  if (!date || !description || !["income", "expense"].includes(type) || typeof amount !== "number") {
    throw new Error("Format transaksi tidak valid");
  }
  transactions.push({ date, description, type, amount });
}

// Fungsi untuk mengambil semua transaksi
function getAllTransactions() {
  return transactions.slice(); // salinan agar data asli tidak langsung diubah
}

// Expose ke global (supaya fungsi.js bisa memanggil)
if (typeof window !== "undefined") {
  window.kas = {
    addTransaction,
    getAllTransactions,
    raw: transactions // untuk debugging di console
  };
}
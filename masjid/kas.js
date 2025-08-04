// kas.js
// Penyimpanan data arus kas sederhana di browser, sekarang dengan field "note"

// Data awal (contoh)
const transactions = [
  {
    date: "2025-08-01",
    description: "Setoran awal kas",
    type: "income",
    amount: 500000,
    note: "Kas awal untuk operasional bulan Agustus"
  },
  {
    date: "2025-08-02",
    description: "Pembelian bola voli",
    type: "expense",
    amount: 150000,
    note: "Untuk kegiatan pemuda minggu ini"
  },
  {
    date: "2025-08-03",
    description: "Iuran anggota",
    type: "income",
    amount: 200000,
    note: "Iuran bulanan 10 anggota"
  },
  {
    date: "2025-08-04",
    description: "Beli air minum",
    type: "expense",
    amount: 50000,
    note: "Konsumsi pengajian malam"
  },
];

// Tambah transaksi (dengan catatan opsional)
function addTransaction({ date, description, type, amount, note = "" }) {
  if (!date || !description || !["income", "expense"].includes(type) || typeof amount !== "number") {
    throw new Error("Format transaksi tidak valid");
  }
  transactions.push({ date, description, type, amount, note });
}

// Ambil semua transaksi
function getAllTransactions() {
  return transactions.slice(); // salinan agar tidak terubah langsung
}

// Expose ke global supaya fungsi.js bisa menggunakannya
if (typeof window !== "undefined") {
  window.kas = {
    addTransaction,
    getAllTransactions,
    raw: transactions // untuk inspeksi di console
  };
}
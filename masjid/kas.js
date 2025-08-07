// kas.js
// Penyimpanan data arus kas per tahun Hijriah

const kasData = {

"1448H": [
{
date: "2026/08/07",
description: "Infak jumat",
type: "pemasukan",
amount: 200000,
note: "Infak jumat selama 1 bulan"
},
{
date: "2026/09/04",
description: "Infak jumat",
type: "pemasukan",
amount: 500000,
note: "Infak jumat selama 1 bulan"
},
{
date: "2026/08/20",
description: "Syukuran",
type: "pengeluaran",
amount: 300000,
note: "Syukuran bersama satu dusun Tanjung bulan"
},
],

  "1447H": [
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
    }
  ]
};

// Fungsi bantu: Mengubah tanggal ke tahun Hijriah (menggunakan Intl API)
function getHijriYear(dateStr) {
  const date = new Date(dateStr);
  const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    year: "numeric"
  }).format(date);
  return `${hijriDate}H`;
}

// Tambah transaksi ke tahun Hijriah yang sesuai
function addTransaction({ date, description, type, amount, note = "" }) {
  if (!date || !description || !["income", "expense"].includes(type) || typeof amount !== "number") {
    throw new Error("Format transaksi tidak valid");
  }

  const hijriYear = getHijriYear(date);

  if (!kasData[hijriYear]) {
    kasData[hijriYear] = [];
  }

  kasData[hijriYear].push({ date, description, type, amount, note });
}

// Ambil semua transaksi dari seluruh tahun
function getAllTransactions() {
  return Object.values(kasData).flat(); // Gabungkan semua array tahun
}

// Ekspor untuk digunakan di fungsi lain
if (typeof window !== "undefined") {
  window.kas = {
    addTransaction,
    getAllTransactions,
    raw: kasData
  };
    }

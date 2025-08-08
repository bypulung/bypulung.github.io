// kas.js
// Penyimpanan data arus kas per tahun Hijriah

const kasData = {
"1447H": [
    {
date: "2025/08/08",
description: "Panen jagung",
type: "income",
amount: 4000000,
note: "Untung bersih ±7.300.000 dibagi 2 dengan pengelola lahan, pengelola membulatkan 4.000.000 untuk kas masjid (detailnya tanyakan kepada BPK. Nurman)."
},
{
date: "2025/08/08",
description: "Sisa Infak Jumat",
type: "income",
amount: 825000,
note: "Sisa uang infak dan sumbangan warga yang di pegang oleh bapak Suhdi selaku bendahara lama."
},
{
date: "2025/08/08",
description: "Pasang kaca",
type: "expense",
amount: 3000000,
note: "Pemesanan pasang kaca kepada mas SAKIP tanjung sari 2"
},
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

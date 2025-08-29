// main.js
// Jadwal: 31 Agustus - 2 September 2025, Grup A & Grup B

const matches = [
  // 31 Agustus 2025
  { home: "Tanjung Sari 1 B", away: "Tanjung Bulan A", setHome: 0, setAway: 0 },
  { home: "Tanjung Sari 2A", away: "Tanjung Bulan B", setHome: 0, setAway: 0 },

  // 1 September 2025
  { home: "Tanjung Bulan A", away: "Tanjung Sari 2B", setHome: 0, setAway: 0 },
  { home: "Tanjung Bulan B", away: "Tanjung Sari 1A", setHome: 0, setAway: 0 },

  // 2 September 2025
  { home: "Tanjung Sari 1 B", away: "Tanjung Sari 2B", setHome: 0, setAway: 0 },
  { home: "Tanjung Sari 2A", away: "Tanjung Sari 1A", setHome: 0, setAway: 0 }
];

// Kalau nanti ingin menambahkan skor, tinggal isi properti setHome dan setAway
// contoh: { home: "Tanjung Bulan A", away: "Tanjung Sari 2B", setHome: 2, setAway: 1 }

window.matches = matches;
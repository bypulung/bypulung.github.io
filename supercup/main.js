// main.js
// Jadwal: 31 Agustus - 2 September 2025, 2 pertandingan per hari (Grup A & B)
const matches = [
  // 31 Agustus 2025
  { home: "Tanjung Sari 1B", away: "Tanjung Sari 1A" },
  { home: "Tanjung Bulan A", away: "Tanjung Bulan B" },

  // 1 September 2025
  { home: "Tanjung Sari 2B", away: "Tanjung Sari 2A" },
  { home: "Tanjung Sari 1B", away: "Tanjung Bulan A" },

  // 2 September 2025
  { home: "Tanjung Sari 1A", away: "Tanjung Bulan B" },
  { home: "Tanjung Bulan A", away: "Tanjung Sari 2B" }
];

// Kalau nanti ingin menambahkan skor, tambahkan properti setHome dan setAway:
// contoh: { home: "Tanjung Bulan A", away: "Tanjung Sari 1A", setHome: 2, setAway: 1 }

window.matches = matches;
// main.js
// Jadwal: 30 Agustus - 1 September 2025, 2 pertandingan per hari (Grup A & B)
const matches = [
  // 30 Agustus 2025
  { home: "Tanjung Bulan A", away: "Tanjung Sari 1A" },
  { home: "Tanjung Bulan B", away: "Tanjung Sari 1B" },

  // 31 Agustus 2025
  { home: "Tanjung Bulan A", away: "Tanjung Sari 2A" },
  { home: "Tanjung Bulan B", away: "Tanjung Sari 2B" },

  // 1 September 2025
  { home: "Tanjung Sari 1A", away: "Tanjung Sari 2A" },
  { home: "Tanjung Sari 1B", away: "Tanjung Sari 2B" }
];

// Kalau nanti ingin menambahkan skor, tambahkan properti setHome dan setAway:
// contoh: { home: "Tanjung Bulan A", away: "Tanjung Sari 1A", setHome: 2, setAway: 1 }

window.matches = matches;
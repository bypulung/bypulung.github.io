// main.js
// Jadwal: 8-10 Agustus 2025, pairing tiap hari sekali (tanpa hasil awal)
const matches = [
  // 8 Agustus: Banteng Gaspol vs Merdeka Ngacir, Patriot Ngamuk vs Pejuang Santuy
  { home: "Banteng Gaspol", away: "Merdeka Ngacir" },
  { home: "Patriot Ngamuk", away: "Pejuang Santuy" },

  // 9 Agustus: Banteng Gaspol vs Patriot Ngamuk, Merdeka Ngacir vs Pejuang Santuy
  { home: "Banteng Gaspol", away: "Patriot Ngamuk" },
  { home: "Merdeka Ngacir", away: "Pejuang Santuy" },

  // 10 Agustus: Banteng Gaspol vs Pejuang Santuy, Merdeka Ngacir vs Patriot Ngamuk
  { home: "Banteng Gaspol", away: "Pejuang Santuy" },
  { home: "Merdeka Ngacir", away: "Patriot Ngamuk" }
];

// Kalau nanti ingin menambahkan skor, tambahkan properti setHome dan setAway:
// contoh: { home: "Banteng Gaspol", away: "Merdeka Ngacir", setHome: , setAway:  }

window.matches = matches;
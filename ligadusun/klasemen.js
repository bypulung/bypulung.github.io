// Mengasumsikan ada variabel global `matches` dari main.js
// dan variabel global `teams` dari tim.js, misal: 
// teams = [{ nama: "Tim A", pemain: ["A1","A2"] }, { nama: "Tim B", pemain: ["B1","B2"] }];

(function () {
  // Ambil daftar tim dari tim.js
  const klasemen = {};

  if (typeof teams === "undefined" || !Array.isArray(teams)) {
    console.warn("`teams` tidak ditemukan atau bukan array. Akan membangun klasemen hanya dari `matches` jika ada.");
  } else {
    // Inisialisasi klasemen dari teams, termasuk pemain di metadata (dipakai sebagai tooltip)
    teams.forEach(t => {
      const namaTim = t.nama || t.name || "";
      if (!namaTim) return;
      klasemen[namaTim] = {
        nama: namaTim,
        main: 0,
        menang: 0,
        kalah: 0,
        setMenang: 0,
        setKalah: 0,
        poin: 0,
        pemain: Array.isArray(t.pemain) ? t.pemain.slice() : [] // simpan pemain sebagai referensi
      };
    });
  }

  // Jika matches valid, proses hasilnya
  if (typeof matches === "undefined" || !Array.isArray(matches)) {
    console.warn("`matches` tidak ditemukan atau bukan array. Menampilkan klasemen awal (tanpa hasil pertandingan).");
  } else {
    matches.forEach(match => {
      const { home, away, setHome, setAway } = match;

      // Inisialisasi tim jika belum ada (fallback jika tidak ada di teams)
      [home, away].forEach(tim => {
        if (!klasemen[tim]) {
          klasemen[tim] = {
            nama: tim,
            main: 0,
            menang: 0,
            kalah: 0,
            setMenang: 0,
            setKalah: 0,
            poin: 0,
            pemain: [] // tidak ada data pemain
          };
        }
      });

      // Update jumlah pertandingan
      klasemen[home].main++;
      klasemen[away].main++;

      // Update set menang/kalah
      klasemen[home].setMenang += setHome;
      klasemen[home].setKalah += setAway;

      klasemen[away].setMenang += setAway;
      klasemen[away].setKalah += setHome;

      // Hitung hasil dan poin
      if (setHome > setAway) {
        klasemen[home].menang++;
        klasemen[away].kalah++;

        if (setHome === 2 && setAway === 0) {
          klasemen[home].poin += 3;
        } else if (setHome === 2 && setAway === 1) {
          klasemen[home].poin += 2;
          klasemen[away].poin += 1;
        }
      } else if (setAway > setHome) {
        klasemen[away].menang++;
        klasemen[home].kalah++;

        if (setAway === 2 && setHome === 0) {
          klasemen[away].poin += 3;
        } else if (setAway === 2 && setHome === 1) {
          klasemen[away].poin += 2;
          klasemen[home].poin += 1;
        }
      }
    });
  }

  // Urutkan: poin, lalu selisih set
  const tabel = Object.values(klasemen).sort((a, b) => {
    if (b.poin !== a.poin) return b.poin - a.poin;
    const diffA = a.setMenang - a.setKalah;
    const diffB = b.setMenang - b.setKalah;
    return diffB - diffA;
  });

  const tbody = document.getElementById("klasemen-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  tabel.forEach((tim, i) => {
    const tr = document.createElement("tr");

    // Buat tooltip pemain jika ada
    let pemainTooltip = "";
    if (Array.isArray(tim.pemain) && tim.pemain.length) {
      pemainTooltip = ` title="Pemain: ${tim.pemain.join(", ")}"`;
    }

    tr.innerHTML = `
      <td data-label="No">${i + 1}</td>
      <td data-label="Tim"${pemainTooltip}>${tim.nama}</td>
      <td data-label="Main">${tim.main}</td>
      <td data-label="M">${tim.menang}</td>
      <td data-label="K">${tim.kalah}</td>
      <td data-label="Set">${tim.setMenang}-${tim.setKalah}</td>
      <td data-label="Poin">${tim.poin}</td>
    `;
    tbody.appendChild(tr);
  });
})();
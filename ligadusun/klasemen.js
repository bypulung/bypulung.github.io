// diasumsikan ada global: `teams` dari tim.js dan `matches` dari main.js
(function () {
  const MAX_WAIT = 5; // coba sampai 5 kali
  const INTERVAL_MS = 200; // tiap 200ms

  function buildKlasemen() {
    const klasemen = {};

    // Inisialisasi dari teams jika ada
    if (typeof teams === "undefined" || !Array.isArray(teams)) {
      console.warn("`teams` tidak ditemukan atau bukan array. Akan membangun klasemen hanya dari `matches` jika ada.");
    } else {
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
          pemain: Array.isArray(t.pemain) ? t.pemain.slice() : []
        };
      });
    }

    // Proses matches jika ada
    if (typeof matches === "undefined" || !Array.isArray(matches)) {
      console.warn("`matches` tidak ditemukan atau bukan array. Menampilkan klasemen awal (tanpa hasil pertandingan).");
    } else {
      matches.forEach(match => {
        const { home, away, setHome = 0, setAway = 0 } = match;

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
              pemain: []
            };
          }
        });

        // Update
        klasemen[home].main++;
        klasemen[away].main++;

        klasemen[home].setMenang += setHome;
        klasemen[home].setKalah += setAway;

        klasemen[away].setMenang += setAway;
        klasemen[away].setKalah += setHome;

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

    // Sortir
    const tabel = Object.values(klasemen).sort((a, b) => {
      if (b.poin !== a.poin) return b.poin - a.poin;
      const diffA = a.setMenang - a.setKalah;
      const diffB = b.setMenang - b.setKalah;
      return diffB - diffA;
    });

    const tbody = document.getElementById("klasemen-body");
    if (!tbody) {
      console.warn("Elemen #klasemen-body tidak ditemukan.");
      return;
    }
    tbody.innerHTML = "";

    tabel.forEach((tim, i) => {
      const tr = document.createElement("tr");
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
  }

  // Ekspor fungsi supaya bisa dipanggil ulang (misal setelah matches di-update)
  window.refreshKlasemen = buildKlasemen;

  // Tunggu DOM dan teams jika perlu
  function tryInit(attempt = 1) {
    if (!document.getElementById("klasemen-body")) {
      if (attempt <= MAX_WAIT) {
        setTimeout(() => tryInit(attempt + 1), INTERVAL_MS);
      } else {
        console.warn("Gagal menemukan #klasemen-body setelah beberapa kali coba.");
      }
      return;
    }
    // Jika teams belum ada, tetap panggil; buildKlasemen menangani absennya
    buildKlasemen();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => tryInit());
  } else {
    tryInit();
  }
})();
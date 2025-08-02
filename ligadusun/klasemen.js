// diasumsikan ada global: `teams` dari tim.js dan `matches` dari main.js
(function () {
  const MAX_WAIT = 5; // coba sampai 5 kali
  const INTERVAL_MS = 200; // tiap 200ms

  function computeKlasemen(teamsList, matchesList) {
    const klasemen = {};

    // Inisialisasi dari teams
    if (Array.isArray(teamsList)) {
      teamsList.forEach(t => {
        const namaTim = t.nama || t.name;
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

    // Proses matches
    if (Array.isArray(matchesList)) {
      matchesList.forEach(match => {
        const { home, away, setHome = null, setAway = null } = match;

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

        if (typeof setHome === "number" && typeof setAway === "number") {
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
        }
      });
    }

    // Sortir: poin, lalu selisih set
    return Object.values(klasemen).sort((a, b) => {
      if (b.poin !== a.poin) return b.poin - a.poin;
      const diffA = a.setMenang - a.setKalah;
      const diffB = b.setMenang - b.setKalah;
      return diffB - diffA;
    });
  }

  function renderKlasemen() {
    const tabel = computeKlasemen(typeof teams !== "undefined" ? teams : [], typeof matches !== "undefined" ? matches : []);
    const tbody = document.getElementById("klasemen-body");
    if (!tbody) return;
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

  function renderJadwal() {
    const tbody = document.getElementById("jadwal-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!Array.isArray(matches) || !matches.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5">Belum ada jadwal.</td>`;
      tbody.appendChild(tr);
      return;
    }

    matches.forEach((m, idx) => {
      const { home, away, setHome, setAway } = m;
      const tr = document.createElement("tr");
      let hasilText = "-";
      let status = "";

      if (typeof setHome === "number" && typeof setAway === "number") {
        hasilText = `${setHome} - ${setAway}`;
        if (setHome > setAway) {
          status = `<span class="win">${home} menang</span>`;
        } else if (setAway > setHome) {
          status = `<span class="win">${away} menang</span>`;
        } else {
          status = `Seri`;
        }
      } else {
        status = `<span class="upcoming">Belum dimainkan</span>`;
      }

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${home}</td>
        <td>${away}</td>
        <td>${hasilText}</td>
        <td>${status}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderRoster() {
    const container = document.getElementById("roster-container");
    if (!container) return;
    container.innerHTML = "";
    if (!Array.isArray(teams) || !teams.length) {
      container.textContent = "Tidak ada data tim.";
      return;
    }

    teams.forEach(t => {
      const div = document.createElement("div");
      div.className = "team-roster";
      div.innerHTML = `
        <strong>${t.nama}</strong>
        <div class="small">Pemain: ${Array.isArray(t.pemain) ? t.pemain.join(", ") : "-"}</div>
      `;
      container.appendChild(div);
    });
  }

  function refreshAll() {
    renderRoster();
    renderJadwal();
    renderKlasemen();
  }

  // Ekspor fungsi supaya bisa dipanggil ulang (misal setelah matches di-update)
  window.refreshKlasemen = renderKlasemen;
  window.refreshAll = refreshAll;

  // Tunggu DOM dan elemen target
  function tryInit(attempt = 1) {
    const hasKlasemen = !!document.getElementById("klasemen-body");
    const hasJadwal = !!document.getElementById("jadwal-body");
    const hasRoster = !!document.getElementById("roster-container");

    if (!hasKlasemen || !hasJadwal || !hasRoster) {
      if (attempt <= MAX_WAIT) {
        setTimeout(() => tryInit(attempt + 1), INTERVAL_MS);
      } else {
        console.warn("Gagal menemukan elemen target (klasemen/jadwal/roster) setelah beberapa kali coba.");
      }
      return;
    }

    // Init render
    refreshAll();

    // Jika ada tombol refresh global
    document.getElementById("btn-refresh")?.addEventListener("click", refreshAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => tryInit());
  } else {
    tryInit();
  }
})();



// schedule.js
// Mengasumsikan global `teams` ada (dari tim.js)
// Jadwal: 3 hari 8-10 Agustus 2025, tiap tim sekali per hari,
// pasangan fixed agar tidak bentrok: 
// Hari1: A vs B, C vs D
// Hari2: A vs C, B vs D
// Hari3: A vs D, B vs C
// Waktu per hari: 15:30 dan 16:30

(function () {
  function formatDate(date) {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function buildSchedule() {
    if (!Array.isArray(teams) || teams.length < 4) {
      console.warn("`teams` harus array dengan minimal 4 tim."); 
      return [];
    }

    // Ambil nama tim pertama 4 (jika lebih diabaikan)
    const [t0, t1, t2, t3] = teams.map(t => t.nama || t.name);

    const dailyMatchups = [
      [{ home: t0, away: t1 }, { home: t2, away: t3 }], // 8 Aug
      [{ home: t0, away: t2 }, { home: t1, away: t3 }], // 9 Aug
      [{ home: t0, away: t3 }, { home: t1, away: t2 }]  //10 Aug
    ];

    const timeSlots = ["15:30", "16:30"];
    const baseDates = [
      new Date("2025-08-08"),
      new Date("2025-08-09"),
      new Date("2025-08-10")
    ];

    const schedule = [];

    for (let day = 0; day < 3; day++) {
      for (let m = 0; m < 2; m++) {
        const matchup = dailyMatchups[day][m];
        const [hour, minute] = timeSlots[m].split(":").map(Number);
        const dt = new Date(baseDates[day]);
        dt.setHours(hour, minute, 0, 0);
        schedule.push({
          dateObj: dt,
          date: formatDate(dt),
          time: timeSlots[m],
          home: matchup.home,
          away: matchup.away,
          played: false,
          result: null // nanti bisa diisi { home: x, away: y }
        });
      }
    }

    return schedule;
  }

  function renderSchedule(schedule) {
    const container = document.getElementById("schedule-container");
    if (!container) return;
    container.innerHTML = "";

    if (!Array.isArray(schedule) || !schedule.length) {
      container.textContent = "Gagal membangun jadwal. Pastikan `teams` valid (minimal 4).";
      return;
    }

    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>#</th><th>Tanggal</th><th>Waktu</th><th>Home</th><th>Away</th><th>Hasil</th><th>Status</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");

    schedule.forEach((match, i) => {
      const tr = document.createElement("tr");
      const hasil = match.played && match.result
        ? `${match.result.home} - ${match.result.away}`
        : "-";
      const status = match.played ? "Selesai" : "Belum dimainkan";
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${match.date}</td>
        <td>${match.time}</td>
        <td>${match.home}</td>
        <td>${match.away}</td>
        <td>${hasil}</td>
        <td>${status}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Ekspos untuk referensi eksternal
  window.buildSchedule = buildSchedule;
  window.renderSchedule = renderSchedule;

  // Inisialisasi otomatis saat DOM siap
  function init() {
    const schedule = buildSchedule();
    renderSchedule(schedule);
    // simpan untuk penggunaan lain
    window.currentSchedule = schedule;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
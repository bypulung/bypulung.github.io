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
      let homeClass = "";
      let awayClass = "";

      if (typeof setHome === "number" && typeof setAway === "number") {
        hasilText = `${setHome} - ${setAway}`;
        if (setHome > setAway) {
          status = `<span class="win">${home} menang</span>`;
          homeClass = "winner";
          awayClass = "loser";
        } else if (setAway > setHome) {
          status = `<span class="win">${away} menang</span>`;
          awayClass = "winner";
          homeClass = "loser";
        } else {
          status = `Seri`;
        }
      } else {
        status = `<span class="upcoming">Belum dimainkan</span>`;
      }

      tr.innerHTML = `
        <td data-label="No">${idx + 1}</td>
        <td data-label="Home"><span class="team-name ${homeClass}">${home}</span></td>
        <td data-label="Away"><span class="team-name ${awayClass}">${away}</span></td>
        <td data-label="Hasil">${hasilText}</td>
        <td data-label="Status">${status}</td>
      `;
      tbody.appendChild(tr);
    });
  }


  function renderRoster() {
    const container = document.getElementById("roster-container");
    if (!container) return;
    container.innerHTML = "";

    const listTeams = Array.isArray(teams) ? teams : [];
    if (!listTeams.length) {
      container.innerHTML = `<div class="no-players">Tidak ada data tim.</div>`;
      return;
    }

    listTeams.forEach(team => {
      const name = team.nama || team.name || "Unnamed Team";
      const players = Array.isArray(team.pemain) ? team.pemain : [];

      const card = document.createElement("div");
      card.className = "team-card";

      const header = document.createElement("div");
      header.className = "team-header";
      header.innerHTML = `
        <h3 class="team-name-title">${name}</h3>
        <div class="player-count">${players.length} Pemain</div>
      `;

      const listWrapper = document.createElement("ul");
      listWrapper.className = "player-list";
      if (players.length) {
        players.forEach(p => {
          const li = document.createElement("li");
          li.innerHTML = `<div class="player-bullet"></div><div>${p}</div>`;
          listWrapper.appendChild(li);
        });
      } else {
        const no = document.createElement("div");
        no.className = "no-players";
        no.textContent = "Belum ada pemain.";
        listWrapper.appendChild(no);
      }

      const meta = document.createElement("div");
      meta.className = "team-meta";
      meta.textContent = " ";

      card.appendChild(header);
      card.appendChild(listWrapper);
      card.appendChild(meta);
      container.appendChild(card);
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



// non-table schedule render, mengambil teams dari tim.js dan hasil dari main.js
(function () {
  // fallback globals
  if (!Array.isArray(window.teams)) window.teams = [];
  if (!Array.isArray(window.matches)) window.matches = [];

  const teamNames = Array.isArray(window.teams)
    ? window.teams.map(t => t.nama || t.name).filter(Boolean).slice(0, 4)
    : ["Tim A", "Tim B", "Tim C", "Tim D"];

  const dailyMatchups = [
    [{ home: teamNames[0], away: teamNames[1] }, { home: teamNames[2], away: teamNames[3] }],
    [{ home: teamNames[0], away: teamNames[2] }, { home: teamNames[1], away: teamNames[3] }],
    [{ home: teamNames[0], away: teamNames[3] }, { home: teamNames[1], away: teamNames[2] }]
  ];

  const dates = [
    new Date("2025-08-08"),
    new Date("2025-08-09"),
    new Date("2025-08-10")
  ];
  const times = ["15:30", "16:30"];

  function findMatch(home, away) {
    if (!Array.isArray(window.matches)) return null;
    return window.matches.find(m =>
      (m.home === home && m.away === away) || (m.home === away && m.away === home)
    ) || null;
  }

  function fmtDate(d) {
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function buildSchedule() {
    return dates.map((day, di) => {
      const matches = dailyMatchups[di].map((pair, mi) => {
        const [hh, mm] = times[mi].split(":").map(Number);
        const dt = new Date(day);
        dt.setHours(hh, mm, 0, 0);

        const record = findMatch(pair.home, pair.away);
        let played = false;
        let result = null;
        if (record && typeof record.setHome === "number" && typeof record.setAway === "number") {
          played = true;
          if (record.home === pair.home && record.away === pair.away) {
            result = { home: record.setHome, away: record.setAway };
          } else {
            result = { home: record.setAway, away: record.setHome };
          }
        }

        return {
          dateObj: dt,
          time: times[mi],
          home: pair.home,
          away: pair.away,
          played,
          result
        };
      });
      return { day, matches };
    });
  }

  function renderScheduleCards() {
    const wrapper = document.getElementById("schedule-wrapper");
    if (!wrapper) return;
    wrapper.innerHTML = "";

    const schedule = buildSchedule();
    schedule.forEach(block => {
      const dayName = block.day.toLocaleDateString("id-ID", { weekday: "long" });
      const dateShort = block.day.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

      const dayCard = document.createElement("div");
      dayCard.className = "day-card";
      dayCard.setAttribute("data-day", dayName);

      const header = document.createElement("div");
      header.className = "day-header";
      header.innerHTML = `
        <div class="date-label">${dayName}, ${dateShort}</div>
        <div class="match-count">2 pertandingan</div>
      `;
      dayCard.appendChild(header);

      block.matches.forEach(m => {
        const matchEl = document.createElement("div");
        matchEl.className = "match";
        if (m.played) matchEl.classList.add("played");

        const timeEl = document.createElement("div");
        timeEl.className = "time";
        timeEl.textContent = m.time;

        // determine winner/loser
        let homeClass = "";
        let awayClass = "";
        let hasilText = "-";
        let statusText = "Belum dimainkan";

        if (m.played && m.result) {
          hasilText = `${m.result.home} - ${m.result.away}`;
          if (m.result.home > m.result.away) {
            homeClass = "winner";
            awayClass = "loser";
            statusText = `${m.home} menang`;
          } else if (m.result.away > m.result.home) {
            awayClass = "winner";
            homeClass = "loser";
            statusText = `${m.away} menang`;
          } else {
            statusText = "Seri";
          }
        }

        const teamsEl = document.createElement("div");
        teamsEl.className = "teams";
        teamsEl.innerHTML = `
          <div class="team">
            <div class="team-name ${homeClass}">${m.home}</div>
          </div>
          <div class="vs">vs</div>
          <div class="team">
            <div class="team-name ${awayClass}">${m.away}</div>
          </div>
        `;

        const right = document.createElement("div");
        right.className = "result";
        if (m.played && m.result) {
          right.innerHTML = `
            <div class="badge result-done">Hasil: ${hasilText}</div>
            <div class="status">${statusText}</div>
          `;
        } else {
          right.innerHTML = `<div class="badge unplayed">Belum dimainkan</div>`;
        }

        if (window.innerWidth >= 800) {
          // horizontal layout
          matchEl.appendChild(timeEl);
          matchEl.appendChild(teamsEl);
          matchEl.appendChild(right);
        } else {
          // stacked
          matchEl.appendChild(timeEl);
          matchEl.appendChild(teamsEl);
          matchEl.appendChild(right);
        }

        dayCard.appendChild(matchEl);
      });

      wrapper.appendChild(dayCard);
    });
  }

  // expose
  window.renderScheduleCards = renderScheduleCards;

  // init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderScheduleCards);
  } else {
    renderScheduleCards();
  }
})();


  // expose untuk debug/update manual
  window.buildScheduleUI = buildSchedule;
  window.renderScheduleUI = render;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();


// di akhir render()
if (typeof window.refreshAll === "function") {
  window.refreshAll();
} else if (typeof window.refreshKlasemen === "function") {
  window.refreshKlasemen();
}
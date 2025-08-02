// app.js — gabungan klasemen / roster / jadwal dengan tema gelap dan pemenang/kalah
(function () {
  // === util / fallback untuk global data ===
  if (!Array.isArray(window.teams)) window.teams = [];
  if (!Array.isArray(window.matches)) window.matches = [];

  // ---- konfigurasi jadwal tetap 4 tim, 3 hari, pairings ----
  const teamNames = Array.isArray(window.teams)
    ? window.teams.map(t => t.nama || t.name).filter(Boolean).slice(0, 4)
    : ["Tim A", "Tim B", "Tim C", "Tim D"];

  const dailyMatchups = [
    [{ home: teamNames[0], away: teamNames[1] }, { home: teamNames[2], away: teamNames[3] }], // 8 Aug
    [{ home: teamNames[0], away: teamNames[2] }, { home: teamNames[1], away: teamNames[3] }], // 9 Aug
    [{ home: teamNames[0], away: teamNames[3] }, { home: teamNames[1], away: teamNames[2] }]  //10 Aug
  ];

  const dates = [
    new Date("2025-08-08"),
    new Date("2025-08-09"),
    new Date("2025-08-10")
  ];
  const times = ["15:30", "16:30"];

  // === klasemen logic ===
  function computeKlasemen(teamsList, matchesList) {
    const klasemen = {};

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

    return Object.values(klasemen).sort((a, b) => {
      if (b.poin !== a.poin) return b.poin - a.poin;
      const diffA = a.setMenang - a.setKalah;
      const diffB = b.setMenang - b.setKalah;
      return diffB - diffA;
    });
  }

  // === schedule helpers ===
  function fmtDate(d) {
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
  }

  function findMatchRecord(home, away) {
    return window.matches.find(m =>
      (m.home === home && m.away === away) || (m.home === away && m.away === home)
    ) || null;
  }

  function buildScheduleData() {
    return dates.map((day, di) => {
      const matches = dailyMatchups[di].map((pair, mi) => {
        const [hh, mm] = times[mi].split(":").map(Number);
        const dt = new Date(day);
        dt.setHours(hh, mm, 0, 0);

        const stored = findMatchRecord(pair.home, pair.away);
        let played = false, result = null;
        if (stored && typeof stored.setHome === "number" && typeof stored.setAway === "number") {
          played = true;
          if (stored.home === pair.home && stored.away === pair.away) {
            result = { home: stored.setHome, away: stored.setAway };
          } else {
            result = { home: stored.setAway, away: stored.setHome };
          }
        }

        return {
          dateObj: dt,
          dateLabel: fmtDate(dt),
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

  // === rendering ===
  


function renderKlasemen() {
  const teamList = Array.isArray(window.teams) ? window.teams : [];
  const matchList = Array.isArray(window.matches) ? window.matches : [];
  const tabel = computeKlasemen(teamList, matchList);
  const tbody = document.getElementById("klasemen-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  tabel.forEach((tim, i) => {
    const tr = document.createElement("tr");
    // (kalau kamu sudah menghapus highlight leader, jangan tambahkan kelas 'top')

    const tdNo = document.createElement("td");
    tdNo.setAttribute("data-label", "No");
    tdNo.textContent = i + 1;
    tr.appendChild(tdNo);

    const tdTim = document.createElement("td");
    tdTim.setAttribute("data-label", "Tim");
    const namaTim = tim.nama || tim.name || "—";
    if (Array.isArray(tim.pemain) && tim.pemain.length) {
      const wrapper = document.createElement("div");
      wrapper.className = "tooltip";
      wrapper.textContent = namaTim;

      const tip = document.createElement("div");
      tip.className = "tooltip-text";
      tip.textContent = `Pemain: ${tim.pemain.join(", ")}`;

      wrapper.appendChild(tip);
      tdTim.appendChild(wrapper);
    } else {
      tdTim.textContent = namaTim;
    }
    tr.appendChild(tdTim);

    const stats = [
      { label: "Main", value: tim.main },
      { label: "M", value: tim.menang },
      { label: "K", value: tim.kalah },
      { label: "Set", value: `${tim.setMenang}-${tim.setKalah}` },
      { label: "Poin", value: tim.poin }
    ];
    stats.forEach(s => {
      const td = document.createElement("td");
      td.setAttribute("data-label", s.label);
      td.textContent = s.value;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}


  function renderRoster() {
    const container = document.getElementById("roster-container");
    if (!container) return;
    container.innerHTML = ""; // reset

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

  function renderSchedule() {
    const wrapper = document.getElementById("schedule-wrapper");
    if (!wrapper) return;
    wrapper.innerHTML = "";
    const schedule = buildScheduleData();

    schedule.forEach(block => {
      const dayName = block.day.toLocaleDateString("id-ID", { weekday: "long" });
      const dateShort = block.day.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

      const dayCard = document.createElement("div");
      dayCard.className = "day-card";
      dayCard.setAttribute("data-day", dayName);

      const header = document.createElement("div");
      header.className = "day-header";
      header.innerHTML = `
        <div class="date-label">${dayName}, ${dateShort}</div>
        <div class="small">2 pertandingan</div>
      `;
      dayCard.appendChild(header);

      block.matches.forEach(m => {
        const matchEl = document.createElement("div");
        matchEl.className = "match";
        if (m.played) matchEl.classList.add("played");

        // figure winner/loser
        let homeClass = "";
        let awayClass = "";
        if (m.played && m.result) {
          if (m.result.home > m.result.away) {
            homeClass = "winner";
            awayClass = "loser";
          } else if (m.result.away > m.result.home) {
            awayClass = "winner";
            homeClass = "loser";
          }
        }

        const left = document.createElement("div");
        left.style.flex = "1";
        const timeEl = document.createElement("div");
        timeEl.className = "time";
        timeEl.textContent = m.time;

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
        left.appendChild(timeEl);
        left.appendChild(teamsEl);

        const right = document.createElement("div");
        right.className = "result";
        if (m.played && m.result) {
          right.innerHTML = `
            <div class="badge result-done">Hasil: ${m.result.home} - ${m.result.away}</div>
            <div class="status">Selesai</div>
          `;
        } else {
          right.innerHTML = `<div class="badge unplayed">Belum dimainkan</div>`;
        }

        matchEl.appendChild(left);
        matchEl.appendChild(right);
        dayCard.appendChild(matchEl);
      });

      wrapper.appendChild(dayCard);
    });
  }

  function refreshAll() {
    renderRoster();
    renderSchedule();
    renderKlasemen();
  }

  window.refreshAll = refreshAll;
  window.refreshKlasemen = renderKlasemen;

  // inisialisasi
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshAll);
  } else {
    refreshAll();
  }
})();
// ===================================  
// KLASMEN + ROSTER + JADWAL + HASIL (6 Tim, 2 Grup)  
// ===================================  
(function () {  
  const MAX_WAIT = 5;  
  const INTERVAL_MS = 200;  

  // --------------------------  
  // Hitung klasemen 1 grup  
  // --------------------------  
  function computeKlasemen(teamsList, matchesList, groupTeams) {  
    const klasemen = {};  

    groupTeams.forEach(name => {  
      const t = teamsList.find(tt => (tt.nama || tt.name) === name) || {};  
      const namaTim = name;  
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

    matchesList.forEach(match => {  
      const { home, away, setHome = null, setAway = null } = match;  
      if (!groupTeams.includes(home) || !groupTeams.includes(away)) return;  

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

    return Object.values(klasemen).sort((a, b) => {  
      if (b.poin !== a.poin) return b.poin - a.poin;  
      const diffA = a.setMenang - a.setKalah;  
      const diffB = b.setMenang - b.setKalah;  
      return diffB - diffA;  
    });  
  }  

  // --------------------------  
  // Render Klasemen Per Grup  
  // --------------------------  
  function renderKlasemen() {  
    const teamsList = Array.isArray(window.teams) ? window.teams : [];  
    const matchesList = Array.isArray(window.matches) ? window.matches : [];  

    const teamNames = teamsList.map(t => t.nama || t.name).filter(Boolean).slice(0, 6);  
    const grupA = teamNames.slice(0, 3);  
    const grupB = teamNames.slice(3, 6);  

    function isiTabel(tbodyId, groupTeams) {  
      const data = computeKlasemen(teamsList, matchesList, groupTeams);  
      const tbody = document.getElementById(tbodyId);  
      if (!tbody) return;  
      tbody.innerHTML = "";  
      data.forEach((tim, i) => {  
        const tr = document.createElement("tr");  
        let pemainTooltip = "";  
        if (Array.isArray(tim.pemain) && tim.pemain.length) {  
          pemainTooltip = ` title="Pemain: ${tim.pemain.join(", ")}"`;  
        }  
        tr.innerHTML = `  
          <td>${i + 1}</td>  
          <td${pemainTooltip}>${tim.nama}</td>  
          <td>${tim.main}</td>  
          <td>${tim.menang}</td>  
          <td>${tim.kalah}</td>  
          <td>${tim.setMenang}-${tim.setKalah}</td>  
          <td>${tim.poin}</td>  
        `;  
        tbody.appendChild(tr);  
      });  
    }  

    isiTabel("klasemen-grup-a", grupA);  
    isiTabel("klasemen-grup-b", grupB);  
  }  

  // --------------------------  
  // Render Roster  
  // --------------------------  
  function renderRoster() {  
    const container = document.getElementById("roster-container");  
    if (!container) return;  
    container.innerHTML = "";  

    const listTeams = Array.isArray(window.teams) ? window.teams : [];  
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

      const copyBtn = document.createElement("button");  
      copyBtn.className = "copy-team-btn";  
      copyBtn.innerHTML = "📋 Salin Nama";  
      copyBtn.onclick = () => {  
        const text = `📌 ${name}\n` + players.map((p, i) => `${i + 1}. ${p}`).join("\n");  
        navigator.clipboard.writeText(text)  
          .then(() => {  
            copyBtn.textContent = "✅ Tersalin!";  
            setTimeout(() => copyBtn.textContent = "📋 Salin Nama", 2000);  
          })  
          .catch(() => {  
            copyBtn.textContent = "⚠️ Gagal menyalin";  
          });  
      };  

      const meta = document.createElement("div");  
      meta.className = "team-meta";  
      meta.appendChild(copyBtn);  

      card.appendChild(header);  
      card.appendChild(listWrapper);  
      card.appendChild(meta);  
      container.appendChild(card);  
    });  
  }  


function buildShareText() {
  const teamsList = Array.isArray(window.teams) ? window.teams : [];
  const matchesList = Array.isArray(window.matches) ? window.matches : [];

  if (!teamsList.length) return "";

  const teamNames = teamsList.map(t => t.nama || t.name).filter(Boolean).slice(0, 6);
  const grupA = teamNames.slice(0, 3);
  const grupB = teamNames.slice(3, 6);

  const klasemenA = computeKlasemen(teamsList, matchesList, grupA);
  const klasemenB = computeKlasemen(teamsList, matchesList, grupB);

  const lines = [];

lines.push("*Klasemen Tanjung SuperCup*\n");
  // Grup A
  lines.push("*Grup A*");
  klasemenA.forEach((tim, i) => {
    const nomor = i + 1;
    const nama = tim.nama || "—";
    const setText = `(${tim.setMenang}-${tim.setKalah})`;
    const poinText = `${tim.poin}`;
    lines.push(`${nomor}. ${nama} ${setText} *${poinText}*`);
  });
  lines.push("");

  // Grup B
  lines.push("*Grup B*");
  klasemenB.forEach((tim, i) => {
    const nomor = i + 1;
    const nama = tim.nama || "—";
    const setText = `(${tim.setMenang}-${tim.setKalah})`;
    const poinText = `${tim.poin}`;
    lines.push(`${nomor}. ${nama} ${setText} *${poinText}*`);
  });
  lines.push("");

  // Tambahkan link info
  lines.push("Info selengkapnya: https://tanjungbulan.my.id/supercup");
lines.push("> dibuat otomatis oleh sistem");

  return lines.join("\n");
}

function setupWhatsappShareButton() {
  const btn = document.getElementById("btn-share-whatsapp");
  const feedback = document.getElementById("share-feedback");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const text = buildShareText();
    if (!text) {
      if (feedback) {
        feedback.textContent = "Klasemen kosong, tidak bisa dibagikan.";
        setTimeout(() => (feedback.textContent = ""), 1500);
      }
      return;
    }

    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");

    if (feedback) {
      feedback.textContent = "Membuka WhatsApp...";
      setTimeout(() => (feedback.textContent = ""), 1500);
    }
  });
}

// Integrasi dengan refreshAll
const prevRefresh = window.refreshAll;
window.refreshAll = function () {
  prevRefresh?.();
  setupWhatsappShareButton();
};

// Init awal
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupWhatsappShareButton);
} else {
  setupWhatsappShareButton();
}



  // --------------------------  
  // Render Jadwal + Hasil  
  // --------------------------  
  (function () {  
    const teamNames = Array.isArray(window.teams)  
      ? window.teams.map(t => t.nama || t.name).filter(Boolean).slice(0, 6)  
      : ["Tim A", "Tim B", "Tim C", "Tim D", "Tim E", "Tim F"];  

    const grupA = teamNames.slice(0, 3);  
    const grupB = teamNames.slice(3, 6);  

    function roundRobin(group) {  
      return [  
        { home: group[0], away: group[1], group: group },  
        { home: group[0], away: group[2], group: group },  
        { home: group[1], away: group[2], group: group }  
      ];  
    }  

    const matchupsA = roundRobin(grupA);  
    const matchupsB = roundRobin(grupB);  

    const dailyMatchups = [  
      [ matchupsA[0], matchupsB[0] ],  
      [ matchupsB[1], matchupsA[1] ],  
      [ matchupsA[2], matchupsB[2] ]  
    ];  

    const dates = [  
      new Date("2025-08-30"),  
      new Date("2025-08-31"),  
      new Date("2025-09-01")  
    ];  
    const times = ["16:15", "17:00"];  

    function findMatch(home, away) {  
      if (!Array.isArray(window.matches)) return null;  
      return window.matches.find(m => {  
        const exact = m.home === home && m.away === away;  
        const reversed = m.home === away && m.away === home;  
        return exact || reversed;  
      }) || null;  
    }  

    function render() {  
      const wrapper = document.getElementById("schedule-wrapper");  
      if (!wrapper) return;  
      wrapper.innerHTML = "";  

      dailyMatchups.forEach((pairs, di) => {  
        const day = dates[di];  
        const dayName = day.toLocaleDateString("id-ID", { weekday: "long" });  
        const dateShort = day.toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });  

        const dayCard = document.createElement("div");  
        dayCard.className = "day-card";  
        dayCard.setAttribute("data-day", dayName);  

        // HEADER -> hanya tampilkan sekali (Hari, Tanggal)  
        const header = document.createElement("div");  
        header.className = "day-header";  
        header.innerHTML = `<div class="date-label" style="text-align:center;font-weight:bold;">${dayName}, ${dateShort}</div>`;  
        dayCard.appendChild(header);  

        pairs.forEach((pair, mi) => {  
          const [hh, mm] = times[mi].split(":").map(Number);  
          const dt = new Date(day);  
          dt.setHours(hh, mm, 0, 0);  

          const resultMatch = findMatch(pair.home, pair.away);  
          let played = false;  
          let result = null;  
          if (resultMatch && typeof resultMatch.setHome === "number" && typeof resultMatch.setAway === "number") {  
            played = true;  
            if (resultMatch.home === pair.home && resultMatch.away === pair.away) {  
              result = { home: resultMatch.setHome, away: resultMatch.setAway };  
            } else {  
              result = { home: resultMatch.setAway, away: resultMatch.setHome };  
            }  
          }  

          const matchEl = document.createElement("div");  
          matchEl.className = "match";  
          if (played) matchEl.classList.add("played");  

          let homeClass = "";  
          let awayClass = "";  
          if (played && result) {  
            if (result.home > result.away) {  
              homeClass = "winner";  
              awayClass = "loser";  
            } else if (result.away > result.home) {  
              awayClass = "winner";  
              homeClass = "loser";  
            }  
          }  

          const content = document.createElement("div");  
          content.style.textAlign = "center";  

          const timeEl = document.createElement("div");  
          timeEl.className = "time";  
          timeEl.textContent = times[mi] + ` (Grup ${pair.group === grupA ? "A" : "B"})`;  
          timeEl.style.fontWeight = "bold";  
          content.appendChild(timeEl);  

          const teamsEl = document.createElement("div");  
          teamsEl.className = "teams";  
          teamsEl.innerHTML = `  
            <div class="team-name ${homeClass}">${pair.home}</div>  
            <div class="vs">vs</div>  
            <div class="team-name ${awayClass}">${pair.away}</div>  
          `;  
          content.appendChild(teamsEl);  

          const resultEl = document.createElement("div");  
          resultEl.style.marginTop = "4px";  
          if (played && result) {  
            resultEl.innerHTML = `<div class="badge result-done">Hasil: ${result.home} - ${result.away}</div>`;  
          } else {  
            resultEl.innerHTML = `<div class="badge unplayed">Belum dimainkan</div>`;  
          }  

          content.appendChild(resultEl);  
          matchEl.appendChild(content);  
          dayCard.appendChild(matchEl);  
        });  

        wrapper.appendChild(dayCard);  
      });  
    }  

    window.renderScheduleUI = render;  
    if (document.readyState === "loading") {  
      document.addEventListener("DOMContentLoaded", render);  
    } else {  
      render();  
    }  
  })();  

  // --------------------------  
  // Refresh All  
  // --------------------------  
  function refreshAll() {  
    renderRoster();  
    renderKlasemen();  
    if (typeof window.renderScheduleUI === "function") {  
      window.renderScheduleUI();  
    }  
  }  

  window.refreshKlasemen = renderKlasemen;  
  window.refreshAll = refreshAll;  

  function tryInit(attempt = 1) {  
    const hasRoster = !!document.getElementById("roster-container");  
    const hasSchedule = !!document.getElementById("schedule-wrapper");  
    const hasKlasemenA = !!document.getElementById("klasemen-grup-a");  
    const hasKlasemenB = !!document.getElementById("klasemen-grup-b");  

    if (!hasRoster || !hasSchedule || !hasKlasemenA || !hasKlasemenB) {  
      if (attempt <= MAX_WAIT) {  
        setTimeout(() => tryInit(attempt + 1), INTERVAL_MS);  
      } else {  
        console.warn("Gagal menemukan elemen target.");  
      }  
      return;  
    }  
    refreshAll();  
  }  

  if (document.readyState === "loading") {  
    document.addEventListener("DOMContentLoaded", () => tryInit());  
  } else {  
    tryInit();  
  }  

  // --------------------------  
  // SHARE WHATSAPP KLASMEN  
  // --------------------------  
  document.addEventListener("DOMContentLoaded", function () {  
    const btn = document.getElementById("shareBtn");  
    if (!btn) return;  

    btn.addEventListener("click", function () {  
      const teamsList = Array.isArray(window.teams) ? window.teams : [];  
      const matchesList = Array.isArray(window.matches) ? window.matches : [];  

      const teamNames = teamsList.map(t => t.nama || t.name).filter(Boolean).slice(0, 6);  
      const grupA = teamNames.slice(0, 3);  
      const grupB = teamNames.slice(3, 6);  

      function formatGroup(title, groupTeams) {  
        const data = computeKlasemen(teamsList, matchesList, groupTeams);  
        let lines = [`*Klasemen Tanjung SuperCup - ${title}*`];  
        data.forEach((t, i) => {  
          const selisih = `${t.setMenang}-${t.setKalah}`;  
          lines.push(`${i + 1}. ${t.nama} (${selisih}) ${t.poin}`);  
        });  
        return lines.join("\n");  
      }  

      const shareText =  
        formatGroup("Grup A", grupA) + "\n\n" +  
        formatGroup("Grup B", grupB);  

      const url = "https://wa.me/?text=" + encodeURIComponent(shareText);  
      window.open(url, "_blank");  
    });  
  });  

})();
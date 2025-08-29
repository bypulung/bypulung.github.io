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
      klasemen[name] = {  
        nama: name,  
        main: 0, menang: 0, kalah: 0,  
        setMenang: 0, setKalah: 0, poin: 0,  
        pemain: Array.isArray(t.pemain) ? t.pemain.slice() : []  
      };  
    });  

    matchesList.forEach(match => {  
      const { home, away, setHome = null, setAway = null } = match;  
      if (!groupTeams.includes(home) || !groupTeams.includes(away)) return;  

      if (typeof setHome === "number" && typeof setAway === "number") {  
        const th = klasemen[home], ta = klasemen[away];  
        th.main++; ta.main++;  
        th.setMenang += setHome; th.setKalah += setAway;  
        ta.setMenang += setAway; ta.setKalah += setHome;  

        if (setHome > setAway) {  
          th.menang++; ta.kalah++;  
          if (setHome === 2 && setAway === 0) th.poin += 3;  
          else if (setHome === 2 && setAway === 1) { th.poin += 2; ta.poin += 1; }  
        } else if (setAway > setHome) {  
          ta.menang++; th.kalah++;  
          if (setAway === 2 && setHome === 0) ta.poin += 3;  
          else if (setAway === 2 && setHome === 1) { ta.poin += 2; th.poin += 1; }  
        }  
      }  
    });  

    return Object.values(klasemen).sort((a, b) => {  
      if (b.poin !== a.poin) return b.poin - a.poin;  
      return (b.setMenang - b.setKalah) - (a.setMenang - a.setKalah);  
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
        tr.innerHTML = `  
          <td>${i + 1}</td>  
          <td title="Pemain: ${(tim.pemain || []).join(", ")}">${tim.nama}</td>  
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
      card.innerHTML = `  
        <div class="team-header">  
          <h3 class="team-name-title">${name}</h3>  
          <div class="player-count">${players.length} Pemain</div>  
        </div>  
        <ul class="player-list">  
          ${players.length ? players.map(p => `<li><div class="player-bullet"></div><div>${p}</div></li>`).join("") : `<div class="no-players">Belum ada pemain.</div>`}  
        </ul>  
      `;  

      const copyBtn = document.createElement("button");  
      copyBtn.className = "copy-team-btn";  
      copyBtn.innerHTML = "📋 Salin Nama";  
      copyBtn.onclick = () => {  
        const text = `📌 ${name}\n` + players.map((p, i) => `${i + 1}. ${p}`).join("\n");  
        navigator.clipboard.writeText(text).then(() => {  
          copyBtn.textContent = "✅ Tersalin!";  
          setTimeout(() => copyBtn.textContent = "📋 Salin Nama", 2000);  
        }).catch(() => copyBtn.textContent = "⚠️ Gagal menyalin");  
      };  

      const meta = document.createElement("div");  
      meta.className = "team-meta";  
      meta.appendChild(copyBtn);  
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

lines.push("Klasemen Tanjung SuperCup\n");
// Grup A
lines.push("Grup A");
klasemenA.forEach((tim, i) => {
const nomor = i + 1;
const nama = tim.nama || "—";
const setText = (${tim.setMenang}-${tim.setKalah});
const poinText = ${tim.poin};
lines.push(${nomor}. ${nama} ${setText} *${poinText}*);
});
lines.push("");

// Grup B
lines.push("Grup B");
klasemenB.forEach((tim, i) => {
const nomor = i + 1;
const nama = tim.nama || "—";
const setText = (${tim.setMenang}-${tim.setKalah});
const poinText = ${tim.poin};
lines.push(${nomor}. ${nama} ${setText} *${poinText}*);
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
  // Render Jadwal + Hasil (pakai window.matches fix)  
  // --------------------------  
  (function () {  
    const matchesList = Array.isArray(window.matches) ? window.matches : [];  
    const dates = [  
      new Date("2025-08-31"),  
      new Date("2025-08-31"),  
      new Date("2025-09-01"),  
      new Date("2025-09-01"),  
      new Date("2025-09-02"),  
      new Date("2025-09-02")  
    ];  
    const times = ["16:15", "17:00"];  

    function render() {  
      const wrapper = document.getElementById("schedule-wrapper");  
      if (!wrapper) return;  
      wrapper.innerHTML = "";  

      let currentDateKey = "";  
      matchesList.forEach((m, i) => {  
        const d = dates[i];  
        const [hh, mm] = times[i % 2].split(":").map(Number);  
        d.setHours(hh, mm, 0, 0);  

        const dayName = d.toLocaleDateString("id-ID", { weekday: "long" });  
        const dateShort = d.toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });  
        const dateKey = dayName + dateShort;  

        let dayCard;  
        if (dateKey !== currentDateKey) {  
          dayCard = document.createElement("div");  
          dayCard.className = "day-card";  
          dayCard.innerHTML = `<div class="day-header"><div class="date-label">${dayName}, ${dateShort}</div></div>`;  
          wrapper.appendChild(dayCard);  
          currentDateKey = dateKey;  
        } else {  
          dayCard = wrapper.lastElementChild;  
        }  

        const matchEl = document.createElement("div");  
        matchEl.className = "match";  

        const played = typeof m.setHome === "number" && typeof m.setAway === "number";  
        let homeClass = "", awayClass = "";  
        if (played) {  
          if (m.setHome > m.setAway) { homeClass="winner"; awayClass="loser"; }  
          else if (m.setAway > m.setHome) { awayClass="winner"; homeClass="loser"; }  
        }  

        matchEl.innerHTML = `  
          <div style="text-align:center">  
            <div class="time"><b>${times[i % 2]}</b></div>  
            <div class="teams">  
              <div class="team-name ${homeClass}">${m.home}</div>  
              <div class="vs">vs</div>  
              <div class="team-name ${awayClass}">${m.away}</div>  
            </div>  
            <div style="margin-top:4px">  
              ${played ? `<div class="badge result-done">Hasil: ${m.setHome} - ${m.setAway}</div>` : `<div class="badge unplayed">Belum dimainkan</div>`}  
            </div>  
          </div>`;  

        dayCard.appendChild(matchEl);  
      });  
    }  

    window.renderScheduleUI = render;  
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);  
    else render();  
  })();  

  // --------------------------  
  // Refresh All  
  // --------------------------  
  function refreshAll() {  
    renderRoster();  
    renderKlasemen();  
    if (typeof window.renderScheduleUI === "function") window.renderScheduleUI();  
  }  
  window.refreshAll = refreshAll;  

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
        data.forEach((t, i) => lines.push(`${i + 1}. ${t.nama} (${t.setMenang}-${t.setKalah}) ${t.poin}`));  
        return lines.join("\n");  
      }  

      const shareText = formatGroup("Grup A", grupA) + "\n\n" + formatGroup("Grup B", grupB);  
      window.open("https://wa.me/?text=" + encodeURIComponent(shareText), "_blank");  
    });  
  });  

  // Init  
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => refreshAll());  
  else refreshAll();  
})();
async function fetchJSON(path) {
  const response = await fetch(path);
  return await response.json();
}

function calculateStandings(teams, matches) {
  const standings = {};
  teams.forEach(team => {
    standings[team.name] = {
      name: team.name,
      P: 0,
      M: 0,
      K: 0,
      winSet: 0,
      loseSet: 0,
      points: 0
    };
  });

  matches.forEach(match => {
    const { teamA, teamB, scoreA, scoreB } = match;

    // Abaikan jika skor belum lengkap
    if (typeof scoreA !== 'number' || typeof scoreB !== 'number') return;

    standings[teamA].P++;
    standings[teamB].P++;

    standings[teamA].winSet += scoreA;
    standings[teamA].loseSet += scoreB;

    standings[teamB].winSet += scoreB;
    standings[teamB].loseSet += scoreA;

    if (scoreA > scoreB) {
      standings[teamA].M++;
      standings[teamB].K++;
      standings[teamA].points += scoreA === 2 && scoreB === 0 ? 3 : 2;
      standings[teamB].points += scoreA === 2 && scoreB === 1 ? 1 : 0;
    } else {
      standings[teamB].M++;
      standings[teamA].K++;
      standings[teamB].points += scoreB === 2 && scoreA === 0 ? 3 : 2;
      standings[teamA].points += scoreB === 2 && scoreA === 1 ? 1 : 0;
    }
  });

  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.winSet - a.loseSet;
    const diffB = b.winSet - b.loseSet;
    return diffB - diffA;
  });
}

function renderStandings(standings) {
  const tbody = document.querySelector('#standingsTable tbody');
  tbody.innerHTML = "";
  standings.forEach((team, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${team.name}</td>
        <td>${team.P}</td>
        <td>${team.M}</td>
        <td>${team.K}</td>
        <td>${team.winSet}-${team.loseSet}</td>
        <td class="green">${team.points}</td>
      </tr>
    `;
  });
}

function renderSchedule(matches) {
  const tbody = document.querySelector('#scheduleTable tbody');
  tbody.innerHTML = "";
  matches.forEach((match, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${match.teamA} vs ${match.teamB}</td>
        <td>${match.date || '-'}</td>
      </tr>
    `;
  });
}

function renderResults(matches) {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = "";
  let counter = 1;
  matches.forEach(match => {
    const { teamA, teamB, scoreA, scoreB } = match;
    if (typeof scoreA === 'number' && typeof scoreB === 'number') {
      tbody.innerHTML += `
        <tr>
          <td>${counter++}</td>
          <td>${teamA}</td>
          <td>${teamB}</td>
          <td>${scoreA} - ${scoreB}</td>
        </tr>
      `;
    }
  });
}

function renderTeams(teams) {
  const tbody = document.querySelector('#teamsTable tbody');
  tbody.innerHTML = "";
  teams.forEach(team => {
    tbody.innerHTML += `
      <tr>
        <td>${team.name}</td>
        <td>${team.players.join(", ")}</td>
      </tr>
    `;
  });
}

async function init() {
  const [teams, matches] = await Promise.all([
    fetchJSON("tim.json"),
    fetchJSON("main.json")
  ]);
  const standings = calculateStandings(teams, matches);
  renderStandings(standings);
  renderSchedule(matches);
  renderResults(matches);
  renderTeams(teams);
}

init();

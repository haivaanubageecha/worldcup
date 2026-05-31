const STORAGE_KEY = "worldCupPredictorState";
const DISPLAY_TIME_ZONE = "Indian/Maldives";
const DISPLAY_TIME_ZONE_LABEL = "MVT";
const FLAG_BY_TEAM = {
  Algeria: "🇩🇿",
  Argentina: "🇦🇷",
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  "Bosnia and Herzegovina": "🇧🇦",
  Brazil: "🇧🇷",
  Canada: "🇨🇦",
  "Cabo Verde": "🇨🇻",
  "Cape Verde": "🇨🇻",
  Colombia: "🇨🇴",
  "Cote d'Ivoire": "🇨🇮",
  Croatia: "🇭🇷",
  Curacao: "🇨🇼",
  "Curaçao": "🇨🇼",
  Czechia: "🇨🇿",
  "Congo DR": "🇨🇩",
  "DR Congo": "🇨🇩",
  Ecuador: "🇪🇨",
  Egypt: "🇪🇬",
  England: "🏴",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Ghana: "🇬🇭",
  Haiti: "🇭🇹",
  Iran: "🇮🇷",
  Iraq: "🇮🇶",
  "Ivory Coast": "🇨🇮",
  Japan: "🇯🇵",
  Jordan: "🇯🇴",
  Mexico: "🇲🇽",
  Morocco: "🇲🇦",
  Netherlands: "🇳🇱",
  "New Zealand": "🇳🇿",
  Norway: "🇳🇴",
  Panama: "🇵🇦",
  Paraguay: "🇵🇾",
  Portugal: "🇵🇹",
  Qatar: "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  Scotland: "🏴",
  Senegal: "🇸🇳",
  "South Africa": "🇿🇦",
  "Korea Republic": "🇰🇷",
  "South Korea": "🇰🇷",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Tunisia: "🇹🇳",
  Turkiye: "🇹🇷",
  Turkey: "🇹🇷",
  Türkiye: "🇹🇷",
  Uruguay: "🇺🇾",
  USA: "🇺🇸",
  "United States": "🇺🇸",
  Uzbekistan: "🇺🇿"
};

let state = loadState();
let selectedLeaderboardEmail = null;

const loginPanel = document.querySelector("#signInPanel");
const profilePanel = document.querySelector("#profilePanel");
const profileName = document.querySelector("#profileName");
const profileEmail = document.querySelector("#profileEmail");
const avatar = document.querySelector("#avatar");
const loginForm = document.querySelector("#signInPanel form");
const photoInput = document.querySelector("#photoInput");
const switchUserButton = document.querySelector("#switchUserButton");
const matchesList = document.querySelector("#matchesList");
const matchSearch = document.querySelector("#matchSearch");
const roundFilter = document.querySelector("#roundFilter");
const leaderboard = document.querySelector("#leaderboard");
const resultsEditor = document.querySelector("#resultsEditor");
const addResultButton = document.querySelector("#addResultButton");
const fixtureList = document.querySelector("#fixtureList");
const exportButton = document.querySelector("#exportButton");
const resetButton = document.querySelector("#resetButton");

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => showView(tab.dataset.view));
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(loginForm);
  const email = String(form.get("email") || loginForm.querySelector("input[type='email']").value).trim().toLowerCase();
  const name = String(form.get("name") || "").trim() || email.split("@")[0] || "Player";

  if (!isValidEmail(email)) {
    loginForm.querySelector("input[type='email']").focus();
    return;
  }

  state.currentUser = email;
  state.users[email] = state.users[email] || { email, name };
  state.users[email].name = name;
  saveState();
  loginForm.reset();
  render();
});

switchUserButton.addEventListener("click", () => {
  state.currentUser = null;
  saveState();
  render();
});

photoInput.addEventListener("change", async () => {
  const user = getCurrentUser();
  const file = photoInput.files?.[0];
  if (!user || !file) return;

  user.photo = await readImageAsDataUrl(file);
  photoInput.value = "";
  saveState();
  render();
});

matchSearch.addEventListener("input", renderMatches);
roundFilter.addEventListener("change", renderMatches);

addResultButton.addEventListener("click", () => {
  resultsEditor.classList.toggle("hidden");
  renderResultsEditor();
});

document.querySelector("#fixturesView").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const inputs = Array.from(form.querySelectorAll("input"));
  const [teamA, teamB, round, date, venue] = inputs.map((input) => input.value.trim());

  if (!teamA || !teamB || !round || !date || !venue) return;

  state.fixtures.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `m${Date.now()}`,
    teamA,
    teamB,
    round,
    date,
    venue,
    result: null
  });
  form.reset();
  saveState();
  render();
});

exportButton.addEventListener("click", exportCsv);

resetButton.addEventListener("click", () => {
  if (!confirm("Reset fixtures, predictions, and results in this browser?")) return;
  state = createInitialState();
  saveState();
  render();
});

function createInitialState() {
  return {
    currentUser: null,
    users: {},
    fixtures: cloneOfficialFixtures(),
    predictions: {},
    fixtureSetVersion: WORLD_CUP_FIXTURES_VERSION
  };
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return createInitialState();

  try {
    const parsed = JSON.parse(stored);
    const state = {
      ...createInitialState(),
      ...parsed,
      users: parsed.users || {},
      fixtures: parsed.fixtures || cloneOfficialFixtures(),
      predictions: parsed.predictions || {}
    };
    syncOfficialFixtures(state);
    return state;
  } catch {
    return createInitialState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function cloneOfficialFixtures() {
  return WORLD_CUP_FIXTURES.map((fixture) => ({ ...fixture, result: fixture.result ? { ...fixture.result } : null }));
}

function syncOfficialFixtures(nextState) {
  const hasDemoFixtures = nextState.fixtures.some((fixture) => fixture.teamB === "Team TBD" || String(fixture.round).startsWith("Sample"));
  const needsOfficialFixtures = nextState.fixtureSetVersion !== WORLD_CUP_FIXTURES_VERSION || hasDemoFixtures || nextState.fixtures.length !== 104;

  if (needsOfficialFixtures) {
    const existingResults = new Map(nextState.fixtures.map((fixture) => [fixture.id, fixture.result]).filter(([, result]) => result));
    nextState.fixtures = cloneOfficialFixtures().map((fixture) => ({
      ...fixture,
      result: existingResults.get(fixture.id) || fixture.result
    }));
    nextState.fixtureSetVersion = WORLD_CUP_FIXTURES_VERSION;
  }
}

function render() {
  renderSession();
  renderRoundFilter();
  renderMatches();
  renderLeaderboard();
  renderFixtureList();
  renderResultsEditor();
}

function renderSession() {
  const user = getCurrentUser();
  loginPanel.classList.toggle("hidden", Boolean(user));
  profilePanel.classList.toggle("hidden", !user);

  if (!user) return;

  profileName.textContent = user.name;
  profileEmail.textContent = user.email;
  renderAvatar(avatar, user);
}

function renderRoundFilter() {
  const selected = roundFilter.value || "all";
  const rounds = [...new Set(state.fixtures.map((fixture) => fixture.round))].sort();
  roundFilter.innerHTML = `<option value="all">All rounds</option>${rounds
    .map((round) => `<option value="${escapeHtml(round)}">${escapeHtml(round)}</option>`)
    .join("")}`;
  roundFilter.value = rounds.includes(selected) ? selected : "all";
}

function renderMatches() {
  const user = getCurrentUser();
  const query = matchSearch.value.trim().toLowerCase();
  const round = roundFilter.value;
  const fixtures = state.fixtures
    .filter((fixture) => round === "all" || fixture.round === round)
    .filter((fixture) => {
      const haystack = `${fixture.teamA} ${fixture.teamB} ${fixture.round} ${fixture.venue}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!fixtures.length) {
    matchesList.innerHTML = `<div class="empty">No matches found.</div>`;
    return;
  }

  const template = document.querySelector("#matchTemplate");
  matchesList.innerHTML = "";

  fixtures.forEach((fixture) => {
    const prediction = user ? getPrediction(user.email, fixture.id) : null;
    const locked = isFixtureLocked(fixture);
    const card = template.content.firstElementChild.cloneNode(true);
    card.classList.toggle("locked", locked);
    card.querySelector(".round").textContent = fixture.round;
    card.querySelector(".date").textContent = formatDate(fixture.date);
    card.querySelector(".team-a").textContent = formatTeam(fixture.teamA);
    card.querySelector(".team-b").textContent = formatTeam(fixture.teamB);
    card.querySelector(".venue").textContent = fixture.venue;
    card.querySelector(".match-result").textContent = formatResult(fixture);
    card.querySelector(".match-result").classList.toggle("empty-result", !fixture.result);
    card.querySelector(".score-a").value = prediction?.scoreA ?? "";
    card.querySelector(".score-b").value = prediction?.scoreB ?? "";
    card.querySelectorAll(".score").forEach((input) => {
      input.disabled = !user || locked;
      input.placeholder = user ? "" : "-";
    });
    card.querySelector(".score-form button").textContent = getPredictionButtonLabel(user, locked, prediction);
    card.querySelector(".score-form button").disabled = !user || locked;
    card.querySelector(".score-form").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!user || locked) return;
      const scoreA = Number(card.querySelector(".score-a").value);
      const scoreB = Number(card.querySelector(".score-b").value);
      if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) return;
      state.predictions[user.email] = state.predictions[user.email] || {};
      state.predictions[user.email][fixture.id] = { scoreA, scoreB, savedAt: new Date().toISOString() };
      saveState();
      renderLeaderboard();
    });
    matchesList.append(card);
  });
}

function renderLeaderboard() {
  const rows = Object.values(state.users)
    .map((user) => ({ user, ...calculateScore(user.email) }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.exact - a.exact ||
        b.goalDiff - a.goalDiff ||
        b.correct - a.correct ||
        a.user.name.localeCompare(b.user.name)
    );

  if (!rows.length) {
    leaderboard.innerHTML = `<div class="empty">No players yet.</div>`;
    return;
  }

  leaderboard.innerHTML = `
      <div class="leader-header">
        <span></span>
        <span>Player</span>
        <span>Points</span>
        <span>Exact</span>
        <span>Goal diff</span>
        <span>Predicted</span>
      </div>
      ${rows
        .map(
          (row, index) => `
        <div class="leader-row" role="button" tabindex="0" data-email="${escapeHtml(row.user.email)}">
          <div class="rank">${index + 1}</div>
          <div class="leader-name">
            ${renderAvatarMarkup(row.user)}
            <div>
              <strong>${escapeHtml(row.user.name)}</strong>
              <span>${escapeHtml(row.user.email)}</span>
            </div>
          </div>
          <div class="leader-stat"><strong>${row.points}</strong></div>
          <div class="leader-stat"><strong>${row.exact}</strong></div>
          <div class="leader-stat"><strong>${row.goalDiff}</strong></div>
          <div class="leader-stat"><strong>${row.predicted}</strong></div>
        </div>
      `
        )
        .join("")}
      <div id="playerPredictions" class="player-predictions"></div>
    `;

  leaderboard.querySelectorAll(".leader-row").forEach((row) => {
    row.addEventListener("click", () => {
      selectedLeaderboardEmail = row.dataset.email;
      renderPlayerPredictions();
    });
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectedLeaderboardEmail = row.dataset.email;
        renderPlayerPredictions();
      }
    });
  });

  if (!selectedLeaderboardEmail || !state.users[selectedLeaderboardEmail]) {
    selectedLeaderboardEmail = rows[0].user.email;
  }
  renderPlayerPredictions();
}

function renderPlayerPredictions() {
  const container = document.querySelector("#playerPredictions");
  if (!container) return;

  leaderboard.querySelectorAll(".leader-row").forEach((row) => {
    row.classList.toggle("selected", row.dataset.email === selectedLeaderboardEmail);
  });

  const user = state.users[selectedLeaderboardEmail];
  if (!user) {
    container.innerHTML = "";
    return;
  }

  const predictions = state.predictions[user.email] || {};
  const predictedFixtures = state.fixtures
    .filter((fixture) => predictions[fixture.id])
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!predictedFixtures.length) {
    container.innerHTML = `
      <div class="player-predictions-head">
        ${renderAvatarMarkup(user)}
        <div>
          <strong>${escapeHtml(user.name)}</strong>
          <span>No predictions saved yet.</span>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="player-predictions-head">
      ${renderAvatarMarkup(user)}
      <div>
        <strong>${escapeHtml(user.name)}'s predictions</strong>
        <span>Future match predictions stay hidden until kickoff.</span>
      </div>
    </div>
    <div class="prediction-detail-list">
      ${predictedFixtures.map((fixture) => renderPredictionDetailRow(fixture, predictions[fixture.id])).join("")}
    </div>
  `;
}

function renderPredictionDetailRow(fixture, prediction) {
  const canShowPrediction = isFixtureLocked(fixture) || fixture.result;
  const predictionText = canShowPrediction ? `${prediction.scoreA}-${prediction.scoreB}` : "Hidden until kickoff";
  const resultText = fixture.result ? `${fixture.result.scoreA}-${fixture.result.scoreB}` : "Pending";
  const pointsText = fixture.result && canShowPrediction ? pointsForPrediction(prediction, fixture.result) : "-";

  return `
    <div class="prediction-detail-row">
      <div>
        <strong>${escapeHtml(formatTeam(fixture.teamA))} vs ${escapeHtml(formatTeam(fixture.teamB))}</strong>
        <span>${escapeHtml(fixture.round)} · ${formatDate(fixture.date)}</span>
      </div>
      <div><span>Prediction</span><strong>${escapeHtml(predictionText)}</strong></div>
      <div><span>Result</span><strong>${escapeHtml(resultText)}</strong></div>
      <div><span>Points</span><strong>${pointsText}</strong></div>
    </div>
  `;
}

function renderResultsEditor() {
  if (resultsEditor.classList.contains("hidden")) return;

  resultsEditor.innerHTML = state.fixtures
    .map((fixture) => {
      const result = fixture.result || {};
      return `
        <form class="result-row" data-fixture-id="${fixture.id}">
          <strong>${escapeHtml(formatTeam(fixture.teamA))} vs ${escapeHtml(formatTeam(fixture.teamB))}</strong>
          <input type="number" min="0" max="20" value="${result.scoreA ?? ""}" aria-label="${escapeHtml(fixture.teamA)} result" />
          <input type="number" min="0" max="20" value="${result.scoreB ?? ""}" aria-label="${escapeHtml(fixture.teamB)} result" />
          <button type="submit">Save result</button>
        </form>
      `;
    })
    .join("");

  resultsEditor.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fixture = state.fixtures.find((item) => item.id === form.dataset.fixtureId);
      const [scoreAInput, scoreBInput] = form.querySelectorAll("input");
      const scoreA = Number(scoreAInput.value);
      const scoreB = Number(scoreBInput.value);
      if (!fixture || !Number.isInteger(scoreA) || !Number.isInteger(scoreB)) return;
      fixture.result = { scoreA, scoreB };
      saveState();
      renderLeaderboard();
    });
  });
}

function renderFixtureList() {
  fixtureList.innerHTML = state.fixtures
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(
      (fixture) => `
        <form class="fixture-row" data-fixture-id="${fixture.id}">
          <strong>${escapeHtml(formatTeam(fixture.teamA))} vs ${escapeHtml(formatTeam(fixture.teamB))}</strong>
          <span>${escapeHtml(fixture.round)}</span>
          <span>${formatDate(fixture.date)}</span>
          <div class="fixture-result">
            <input type="number" min="0" max="20" value="${fixture.result?.scoreA ?? ""}" aria-label="${escapeHtml(fixture.teamA)} final score" />
            <span>:</span>
            <input type="number" min="0" max="20" value="${fixture.result?.scoreB ?? ""}" aria-label="${escapeHtml(fixture.teamB)} final score" />
            <button type="submit">Update</button>
          </div>
          <span>${escapeHtml(fixture.venue)}</span>
        </form>
      `
    )
    .join("");

  fixtureList.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fixture = state.fixtures.find((item) => item.id === form.dataset.fixtureId);
      const [scoreAInput, scoreBInput] = form.querySelectorAll("input");
      const scoreA = Number(scoreAInput.value);
      const scoreB = Number(scoreBInput.value);
      if (!fixture || !Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) return;

      fixture.result = { scoreA, scoreB };
      saveState();
      renderMatches();
      renderLeaderboard();
      renderFixtureList();
      renderResultsEditor();
    });
  });
}

function calculateScore(email) {
  const predictions = state.predictions[email] || {};
  return state.fixtures.reduce(
    (score, fixture) => {
      const prediction = predictions[fixture.id];
      if (prediction) score.predicted += 1;
      if (!prediction || !fixture.result) return score;

      if (prediction.scoreA === fixture.result.scoreA && prediction.scoreB === fixture.result.scoreB) {
        score.points += 5;
        score.exact += 1;
      } else if (isCorrectGoalDifference(prediction, fixture.result)) {
        score.points += 3;
        score.goalDiff += 1;
      } else if (matchOutcome(prediction.scoreA, prediction.scoreB) === matchOutcome(fixture.result.scoreA, fixture.result.scoreB)) {
        score.points += 1;
        score.correct += 1;
      }
      return score;
    },
    { points: 0, exact: 0, goalDiff: 0, correct: 0, predicted: 0 }
  );
}

function getCurrentUser() {
  return state.currentUser ? state.users[state.currentUser] : null;
}

function getPrediction(email, fixtureId) {
  return state.predictions[email]?.[fixtureId] || null;
}

function isFixtureLocked(fixture) {
  return Date.now() >= new Date(fixture.date).getTime();
}

function getPredictionButtonLabel(user, locked, prediction) {
  if (!user) return "Sign in";
  if (locked && prediction) return "Locked";
  if (locked) return "Closed";
  return "Save";
}

function renderAvatar(element, user) {
  element.textContent = "";
  element.style.backgroundImage = user.photo ? `url("${user.photo}")` : "";
  element.classList.toggle("has-photo", Boolean(user.photo));
  if (!user.photo) {
    element.textContent = getInitial(user);
  }
}

function renderAvatarMarkup(user) {
  if (user.photo) {
    return `<span class="avatar avatar-small has-photo" style="background-image: url('${escapeHtml(user.photo)}')" aria-hidden="true"></span>`;
  }
  return `<span class="avatar avatar-small" aria-hidden="true">${escapeHtml(getInitial(user))}</span>`;
}

function getInitial(user) {
  return (user.name || user.email || "?").slice(0, 1).toUpperCase();
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function matchOutcome(scoreA, scoreB) {
  if (scoreA > scoreB) return "A";
  if (scoreB > scoreA) return "B";
  return "D";
}

function formatTeam(team) {
  const flag = FLAG_BY_TEAM[team];
  return flag ? `${flag} ${team}` : team;
}

function formatResult(fixture) {
  if (fixture.result) {
    return `Final score: ${fixture.result.scoreA}-${fixture.result.scoreB}`;
  }
  return isFixtureLocked(fixture) ? "Awaiting final score" : "Result pending";
}

function isCorrectGoalDifference(prediction, result) {
  const predictedOutcome = matchOutcome(prediction.scoreA, prediction.scoreB);
  const actualOutcome = matchOutcome(result.scoreA, result.scoreB);
  const predictedDifference = Math.abs(prediction.scoreA - prediction.scoreB);
  const actualDifference = Math.abs(result.scoreA - result.scoreB);
  return predictedOutcome !== "D" && predictedOutcome === actualOutcome && predictedDifference === actualDifference;
}

function showView(viewName) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector(`#${viewName}View`).classList.add("active");
}

function exportCsv() {
  const lines = [["name", "email", "round", "match", "prediction", "result", "points"]];
  Object.values(state.users).forEach((user) => {
    state.fixtures.forEach((fixture) => {
      const prediction = getPrediction(user.email, fixture.id);
      const points = fixture.result && prediction ? pointsForPrediction(prediction, fixture.result) : "";
      lines.push([
        user.name,
        user.email,
        fixture.round,
        `${formatTeam(fixture.teamA)} vs ${formatTeam(fixture.teamB)}`,
        prediction ? `${prediction.scoreA}-${prediction.scoreB}` : "",
        fixture.result ? `${fixture.result.scoreA}-${fixture.result.scoreB}` : "",
        points
      ]);
    });
  });

  const csv = lines.map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "world-cup-predictions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function pointsForPrediction(prediction, result) {
  if (prediction.scoreA === result.scoreA && prediction.scoreB === result.scoreB) return 5;
  if (isCorrectGoalDifference(prediction, result)) return 3;
  return matchOutcome(prediction.scoreA, prediction.scoreB) === matchOutcome(result.scoreA, result.scoreB) ? 1 : 0;
}

function formatDate(value) {
  const formatted = new Intl.DateTimeFormat(undefined, {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));

  return `${formatted} ${DISPLAY_TIME_ZONE_LABEL}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();

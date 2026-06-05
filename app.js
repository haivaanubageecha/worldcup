const STORAGE_KEY = "worldCupPredictorState";
const APP_DATA_VERSION = "20260603-supabase-source-of-truth-v2";
const DISPLAY_TIME_ZONE = "Indian/Maldives";
const DISPLAY_TIME_ZONE_LABEL = "MVT";
const ADMIN_EMAILS = ["ahmedsimaaz09@gmail.com"];
const APPROVED_EMAILS = [
  "aasifappi@gmail.com",
  "ainth91@gmail.com",
  "ameennu93@gmail.com",
  "assey92@gmail.com",
  "ahmedbych@gmail.com",
  "fezuaminath@gmail.com",
  "gaf963@gmail.com",
  "ilhama.alee@gmail.com",
  "inaa1703@gmail.com",
  "mohdkt2@gmail.com",
  "aminathlamhaa19@gmail.com",
  "luyoonaahassan@gmail.com",
  "samrath6340@gmail.com",
  "siyaanaarahman@gmail.com",
  "aishthai6@gmail.com",
  "zeeshanabdulwahhab@gmail.com",
  "yumnahussein98@gmail.com",
  "ahmedsimaaz09@gmail.com",
  "aaishaa22990@gmail.com",
  "aishathmuasha@gmail.com"
];
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

const FLAG_CODE_BY_TEAM = {
  Algeria: "DZ",
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Belgium: "BE",
  "Bosnia and Herzegovina": "BA",
  Brazil: "BR",
  Canada: "CA",
  "Cabo Verde": "CV",
  "Cape Verde": "CV",
  Colombia: "CO",
  "Cote d'Ivoire": "CI",
  Croatia: "HR",
  Curacao: "CW",
  "Curaçao": "CW",
  Czechia: "CZ",
  "Congo DR": "CD",
  "DR Congo": "CD",
  Ecuador: "EC",
  Egypt: "EG",
  England: "GB-ENG",
  France: "FR",
  Germany: "DE",
  Ghana: "GH",
  Haiti: "HT",
  Iran: "IR",
  Iraq: "IQ",
  "Ivory Coast": "CI",
  Japan: "JP",
  Jordan: "JO",
  Mexico: "MX",
  Morocco: "MA",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Norway: "NO",
  Panama: "PA",
  Paraguay: "PY",
  Portugal: "PT",
  Qatar: "QA",
  "Saudi Arabia": "SA",
  Scotland: "GB-SCT",
  Senegal: "SN",
  "South Africa": "ZA",
  "Korea Republic": "KR",
  "South Korea": "KR",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  Tunisia: "TN",
  Turkiye: "TR",
  Turkey: "TR",
  Türkiye: "TR",
  Uruguay: "UY",
  USA: "US",
  "United States": "US",
  Uzbekistan: "UZ"
};

let state = loadState();
let selectedLeaderboardEmail = null;
let recentlyAddedFixtureId = null;
const backend = {
  client: null,
  ready: false,
  syncing: false,
  loadedShared: false
};

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
const syncStatus = document.querySelector("#syncStatus");

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => showView(tab.dataset.view));
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(loginForm);
  const email = String(form.get("email") || loginForm.querySelector("input[type='email']").value).trim().toLowerCase();
  const name = String(form.get("name") || "").trim() || email.split("@")[0] || "Player";

  if (!isValidEmail(email)) {
    renderSyncStatus("Please enter a valid email address.");
    loginForm.querySelector("input[type='email']").focus();
    return;
  }

  if (!isApprovedEmail(email)) {
    renderSyncStatus("This email is not approved for this league. Please check the spelling or contact the admin.");
    loginForm.querySelector("input[type='email']").focus();
    return;
  }

  state.currentUser = email;
  state.users[email] = state.users[email] || { email, name };
  state.users[email].name = name;
  saveState();
  syncPlayerToBackend(state.users[email]);
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
  syncPlayerToBackend(user);
  render();
});

matchSearch.addEventListener("input", renderMatches);
roundFilter.addEventListener("change", renderMatches);

addResultButton.addEventListener("click", () => {
  if (!isAdminUser()) return;
  resultsEditor.classList.toggle("hidden");
  renderResultsEditor();
});

document.querySelector("#fixturesView").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isAdminUser()) return;
  const form = event.target;
  if (form.id !== "fixtureForm") return;
  const inputs = Array.from(form.querySelectorAll("input"));
  const [teamA, teamB, round, date, venue] = inputs.map((input) => input.value.trim());

  if (!teamA || !teamB || !round || !date || !venue) return;

  const fixture = {
    id: crypto.randomUUID ? crypto.randomUUID() : `m${Date.now()}`,
    teamA,
    teamB,
    round,
    date,
    venue,
    result: null
  };
  state.fixtures.push(fixture);
  recentlyAddedFixtureId = fixture.id;
  form.reset();
  saveState();
  syncFixtureOverrideToBackend(fixture);
  render();
  revealFixture(fixture.id);
  renderSyncStatus("Fixture added. It is saved to the shared database and shown in date order.");
});

exportButton.addEventListener("click", exportCsv);

resetButton.addEventListener("click", async () => {
  if (!isAdminUser()) return;
  if (!confirm("Refresh local cache from shared data? This will not delete database data.")) return;
  const currentUser = state.currentUser;
  state = createInitialState();
  state.currentUser = currentUser;
  saveState();
  render();
  await loadSharedState();
});

function createInitialState() {
  return {
    appVersion: APP_DATA_VERSION,
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
    if (parsed.appVersion !== APP_DATA_VERSION) {
      return createInitialState();
    }
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

function getBackendConfig() {
  return window.WORLD_CUP_BACKEND || {};
}

function isBackendConfigured() {
  const config = getBackendConfig();
  return Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase?.createClient);
}

async function initBackend() {
  if (!isBackendConfigured()) {
    renderSyncStatus();
    return;
  }

  const config = getBackendConfig();
  backend.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  backend.ready = true;
  renderSyncStatus("Connecting to shared database...");

  loadSharedState().catch((error) => {
    console.error(error);
    renderSyncStatus("Shared database connection failed. Local changes are still saved in this browser.");
  });

  window.setInterval(loadSharedState, 30000);
}

async function loadSharedState() {
  if (!backend.ready || backend.syncing) return;

  backend.syncing = true;
  try {
    const [{ data: players, error: playersError }, { data: predictions, error: predictionsError }, { data: results, error: resultsError }] =
      await Promise.all([
        backend.client.from("players").select("*"),
        backend.client.from("predictions").select("*"),
        backend.client.from("results").select("*")
      ]);

    if (playersError || predictionsError || resultsError) {
      throw playersError || predictionsError || resultsError;
    }

    const { data: fixtureOverrides, error: fixtureOverridesError } = await backend.client.from("fixture_overrides").select("*");
    if (fixtureOverridesError) {
      console.warn("Fixture override table is not ready yet.", fixtureOverridesError);
    }

    applySharedRows({ players, predictions, results, fixtureOverrides: fixtureOverrides || [] });
    backend.loadedShared = true;
    saveState();
    render();
    renderSyncStatus();
  } catch (error) {
    console.error(error);
    renderSyncStatus("Shared database connection failed. Local changes are still saved in this browser.");
  } finally {
    backend.syncing = false;
  }
}

function applySharedRows({ players = [], predictions = [], results = [], fixtureOverrides = [] }) {
  state.users = {};
  state.predictions = {};

  players.forEach((player) => {
    state.users[player.email] = {
      email: player.email,
      name: player.name,
      photo: player.photo || ""
    };
  });

  predictions.forEach((prediction) => {
    state.predictions[prediction.email] = state.predictions[prediction.email] || {};
    state.predictions[prediction.email][prediction.fixture_id] = {
      scoreA: prediction.score_a,
      scoreB: prediction.score_b,
      savedAt: prediction.saved_at
    };
  });

  const resultByFixture = new Map(results.map((result) => [result.fixture_id, result]));
  const overrideByFixture = new Map(fixtureOverrides.map((override) => [override.fixture_id, override]));
  const officialFixtures = cloneOfficialFixtures();
  const officialFixtureIds = new Set(officialFixtures.map((fixture) => fixture.id));

  state.fixtures = officialFixtures.map((fixture) => {
    const result = resultByFixture.get(fixture.id);
    const override = overrideByFixture.get(fixture.id);
    return {
      ...fixture,
      teamA: override?.team_a || fixture.teamA,
      teamB: override?.team_b || fixture.teamB,
      round: override?.round || fixture.round,
      venue: override?.venue || fixture.venue,
      date: override?.kickoff_at || fixture.date,
      result: result
        ? {
            scoreA: result.score_a,
            scoreB: result.score_b
          }
        : fixture.result
    };
  });

  fixtureOverrides
    .filter((override) => !officialFixtureIds.has(override.fixture_id))
    .forEach((override) => {
      const result = resultByFixture.get(override.fixture_id);
      state.fixtures.push({
        id: override.fixture_id,
        teamA: override.team_a || "Team A",
        teamB: override.team_b || "Team B",
        round: override.round || "Custom fixture",
        venue: override.venue || "",
        date: override.kickoff_at || new Date().toISOString(),
        result: result
          ? {
              scoreA: result.score_a,
              scoreB: result.score_b
            }
          : null
      });
    });
}

async function syncPlayerToBackend(user) {
  if (!backend.ready || !backend.loadedShared || !user?.email) return;

  const { error } = await backend.client.from("players").upsert(
    {
      email: user.email,
      name: user.name || user.email.split("@")[0],
      photo: user.photo || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "email" }
  );
  if (error) console.error(error);
}

async function syncPredictionToBackend(email, fixtureId, prediction) {
  if (!backend.ready || !backend.loadedShared || !email || !prediction) return;

  await syncPlayerToBackend(state.users[email] || { email, name: email.split("@")[0] });
  const { error } = await backend.client.from("predictions").upsert(
    {
      email,
      fixture_id: fixtureId,
      score_a: prediction.scoreA,
      score_b: prediction.scoreB,
      saved_at: prediction.savedAt || new Date().toISOString()
    },
    { onConflict: "email,fixture_id" }
  );
  if (error) console.error(error);
}

async function syncResultToBackend(fixture) {
  if (!backend.ready || !backend.loadedShared || !fixture?.result) return;

  const { error } = await backend.client.from("results").upsert(
    {
      fixture_id: fixture.id,
      score_a: fixture.result.scoreA,
      score_b: fixture.result.scoreB,
      updated_at: new Date().toISOString()
    },
    { onConflict: "fixture_id" }
  );
  if (error) console.error(error);
}

async function syncFixtureOverrideToBackend(fixture) {
  if (!backend.ready || !fixture?.id || !isAdminUser()) return;
  const kickoff = new Date(fixture.date);

  const { error } = await backend.client.from("fixture_overrides").upsert(
    {
      fixture_id: fixture.id,
      team_a: fixture.teamA,
      team_b: fixture.teamB,
      round: fixture.round,
      venue: fixture.venue,
      kickoff_at: Number.isNaN(kickoff.getTime()) ? new Date().toISOString() : kickoff.toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "fixture_id" }
  );
  if (error) console.error(error);
}

function cloneOfficialFixtures() {
  return WORLD_CUP_FIXTURES.map((fixture) => ({ ...fixture, result: fixture.result ? { ...fixture.result } : null }));
}

function syncOfficialFixtures(nextState) {
  const hasDemoFixtures = nextState.fixtures.some((fixture) => fixture.teamB === "Team TBD" || String(fixture.round).startsWith("Sample"));
  const needsOfficialFixtures = nextState.fixtureSetVersion !== WORLD_CUP_FIXTURES_VERSION || hasDemoFixtures;

  if (needsOfficialFixtures) {
    const existingResults = new Map(nextState.fixtures.map((fixture) => [fixture.id, fixture.result]).filter(([, result]) => result));
    const officialFixtureIds = new Set(WORLD_CUP_FIXTURES.map((fixture) => fixture.id));
    const customFixtures = nextState.fixtures.filter((fixture) => !officialFixtureIds.has(fixture.id) && !String(fixture.round).startsWith("Sample"));
    nextState.fixtures = cloneOfficialFixtures().map((fixture) => ({
      ...fixture,
      result: existingResults.get(fixture.id) || fixture.result
    })).concat(customFixtures);
    nextState.fixtureSetVersion = WORLD_CUP_FIXTURES_VERSION;
  }
}

function render() {
  renderSyncStatus();
  renderSession();
  renderRoundFilter();
  renderMatches();
  renderLeaderboard();
  renderFixtureList();
  renderResultsEditor();
}

function renderSyncStatus(message) {
  if (!syncStatus) return;
  if (message) {
    syncStatus.textContent = message;
    return;
  }
  syncStatus.textContent = backend.ready
    ? "Shared mode: players, predictions, and results sync to the database."
    : "Local mode: predictions are stored in this browser until backend config is added.";
}

function renderSession() {
  const user = getCurrentUser();
  loginPanel.classList.toggle("hidden", Boolean(user));
  profilePanel.classList.toggle("hidden", !user);
  addResultButton.classList.toggle("hidden", !isAdminUser());
  resetButton.classList.toggle("hidden", !isAdminUser());
  document.querySelector(".fixture-editor")?.classList.toggle("hidden", !isAdminUser());

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
    card.querySelector(".team-a").innerHTML = formatTeamHtml(fixture.teamA);
    card.querySelector(".team-b").innerHTML = formatTeamHtml(fixture.teamB);
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
      syncPredictionToBackend(user.email, fixture.id, state.predictions[user.email][fixture.id]);
      renderLeaderboard();
    });
    matchesList.append(card);
  });
}

function renderLeaderboard() {
  selectedLeaderboardEmail = null;
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
    `;

  leaderboard.querySelectorAll(".leader-row").forEach((row) => {
    row.addEventListener("click", () => {
      togglePlayerPredictions(row);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePlayerPredictions(row);
      }
    });
  });
}

function togglePlayerPredictions(row) {
  const email = row.dataset.email;
  const wasOpen = row.classList.contains("selected");
  closePlayerPredictions();
  if (wasOpen) return;

  selectedLeaderboardEmail = email;
  row.classList.add("selected");
  row.insertAdjacentHTML("afterend", `<div id="playerPredictions" class="player-predictions">${renderPlayerPredictionsMarkup(email)}</div>`);
}

function closePlayerPredictions() {
  selectedLeaderboardEmail = null;
  leaderboard.querySelectorAll(".leader-row").forEach((row) => row.classList.remove("selected"));
  document.querySelector("#playerPredictions")?.remove();
}

function renderPlayerPredictionsMarkup(email) {
  const user = state.users[email];
  if (!user) {
    return "";
  }

  const predictions = state.predictions[user.email] || {};
  const predictedFixtures = state.fixtures
    .filter((fixture) => predictions[fixture.id] && (isFixtureLocked(fixture) || fixture.result))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!predictedFixtures.length) {
    return `
      <div class="player-predictions-head">
        ${renderAvatarMarkup(user)}
        <div>
          <strong>${escapeHtml(user.name)}</strong>
          <span>No past predictions available yet.</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="player-predictions-head">
      ${renderAvatarMarkup(user)}
      <div>
        <strong>${escapeHtml(user.name)}'s predictions</strong>
        <span>Only predictions for matches that have started are shown.</span>
      </div>
    </div>
    <div class="prediction-detail-list">
      ${predictedFixtures.map((fixture) => renderPredictionDetailRow(fixture, predictions[fixture.id])).join("")}
    </div>
  `;
}

function renderPredictionDetailRow(fixture, prediction) {
  const canShowPrediction = isFixtureLocked(fixture) || fixture.result;
  const outcome = fixture.result && canShowPrediction ? getPredictionOutcome(prediction, fixture.result) : { key: "pending", points: "-" };
  const predictionText = canShowPrediction ? `${prediction.scoreA}-${prediction.scoreB}` : "Hidden until kickoff";
  const resultText = fixture.result ? `${fixture.result.scoreA}-${fixture.result.scoreB}` : "Pending";

  return `
    <div class="prediction-detail-row outcome-${outcome.key}">
      <div>
        <strong>${formatTeamHtml(fixture.teamA)} vs ${formatTeamHtml(fixture.teamB)}</strong>
        <span>${escapeHtml(fixture.round)} · ${formatDate(fixture.date)}</span>
      </div>
      <div><span>Prediction</span><strong>${escapeHtml(predictionText)}</strong></div>
      <div><span>Result</span><strong>${escapeHtml(resultText)}</strong></div>
      <div><span>Points</span><strong>${outcome.points}</strong></div>
    </div>
  `;
}

function renderResultsEditor() {
  if (resultsEditor.classList.contains("hidden")) return;
  if (!isAdminUser()) {
    resultsEditor.innerHTML = "";
    resultsEditor.classList.add("hidden");
    return;
  }

  resultsEditor.innerHTML = state.fixtures
    .map((fixture) => {
      const result = fixture.result || {};
      return `
        <form class="result-row" data-fixture-id="${fixture.id}">
          <strong>${formatTeamHtml(fixture.teamA)} vs ${formatTeamHtml(fixture.teamB)}</strong>
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
      syncResultToBackend(fixture);
      renderLeaderboard();
    });
  });
}

function renderFixtureList() {
  const canEditResults = isAdminUser();
  fixtureList.innerHTML = state.fixtures
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(
      (fixture) => `
        <form class="fixture-row ${fixture.id === recentlyAddedFixtureId ? "fixture-row-new" : ""}" data-fixture-id="${fixture.id}">
          ${canEditResults ? renderEditableFixtureTeams(fixture) : `<strong>${formatTeamHtml(fixture.teamA)} vs ${formatTeamHtml(fixture.teamB)}</strong>`}
          <span>${escapeHtml(fixture.round)}</span>
          <span>${formatDate(fixture.date)}</span>
          ${canEditResults ? renderEditableFixtureResult(fixture) : renderReadOnlyFixtureResult(fixture)}
          <span>${escapeHtml(fixture.venue)}</span>
        </form>
      `
    )
    .join("");

  fixtureList.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isAdminUser()) return;
      const fixture = state.fixtures.find((item) => item.id === form.dataset.fixtureId);
      const teamAInput = form.querySelector(".fixture-team-a");
      const teamBInput = form.querySelector(".fixture-team-b");
      const [scoreAInput, scoreBInput] = form.querySelectorAll(".fixture-score");
      if (fixture && teamAInput && teamBInput) {
        fixture.teamA = teamAInput.value.trim() || fixture.teamA;
        fixture.teamB = teamBInput.value.trim() || fixture.teamB;
      }
      const scoreA = Number(scoreAInput.value);
      const scoreB = Number(scoreBInput.value);
      if (!fixture) return;

      if (scoreAInput.value !== "" || scoreBInput.value !== "") {
        if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) return;
        fixture.result = { scoreA, scoreB };
        syncResultToBackend(fixture);
      }

      saveState();
      syncFixtureOverrideToBackend(fixture);
      renderMatches();
      renderLeaderboard();
      renderFixtureList();
      renderResultsEditor();
    });
  });
}

function revealFixture(fixtureId) {
  window.setTimeout(() => {
    const row = fixtureList.querySelector(`[data-fixture-id="${CSS.escape(fixtureId)}"]`);
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      if (recentlyAddedFixtureId === fixtureId) {
        recentlyAddedFixtureId = null;
        row.classList.remove("fixture-row-new");
      }
    }, 4500);
  }, 50);
}

function renderEditableFixtureTeams(fixture) {
  return `
    <div class="fixture-team-editor">
      <input class="fixture-team-a" type="text" value="${escapeHtml(fixture.teamA)}" aria-label="Team A name" />
      <span>vs</span>
      <input class="fixture-team-b" type="text" value="${escapeHtml(fixture.teamB)}" aria-label="Team B name" />
    </div>
  `;
}

function renderEditableFixtureResult(fixture) {
  return `
    <div class="fixture-result">
      <input class="fixture-score" type="number" min="0" max="20" value="${fixture.result?.scoreA ?? ""}" aria-label="${escapeHtml(fixture.teamA)} final score" />
      <span>:</span>
      <input class="fixture-score" type="number" min="0" max="20" value="${fixture.result?.scoreB ?? ""}" aria-label="${escapeHtml(fixture.teamB)} final score" />
      <button type="submit">Update</button>
    </div>
  `;
}

function renderReadOnlyFixtureResult(fixture) {
  return `<strong class="fixture-result-readonly">${fixture.result ? `${fixture.result.scoreA}-${fixture.result.scoreB}` : "Pending"}</strong>`;
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

function isAdminUser() {
  return ADMIN_EMAILS.includes(String(state.currentUser || "").toLowerCase());
}

function isApprovedEmail(email) {
  return APPROVED_EMAILS.includes(String(email || "").toLowerCase());
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
  const flag = getFlagForTeam(team);
  return flag ? `${flag} ${team}` : team;
}

function formatTeamHtml(team) {
  const code = FLAG_CODE_BY_TEAM[team];
  if (!code) return escapeHtml(team);

  const imageCode = code.toLowerCase();
  return `
    <span class="team-label">
      <img class="country-flag" src="https://flagcdn.com/${imageCode}.svg" alt="" loading="lazy" />
      <span>${escapeHtml(team)}</span>
    </span>
  `;
}

function getFlagForTeam(team) {
  const code = FLAG_CODE_BY_TEAM[team];
  if (!code) return "";
  if (code === "GB-ENG") return subdivisionFlag("eng");
  if (code === "GB-SCT") return subdivisionFlag("sct");
  return code
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65))
    .join("");
}

function subdivisionFlag(tag) {
  const blackFlag = String.fromCodePoint(0x1f3f4);
  const tagLetters = `gb${tag}`
    .split("")
    .map((letter) => String.fromCodePoint(0xe0000 + letter.charCodeAt(0)))
    .join("");
  const cancelTag = String.fromCodePoint(0xe007f);
  return `${blackFlag}${tagLetters}${cancelTag}`;
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
  return getPredictionOutcome(prediction, result).points;
}

function getPredictionOutcome(prediction, result) {
  if (prediction.scoreA === result.scoreA && prediction.scoreB === result.scoreB) {
    return { key: "exact", points: 5 };
  }
  if (isCorrectGoalDifference(prediction, result)) {
    return { key: "goal-diff", points: 3 };
  }
  if (matchOutcome(prediction.scoreA, prediction.scoreB) === matchOutcome(result.scoreA, result.scoreB)) {
    return { key: "result", points: 1 };
  }
  return { key: "wrong", points: 0 };
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
initBackend();

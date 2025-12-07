/* ---------------------------------------------------
    PAGE NAVIGATION
---------------------------------------------------- */

const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
// === LIVE PIPELINE VARIABLES ===
let liveURL = localStorage.getItem("pipelineURL") || null;
let eventSource = null;

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const view = item.dataset.view;

    // Update sidebar state
    navItems.forEach((n) => n.classList.remove("nav-item-active"));
    item.classList.add("nav-item-active");

    // Update visible page
    views.forEach((v) => v.classList.remove("view-active"));
    document.getElementById(`view-${view}`).classList.add("view-active");
  });
});

/* ---------------------------------------------------
    REAL-TIME EVENT ENGINE
    (Currently local stream – plug in EasyConnect → N8N later)
---------------------------------------------------- */

// When you're ready to switch to live pipeline, set this to true
// and call your EasyConnect / N8N endpoint inside pullFromLivePipeline().
const USE_LIVE_PIPELINE = false;
// const LIVE_PIPELINE_URL = "https://your-render-backend/api/events"; // example placeholder

// UI bindings
const activityList = document.getElementById("activity-list");
const statTotalOrders = document.getElementById("stat-total-orders");
const statLatency = document.getElementById("stat-latency");
const statVolume = document.getElementById("stat-volume");

// Supported method names (you can replace/extend using your real Qubic methods)
const AVAILABLE_METHODS = [
  "AddBidOrder",
  "CancelBidOrder",
  "FillBidOrder",
  "AddAskOrder",
];

// Local in-memory event stream
let eventStream = {
  totalOrders: 12487,
  volume: 3.42, // in millions QUBIC
  latency: 184,
  activity: [], // { id, sender, amount, timeAgo, method }
};

/* ---------------------------------------------------
    Utility: Random hex generator for wallet previews
---------------------------------------------------- */
function randomHex(len) {
  let chars = "abcdef0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/* ---------------------------------------------------
    Create a new event object
    (structure is compatible with real pipeline too)
---------------------------------------------------- */
function generateEvent() {
  const id = 12000 + eventStream.activity.length + 1;
  const sender = "0x" + randomHex(4) + "..." + randomHex(4);
  const amount = Math.floor(1000 + Math.random() * 600);
  const timeAgo = Math.floor(Math.random() * 8) + " sec ago";

  const method =
    AVAILABLE_METHODS[Math.floor(Math.random() * AVAILABLE_METHODS.length)];

  return { id, sender, amount, timeAgo, method };
}

/* ---------------------------------------------------
    Handle a new incoming event
    (works for both local generator and real API)
---------------------------------------------------- */
function handleNewEvent(ev) {
  // Add to top
  eventStream.activity.unshift(ev);

  // Keep list limited
  if (eventStream.activity.length > 12) eventStream.activity.pop();

  // Update stats (here you can later use real values from ev)
  eventStream.totalOrders++;
  eventStream.volume += Math.random() * 0.01;
  eventStream.latency = Math.floor(150 + Math.random() * 80);

  updateStatsUI();
  renderActivityUI();

  // Feed fraud engine
  fraudEngineOnNewEvent(ev);
  pushNotification(`${ev.method} event detected from ${ev.sender}`);

}

/* ---------------------------------------------------
    Local generator tick
---------------------------------------------------- */
function pushNewEvent() {
  const event = generateEvent();
  handleNewEvent(event);
}

/* ---------------------------------------------------
    (Optional) Live pipeline hook
    When you have a backend returning latest events, map it into
    the { id, sender, amount, timeAgo, method } format and call handleNewEvent().
---------------------------------------------------- */
// async function pullFromLivePipeline() {
//   try {
//     const res = await fetch(LIVE_PIPELINE_URL);
//     const data = await res.json();
//     // Example mapping – adjust to your real payload:
//     const ev = {
//       id: data.id,
//       sender: data.sender,
//       amount: data.amount,
//       timeAgo: data.timeAgoLabel,
//       method: data.methodName,
//     };
//     handleNewEvent(ev);
//   } catch (e) {
//     console.error("Live pipeline fetch failed:", e);
//   }
// }

/* ---------------------------------------------------
    Update metric cards
---------------------------------------------------- */
function updateStatsUI() {
  statTotalOrders.textContent = eventStream.totalOrders.toLocaleString();
  statLatency.textContent = eventStream.latency + " ms";
  statVolume.textContent = eventStream.volume.toFixed(2) + " M QUBIC";
}

/* ---------------------------------------------------
    Render activity feed UI
---------------------------------------------------- */
function renderActivityUI() {
  if (!activityList) return;
  activityList.innerHTML = "";

  eventStream.activity.forEach((ev) => {
    const row = document.createElement("div");
    row.className = "activity-item";

    row.innerHTML = `
      <div>
        <div class="activity-title">${ev.method} • #${ev.id}</div>
        <div class="activity-sub">
          ${ev.sender} • ${ev.amount} QUBIC
        </div>
      </div>
      <div class="activity-time">${ev.timeAgo}</div>
    `;

    activityList.appendChild(row);
  });
}

/* ---------------------------------------------------
    Initialize with starter events
---------------------------------------------------- */
for (let i = 0; i < 5; i++) {
  eventStream.activity.push(
    generateEvent()
  );
}
renderActivityUI();
updateStatsUI();

/* ---------------------------------------------------
    Periodic updates
---------------------------------------------------- */
setInterval(() => {
  if (USE_LIVE_PIPELINE) {
    // pullFromLivePipeline(); // uncomment when live endpoint is ready
  } else {
    pushNewEvent();
  }
}, 5000);

/* ---------------------------------------------------
   TRANSACTIONS TABLE LOGIC
---------------------------------------------------- */

let txData = [];
let txPage = 1;
const txPerPage = 5;

// Elements
const txBody = document.getElementById("tx-table-body");
const txSearch = document.getElementById("tx-search");
const txSortBtn = document.getElementById("tx-sort-amount");
const txPrev = document.getElementById("tx-prev");
const txNext = document.getElementById("tx-next");
const txPageIndicator = document.getElementById("tx-page-indicator");

// Convert activity -> table-ready format
function rebuildTxData() {
  txData = eventStream.activity.map((ev) => ({
    id: ev.id,
    sender: ev.sender,
    amount: ev.amount,
    timestamp: ev.timeAgo,
    method: ev.method,
  }));
}

// Render transactions table
function renderTxTable() {
  if (!txBody || !txPageIndicator) return;

  rebuildTxData();

  const query = txSearch ? txSearch.value.toLowerCase() : "";
  let filtered = txData.filter(
    (tx) =>
      tx.sender.toLowerCase().includes(query) ||
      tx.id.toString().includes(query)
  );

  // Pagination
  const start = (txPage - 1) * txPerPage;
  const paginated = filtered.slice(start, start + txPerPage);

  txPageIndicator.textContent = `Page ${txPage}`;

  txBody.innerHTML = "";
  paginated.forEach((tx) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${tx.id}</td>
      <td>${tx.sender}</td>
      <td>${tx.amount} QUBIC</td>
      <td>${tx.timestamp}</td>
    `;

    txBody.appendChild(tr);
  });
}

// Search
if (txSearch) {
  txSearch.addEventListener("input", () => {
    txPage = 1;
    renderTxTable();
  });
}

// Sort by amount
let sortAscending = true;
if (txSortBtn) {
  txSortBtn.addEventListener("click", () => {
    sortAscending = !sortAscending;

    eventStream.activity.sort((a, b) =>
      sortAscending ? a.amount - b.amount : b.amount - a.amount
    );

    renderTxTable();
  });
}

// Pagination
if (txPrev) {
  txPrev.addEventListener("click", () => {
    if (txPage > 1) {
      txPage--;
      renderTxTable();
    }
  });
}

if (txNext) {
  txNext.addEventListener("click", () => {
    txPage++;
    renderTxTable();
  });
}

// Auto-refresh table
setInterval(renderTxTable, 2000);

// Initial load
renderTxTable();

/* ============================================================
   ADVANCED FRAUD DETECTION ENGINE
   - Suspicious wallet detection
   - Frequency analysis
   - Volume anomaly detection
   - Risk scoring
   - Powers full Fraud page + mini widget
============================================================ */

/* DOM elements for fraud UI */
const fraudWalletList = document.getElementById("fraud-wallet-list");
const fraudRiskScore = document.getElementById("fraud-risk-score");
const fraudRiskDesc = document.getElementById("fraud-risk-desc");
const fraudMiniScore = document.getElementById("fraud-mini-score");
const fraudMiniStatus = document.getElementById("fraud-mini-status");
const fraudTableBody = document.getElementById("fraud-table-body");

/* Internal fraud model data */
let fraudModel = {
  suspiciousWallets: [],
  anomalies: [],
  riskScore: 12, // default % risk
};

/* Utility: generate severity color */
function severityColor(level) {
  switch (level) {
    case "LOW":
      return "#00ffe0";
    case "MEDIUM":
      return "#e5ff5e";
    case "HIGH":
      return "#ff9f3c";
    case "CRITICAL":
      return "#ff4e4e";
    default:
      return "#00ffe0";
  }
}

/* ---- 1) Detect suspicious wallet patterns ---- */
function detectWalletAnomalies(event) {
  const { sender, amount } = event;

  // Condition 1: Very high bid compared to normal range
  if (amount > 1550) {
    fraudModel.suspiciousWallets.push({
      sender,
      reason: "Unusually large bid amount",
      severity: "HIGH",
    });
  }

  // Condition 2: Same wallet appearing too frequently
  let freq = fraudModel.suspiciousWallets.filter(
    (w) => w.sender === sender
  ).length;
  if (freq >= 3) {
    fraudModel.suspiciousWallets.push({
      sender,
      reason: "High-frequency repeated activity",
      severity: "CRITICAL",
    });
  }
}

/* ---- 2) Detect event anomalies ---- */
function detectEventAnomalies(event) {
  const { id, amount, sender, method } = event;

  let anomaly = null;

  if (amount > 1500) {
    anomaly = {
      id,
      type: "Volume Spike",
      sender,
      severity: "HIGH",
      details: `Bid amount unusually high: ${amount} QUBIC (${method})`,
    };
  }

  // Rare event: sender hex pattern begins with "0x0"
  if (sender.startsWith("0x0")) {
    anomaly = {
      id,
      type: "Pattern Anomaly",
      sender,
      severity: anomaly?.severity || "MEDIUM",
      details: `Wallet starts with rare pattern '0x0'`,
    };
  }

  if (anomaly) fraudModel.anomalies.unshift(anomaly);

  // keep table small
  if (fraudModel.anomalies.length > 12) fraudModel.anomalies.pop();
}

/* ---- 3) Risk scoring model ---- */
function updateRiskScore() {
  let base = 10;

  let high = fraudModel.suspiciousWallets.filter(
    (w) => w.severity === "HIGH"
  ).length;
  let critical = fraudModel.suspiciousWallets.filter(
    (w) => w.severity === "CRITICAL"
  ).length;

  base += high * 5;
  base += critical * 12;

  // Cap max
  if (base > 95) base = 95;

  fraudModel.riskScore = base;
}

/* ---- 4) Update Fraud UI ---- */
function renderFraudUI() {
  /* ------------ Suspicious Wallets Panel ------------ */
  if (fraudWalletList) {
    fraudWalletList.innerHTML = "";

    fraudModel.suspiciousWallets.slice(-6).forEach((w) => {
      const item = document.createElement("div");
      item.className = "activity-item";

      item.innerHTML = `
        <div>
          <div class="activity-title">${w.sender}</div>
          <div class="activity-sub">${w.reason}</div>
        </div>
        <div style="color:${severityColor(w.severity)};">${w.severity}</div>
      `;

      fraudWalletList.appendChild(item);
    });
  }

  /* ------------ Big risk score ------------ */
  if (fraudRiskScore) fraudRiskScore.textContent = fraudModel.riskScore + "%";

  if (fraudRiskDesc) {
    fraudRiskDesc.textContent =
      fraudModel.riskScore < 25
        ? "Low risk • System activity normal."
        : fraudModel.riskScore < 50
        ? "Moderate risk • Irregular patterns detected."
        : fraudModel.riskScore < 75
        ? "High risk • Multiple anomalies detected."
        : "Critical risk • Severe suspicious activity.";
  }

  /* ------------ Mini Fraud widget ------------ */
  if (fraudMiniScore) fraudMiniScore.textContent = fraudModel.riskScore + "%";

  if (fraudMiniStatus) {
    fraudMiniStatus.textContent =
      fraudModel.riskScore < 25
        ? "Normal activity"
        : fraudModel.riskScore < 50
        ? "Irregular patterns"
        : fraudModel.riskScore < 75
        ? "High risk"
        : "CRITICAL RISK";
  }

  /* ------------ Anomaly table ------------ */
  if (fraudTableBody) {
    fraudTableBody.innerHTML = "";

    fraudModel.anomalies.forEach((a) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${a.id}</td>
        <td>${a.type}</td>
        <td>${a.sender}</td>
        <td style="color:${severityColor(a.severity)};">${a.severity}</td>
        <td>${a.details}</td>
      `;

      fraudTableBody.appendChild(tr);
    });
  }
}

/* ---- 5) Hook engine to every NEW event ---- */
function fraudEngineOnNewEvent(ev) {
  detectWalletAnomalies(ev);
  detectEventAnomalies(ev);
  updateRiskScore();
  renderFraudUI();
}

// Initial render for fraud widgets
renderFraudUI();
/* ---------------------------------------------------
   ANALYTICS PAGE — LINE + BAR CHARTS
---------------------------------------------------- */

// Canvas references
const lineCtx = document.getElementById("lineChart")?.getContext("2d");
const barCtx = document.getElementById("barChart")?.getContext("2d");

// Fallback if user not on Analytics tab yet
if (lineCtx && barCtx) {
  
  /* ---------------- LINE CHART ---------------- */
  const lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: [], // timestamps
      datasets: [{
        label: "Bid Volume (QUBIC)",
        data: [],
        borderColor: "#00ffc0",
        backgroundColor: "rgba(0,255,200,0.1)",
        borderWidth: 2,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#cafff4" } } },
      scales: {
        x: { ticks: { color: "#aafff7" } },
        y: { ticks: { color: "#aafff7" } }
      }
    }
  });

  /* ---------------- BAR CHART ---------------- */
  const barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Total Volume per Sender",
        data: [],
        backgroundColor: "rgba(0,255,200,0.4)",
        borderColor: "#00ffc0",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#cafff4" } } },
      scales: {
        x: { ticks: { color: "#aafff7" } },
        y: { ticks: { color: "#aafff7" } }
      }
    }
  });

  /* ---------------- UPDATE CHART DATA ---------------- */
  function updateCharts() {
    const now = new Date().toLocaleTimeString();

    // Update line chart
    lineChart.data.labels.push(now);
    lineChart.data.datasets[0].data.push(eventStream.volume);

    if (lineChart.data.labels.length > 20) {
      lineChart.data.labels.shift();
      lineChart.data.datasets[0].data.shift();
    }

    lineChart.update();

    // Aggregate volume per sender
    const volumeMap = {};
    eventStream.activity.forEach(ev => {
      if (!volumeMap[ev.sender]) volumeMap[ev.sender] = 0;
      volumeMap[ev.sender] += ev.amount;
    });

    barChart.data.labels = Object.keys(volumeMap).slice(0, 5);
    barChart.data.datasets[0].data = Object.values(volumeMap).slice(0, 5);

    barChart.update();
  }

  // Update charts every 5 seconds
  setInterval(updateCharts, 5000);
}
let overviewChart;

function buildOverviewChart() {
  const ctx = document.getElementById("overviewChart");

  if (!ctx) return;

  // Destroy old chart if needed
  if (overviewChart) overviewChart.destroy();

  overviewChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["5m", "4m", "3m", "2m", "1m", "Now"],
      datasets: [
        {
          label: "Bid Volume",
          data: eventStream.activity.map(ev => ev.amount),
          borderColor: "#00ffe0",
          backgroundColor: "rgba(0,255,200,0.1)",
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#66fff0" } },
        y: { ticks: { color: "#66fff0" } },
      },
    },
  });
}
document.querySelector('[data-view="overview"]').addEventListener("click", () => {
  setTimeout(() => {
    if (overviewChart) overviewChart.resize();
  }, 200);
});



// SETTINGS: Save pipeline URL
document.getElementById("save-pipeline")?.addEventListener("click", () => {
  const url = document.getElementById("pipeline-url").value;
  if (!url) return alert("Please enter a valid URL.");

  localStorage.setItem("pipelineURL", url);
  alert("Pipeline URL saved!");
});
const notifBtn = document.querySelector(".notification-button");
const notifPanel = document.getElementById("notif-panel");
const notifList = document.getElementById("notif-list");

// Toggle dropdown
notifBtn.addEventListener("click", () => {
  notifPanel.classList.toggle("hidden");
  document.querySelector(".notif-dot").style.display = "none";
});

// Add a notification
function pushNotification(text) {
  const div = document.createElement("div");
  div.className = "notif-item";
  div.textContent = text;
  notifList.prepend(div);

  // show red dot
  document.querySelector(".notif-dot").style.display = "block";
}
/* ---------------------------------------------------
   PIPELINE FLOW ANIMATION (EasyConnect → n8n → Render → Dashboard)
---------------------------------------------------- */
const pipelineNodes = document.querySelectorAll(".pipeline-node");

if (pipelineNodes.length) {
  let pipelineIndex = 0;

  setInterval(() => {
    pipelineNodes.forEach((n, i) => {
      n.classList.toggle("active", i === pipelineIndex);
    });
    pipelineIndex = (pipelineIndex + 1) % pipelineNodes.length;
  }, 900); // speed of the glowing “packet”
}
/* ---------------------------------------------------
   GAMIFIED LEADERBOARD DATA
---------------------------------------------------- */

const leaderboardBody = document.getElementById("leaderboard-body");
const leaderboardSummaryEl = document.getElementById("leaderboard-summary");

if (leaderboardBody && leaderboardSummaryEl) {
  // mock leaderboard data – you can tweak these values
  const leaderboardData = [
    {
      wallet: "0x5a82...c3d1",
      volume: 32540,
      trades: 51,
      level: 18,
      xp: 7420,
      badge: "Whale"
    },
    {
      wallet: "0x9bd0...aa71",
      volume: 21980,
      trades: 39,
      level: 15,
      xp: 6120,
      badge: "On-chain Legend"
    },
    {
      wallet: "0x0d34...78fe",
      volume: 18420,
      trades: 33,
      level: 13,
      xp: 5540,
      badge: "On Radar"
    },
    {
      wallet: "0x3c8f...12ab",
      volume: 15670,
      trades: 27,
      level: 11,
      xp: 4980,
      badge: "Steady Trader"
    },
    {
      wallet: "0x7e99...4fa2",
      volume: 12210,
      trades: 22,
      level: 10,
      xp: 4310,
      badge: "Explorer"
    }
  ];

  function badgeClass(badge) {
    if (badge.includes("Whale")) return "lb-badge lb-badge-whale";
    if (badge.includes("Legend")) return "lb-badge lb-badge-legit";
    if (badge.includes("Radar")) return "lb-badge lb-badge-radar";
    return "lb-badge";
  }

  function renderLeaderboard() {
    leaderboardBody.innerHTML = "";

    leaderboardData.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${row.wallet}</td>
        <td>Lv. ${row.level}</td>
        <td>${row.xp.toLocaleString()}</td>
        <td>${row.volume.toLocaleString()} QUBIC</td>
        <td>${row.trades}</td>
        <td>
          <span class="${badgeClass(row.badge)}">
            ${row.badge.includes("Whale") ? "🐋" : row.badge.includes("Legend") ? "🏆" : "👀"}
            <span>${row.badge}</span>
          </span>
        </td>
      `;
      leaderboardBody.appendChild(tr);
    });

    renderLeaderboardSummary();
  }

  function renderLeaderboardSummary() {
    const totalVolume = leaderboardData.reduce((s, r) => s + r.volume, 0);
    const avgLevel =
      leaderboardData.reduce((s, r) => s + r.level, 0) / leaderboardData.length;

    leaderboardSummaryEl.innerHTML = `
      <div class="lb-summary-card">
        <div class="lb-summary-label">Total Leaderboard Volume</div>
        <div class="lb-summary-value">${totalVolume.toLocaleString()} QUBIC</div>
        <div class="lb-chip">Top 5 wallets only</div>
      </div>

      <div class="lb-summary-card">
        <div class="lb-summary-label">Average Player Level</div>
        <div class="lb-summary-value">Lv. ${avgLevel.toFixed(1)}</div>
        <div class="lb-chip">Gamified engagement score</div>
      </div>

      <div class="lb-summary-card">
        <div class="lb-summary-label">Whale Presence</div>
        <div class="lb-summary-value">${
          leaderboardData[0].badge.includes("Whale") ? "High" : "Moderate"
        }</div>
        <div class="lb-chip">Top wallet flagged as Whale</div>
      </div>

      <div class="lb-summary-card">
        <div class="lb-summary-label">On-chain Health</div>
        <div class="lb-summary-value">Stable</div>
        <div class="lb-chip">No critical fraud spikes detected</div>
      </div>
    `;
  }

  renderLeaderboard();
}
// === SAVE PIPELINE URL ===
document.getElementById("save-pipeline").addEventListener("click", () => {
  const url = document.getElementById("pipeline-url").value.trim();

  if (!url) {
    alert("Please enter a valid Pipeline URL");
    return;
  }

  localStorage.setItem("pipelineURL", url);
  liveURL = url;

  connectToLivePipeline();

  alert("Pipeline connected successfully!");
});

// Load previous saved pipeline URL on startup
if (liveURL) {
  const box = document.getElementById("pipeline-url");
  if (box) box.value = liveURL;

  connectToLivePipeline();
}
// === CONNECT TO LIVE PIPELINE (SSE) ===
function connectToLivePipeline() {
  if (!liveURL) return;

  // Close previous connection
  if (eventSource) eventSource.close();

  console.log("Connecting to:", liveURL);

  eventSource = new EventSource(liveURL);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Live Event:", data);
      handleIncomingEvent(data);
    } catch (err) {
      console.error("Invalid event received:", event.data);
    }
  };

  eventSource.onerror = (err) => {
    console.warn("Pipeline disconnected:", err);
  };
}
// === ROUTE LIVE EVENTS TO DASHBOARD MODULES ===
function handleIncomingEvent(evt) {

  // Activity feed
  if (typeof addActivityItem === "function") {
    addActivityItem(evt);
  }

  // Live stats
  if (typeof updateStats === "function") {
    updateStats(evt);
  }

  // Charts
  if (typeof updateCharts === "function") {
    updateCharts(evt);
  }

  // Transactions table
  if (typeof addTransactionRow === "function") {
    addTransactionRow(evt);
  }

  // Fraud detection
  if (typeof updateFraudEngine === "function") {
    updateFraudEngine(evt);
  }

  // Notifications
  if (typeof pushNotification === "function") {
    pushNotification(evt);
  }

  // Leaderboard
  if (typeof updateLeaderboard === "function") {
    updateLeaderboard(evt);
  }
}

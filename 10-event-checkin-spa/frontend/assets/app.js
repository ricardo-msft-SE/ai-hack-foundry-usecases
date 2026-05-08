const state = {
  selectedInitial: "",
  attendees: [],
  selectedAttendee: null,
  selectedTrack: "No Code"
};

const apiBase = window.__API_BASE__ || "/api";

const checkInView = document.getElementById("checkInView");
const currentView = document.getElementById("currentView");
const tabCheckIn = document.getElementById("tabCheckIn");
const tabCurrent = document.getElementById("tabCurrent");

const initialButtons = document.getElementById("initialButtons");
const attendeeList = document.getElementById("attendeeList");
const attendeeDetail = document.getElementById("attendeeDetail");

const kpiTotalRegistrants = document.getElementById("kpiTotalRegistrants");
const kpiTotalCheckedIn = document.getElementById("kpiTotalCheckedIn");
const trackButtons = document.getElementById("trackButtons");
const unknownTrackInfo = document.getElementById("unknownTrackInfo");
const agencyAccordion = document.getElementById("agencyAccordion");
const importFile = document.getElementById("importFile");
const importButton = document.getElementById("importButton");
const exportButton = document.getElementById("exportButton");
const importStatus = document.getElementById("importStatus");

async function apiGet(path) {
  const response = await fetch(`${apiBase}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function apiPost(path, body = null) {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function parseCsvText(text) {
  const rows = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!rows.length) {
    return [];
  }

  const headers = rows[0].split(",").map((value) => value.trim());
  const records = [];

  for (let i = 1; i < rows.length; i += 1) {
    const columns = rows[i].split(",");
    const record = {};

    headers.forEach((header, index) => {
      record[header] = (columns[index] || "").trim();
    });

    records.push(record);
  }

  return records;
}

async function parseImportFile(file) {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv")) {
    const text = await file.text();
    return parseCsvText(text);
  }

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    if (!window.XLSX) {
      throw new Error("Excel parser not available.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return window.XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  throw new Error("Unsupported file type. Use CSV, XLSX, or XLS.");
}

async function handleImport() {
  if (!importFile?.files?.length) {
    importStatus.textContent = "Select a CSV or Excel file before importing.";
    return;
  }

  importButton.disabled = true;
  importStatus.textContent = "Parsing file...";

  try {
    const records = await parseImportFile(importFile.files[0]);
    if (!records.length) {
      importStatus.textContent = "No rows found in the selected file.";
      return;
    }

    importStatus.textContent = "Uploading records...";
    const result = await apiPost("/admin/import", { attendees: records });
    importStatus.textContent = `Import complete: ${result.imported} rows processed. Total registrants: ${result.total}.`;

    await Promise.all([loadInitials(), loadDashboard()]);
  } catch (error) {
    importStatus.textContent = `Import failed: ${error.message}`;
  } finally {
    importButton.disabled = false;
  }
}

async function handleExport() {
  if (!exportButton) {
    return;
  }

  exportButton.disabled = true;
  importStatus.textContent = "Preparing checked-in attendee export...";

  try {
    const initialPayload = await apiGet("/initials");
    const initials = initialPayload.initials || [];
    const allAttendees = [];

    for (const { initial } of initials) {
      const attendeePayload = await apiGet(`/attendees?initial=${encodeURIComponent(initial)}`);
      allAttendees.push(...(attendeePayload.attendees || []));
    }

    const checkedIn = allAttendees
      .filter((attendee) => attendee.status === "Checked-In")
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const rows = [
      ["RegistrationId", "Status", "Name", "Title", "Agency", "TrackSelected", "CheckedInAtUtc"],
      ...checkedIn.map((attendee) => [
        attendee.registrationId,
        attendee.status,
        attendee.name,
        attendee.title,
        attendee.agency,
        attendee.trackSelected,
        attendee.checkedInAtUtc || ""
      ])
    ];

    const csv = rows
      .map((row) => row.map((value) => {
        const text = String(value ?? "");
        return text.includes(",") || text.includes("\n") || text.includes('"')
          ? `"${text.replace(/"/g, '""')}"`
          : text;
      }).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "checked-in-attendees.csv";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    importStatus.textContent = `Checked-in attendee export downloaded (${checkedIn.length} records).`;
  } catch (error) {
    importStatus.textContent = error.message;
  } finally {
    exportButton.disabled = false;
  }
}

function switchView(viewName) {
  const showCheckIn = viewName === "checkin";
  checkInView.classList.toggle("active", showCheckIn);
  currentView.classList.toggle("active", !showCheckIn);

  tabCheckIn.classList.toggle("active", showCheckIn);
  tabCurrent.classList.toggle("active", !showCheckIn);

  tabCheckIn.setAttribute("aria-selected", String(showCheckIn));
  tabCurrent.setAttribute("aria-selected", String(!showCheckIn));
}

function renderInitials(initials) {
  if (!initials.length) {
    initialButtons.innerHTML = "<p class='hint'>No initials available.</p>";
    return;
  }

  initialButtons.innerHTML = initials
    .map(
      ({ initial, count }) => `
      <button type="button" class="initial-button ${state.selectedInitial === initial ? "active" : ""}" data-initial="${initial}">
        ${initial}
        <span class="count">${count}</span>
      </button>
    `
    )
    .join("");

  initialButtons.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedInitial = button.dataset.initial;
      await loadAttendees(state.selectedInitial);
      renderInitials(initials);
    });
  });
}

function renderAttendees() {
  if (!state.attendees.length) {
    attendeeList.innerHTML = "<p class='hint'>No matching attendees for this initial.</p>";
    return;
  }

  attendeeList.innerHTML = state.attendees
    .map(
      (attendee) => `
      <article class="attendee-card">
        <strong>${attendee.name}</strong>
        <p class="attendee-meta">${attendee.title}</p>
        <p class="attendee-meta">${attendee.agency}</p>
        <p class="attendee-meta">Track: ${attendee.trackSelected}</p>
        <span class="status-pill ${attendee.status === "Checked-In" ? "checked" : ""}">${attendee.status}</span>
        <button type="button" class="secondary-btn" data-id="${attendee.registrationId}">Select</button>
      </article>
    `
    )
    .join("");

  attendeeList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", async () => {
      const payload = await apiGet(`/attendee?id=${encodeURIComponent(button.dataset.id)}`);
      state.selectedAttendee = payload.attendee;
      renderAttendeeDetail();
    });
  });
}

function renderAttendeeDetail() {
  if (!state.selectedAttendee) {
    attendeeDetail.innerHTML = "<div class='detail-empty'>Select a registrant to view details.</div>";
    return;
  }

  const attendee = state.selectedAttendee;
  const checked = attendee.status === "Checked-In";

  attendeeDetail.innerHTML = `
    <div class="detail-grid">
      <div class="detail-row"><span class="detail-label">Name</span><strong>${attendee.name}</strong></div>
      <div class="detail-row"><span class="detail-label">Title</span>${attendee.title}</div>
      <div class="detail-row"><span class="detail-label">Agency</span>${attendee.agency}</div>
      <div class="detail-row"><span class="detail-label">Track Selected</span><strong>${attendee.trackSelected}</strong></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="status-pill ${checked ? "checked" : ""}">${attendee.status}</span></div>
      <button type="button" id="checkInButton" class="primary-btn" ${checked ? "disabled" : ""}>
        ${checked ? "Already Checked-In" : "Check-In Attendee"}
      </button>
    </div>
  `;

  const checkInButton = document.getElementById("checkInButton");
  if (!checkInButton || checked) {
    return;
  }

  checkInButton.addEventListener("click", async () => {
    checkInButton.disabled = true;
    checkInButton.textContent = "Checking In...";

    try {
      const payload = await apiPost(`/checkin?id=${encodeURIComponent(attendee.registrationId)}`);
      state.selectedAttendee = payload.attendee;
      const idx = state.attendees.findIndex((item) => item.registrationId === payload.attendee.registrationId);
      if (idx >= 0) {
        state.attendees[idx] = payload.attendee;
      }

      renderAttendees();
      renderAttendeeDetail();
      await loadDashboard();
    } catch {
      checkInButton.disabled = false;
      checkInButton.textContent = "Retry Check-In";
    }
  });
}

function renderTrackButtons(dashboard) {
  const tracks = ["No Code", "Low Code", "Pro Code"];

  trackButtons.innerHTML = tracks
    .map((track) => {
      const count = dashboard.trackCounts?.[track] || 0;
      return `
      <button type="button" class="track-button ${state.selectedTrack === track ? "active" : ""}" data-track="${track}">
        ${track}
        <span class="count">${count}</span>
      </button>
    `;
    })
    .join("");

  const unknownCount = dashboard.trackCounts?.Unknown || 0;
  unknownTrackInfo.textContent = unknownCount
    ? `${unknownCount} registrants currently have Track Selected set to Unknown (from screenshot seed data).`
    : "";

  trackButtons.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedTrack = button.dataset.track;
      renderTrackButtons(dashboard);
      await loadTrackAgencies(state.selectedTrack);
    });
  });
}

function renderTrackAgencies(track, agencies) {
  if (!agencies.length) {
    agencyAccordion.innerHTML = `<p class='hint'>No registrants for ${track}.</p>`;
    return;
  }

  agencyAccordion.innerHTML = agencies
    .map(
      (group) => `
      <details>
        <summary>${group.agency} (${group.attendees.length})</summary>
        <ul class="agency-list">
          ${group.attendees
            .map(
              (attendee) => `
            <li class="agency-item">
              <strong>${attendee.name}</strong> - ${attendee.title}<br />
              <span class="status-pill ${attendee.status === "Checked-In" ? "checked" : ""}">${attendee.status}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </details>
    `
    )
    .join("");
}

async function loadInitials() {
  const payload = await apiGet("/initials");
  const initials = payload.initials || [];

  if (!state.selectedInitial && initials.length) {
    state.selectedInitial = initials[0].initial;
  }

  renderInitials(initials);

  if (state.selectedInitial) {
    await loadAttendees(state.selectedInitial);
  }
}

async function loadAttendees(initial) {
  const payload = await apiGet(`/attendees?initial=${encodeURIComponent(initial)}`);
  state.attendees = payload.attendees || [];
  state.selectedAttendee = null;
  renderAttendees();
  renderAttendeeDetail();
}

async function loadDashboard() {
  const payload = await apiGet("/dashboard");
  kpiTotalRegistrants.textContent = String(payload.totalRegistrants || 0);
  kpiTotalCheckedIn.textContent = String(payload.totalCheckedIn || 0);

  renderTrackButtons(payload);
  await loadTrackAgencies(state.selectedTrack);
}

async function loadTrackAgencies(track) {
  const payload = await apiGet(`/track-agencies?track=${encodeURIComponent(track)}`);
  renderTrackAgencies(track, payload.agencies || []);
}

async function initialize() {
  tabCheckIn.addEventListener("click", () => switchView("checkin"));
  tabCurrent.addEventListener("click", () => switchView("current"));

  if (importButton) {
    importButton.addEventListener("click", () => {
      handleImport().catch(() => {
        importStatus.textContent = "Import failed due to an unexpected error.";
      });
    });
  }

  if (exportButton) {
    exportButton.addEventListener("click", () => {
      handleExport().catch(() => {
        importStatus.textContent = "Export failed due to an unexpected error.";
      });
    });
  }

  await Promise.all([loadInitials(), loadDashboard()]);
}

initialize().catch(() => {
  attendeeList.innerHTML = "<p class='hint'>Unable to load data. Ensure the API is running.</p>";
  agencyAccordion.innerHTML = "<p class='hint'>Unable to load dashboard.</p>";
});

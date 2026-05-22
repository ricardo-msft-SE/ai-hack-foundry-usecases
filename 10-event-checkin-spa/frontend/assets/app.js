const state = {
  selectedInitial: "",
  attendees: [],
  selectedAttendee: null,
  selectedTrack: "No Code",
  credentialsGroups: [],
  registrants: [],
  revealedCredentialIds: new Set()
};

const apiBase = window.__API_BASE__ || "/api";

const checkInView = document.getElementById("checkInView");
const currentView = document.getElementById("currentView");
const credentialsView = document.getElementById("credentialsView");
const tabCheckIn = document.getElementById("tabCheckIn");
const tabCurrent = document.getElementById("tabCurrent");
const tabCredentials = document.getElementById("tabCredentials");

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
const credentialsFile = document.getElementById("credentialsFile");
const credentialsImportButton = document.getElementById("credentialsImportButton");
const credentialsExportButton = document.getElementById("credentialsExportButton");
const credentialsStatus = document.getElementById("credentialsStatus");
const credentialsAccordion = document.getElementById("credentialsAccordion");
const manualName = document.getElementById("manualName");
const manualTitle = document.getElementById("manualTitle");
const manualAgency = document.getElementById("manualAgency");
const manualTrack = document.getElementById("manualTrack");
const manualRegisterButton = document.getElementById("manualRegisterButton");
const manualStatus = document.getElementById("manualStatus");

function formatDisplayName(fullName) {
  const trimmed = String(fullName || "").trim();
  if (!trimmed) {
    return "";
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    return trimmed;
  }

  const lastName = parts[parts.length - 1];
  const firstNames = parts.slice(0, -1).join(" ");
  return `${lastName}, ${firstNames}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCredentialSecrets(credential) {
  const isRevealed = state.revealedCredentialIds.has(credential.credentialId);
  const buttonLabel = isRevealed ? "Hide Pwd" : "Show Pwd";
  const password = credential.password || "";
  const tap = credential.tap || "";

  return `
    <div class="credential-secrets-cell">
      <button type="button" class="secondary-btn credential-reveal" data-credential-id="${credential.credentialId}">${buttonLabel}</button>
      <div class="credential-secrets ${isRevealed ? "visible" : ""}">
        <div><strong>Password:</strong> ${escapeHtml(password || "Not provided")}</div>
        <div><strong>TAP:</strong> ${escapeHtml(tap || "Not provided")}</div>
      </div>
    </div>
  `;
}

async function apiGet(path) {
  return requestWithRetry(path, { method: "GET" });
}

async function apiPost(path, body = null) {
  return requestWithRetry(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status) {
  return status >= 500 || status === 429;
}

async function requestWithRetry(path, options) {
  const maxAttempts = 4;
  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      const response = await fetch(`${apiBase}${path}`, options);
      if (response.ok) {
        return response.json();
      }

      const status = response.status;
      lastError = new Error(`Request failed: ${status}`);
      if (!shouldRetryStatus(status) || attempt >= maxAttempts) {
        throw lastError;
      }
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) {
        throw lastError;
      }
    }

    // Short exponential backoff for transient API outages.
    await delay(250 * 2 ** (attempt - 1));
  }

  throw lastError || new Error("Request failed");
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
    const result = await apiPost("/import", { attendees: records });
    importStatus.textContent = `Import complete: ${result.imported} rows processed. Total registrants: ${result.total}.`;

    await Promise.all([loadInitials(), loadDashboard(), loadCredentials()]);
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

function renderRegistrantOptions(selectedRegistrationId) {
  const options = ["<option value=''>Unassigned</option>"];

  for (const registrant of state.registrants) {
    const isSelected = registrant.registrationId === selectedRegistrationId;
    options.push(
      `<option value="${registrant.registrationId}" ${isSelected ? "selected" : ""}>${formatDisplayName(registrant.name)}</option>`
    );
  }

  return options.join("");
}

function renderCredentials() {
  if (!state.credentialsGroups.length) {
    credentialsAccordion.innerHTML = "<p class='hint'>No credentials loaded yet.</p>";
    return;
  }

  credentialsAccordion.innerHTML = state.credentialsGroups
    .map(
      (group) => `
      <details open>
        <summary>${group.type} (${group.credentials.length})</summary>
        <div class="credentials-table-wrap">
          <table class="credentials-table">
            <thead>
              <tr>
                <th>Credential</th>
                <th>Type</th>
                <th>User Assignment</th>
                <th>In Use (Y/N)</th>
                <th>Tested (Y/N)</th>
                <th>Secrets</th>
              </tr>
            </thead>
            <tbody>
              ${group.credentials
                .map(
                  (credential) => `
                <tr>
                  <td>
                    <div class="credential-primary">${escapeHtml(credential.credential || "")}</div>
                    ${credential.sourceUserPrincipalName ? `<div class="credential-secondary">Source: ${escapeHtml(credential.sourceUserPrincipalName)}</div>` : ""}
                  </td>
                  <td>${escapeHtml(credential.type || "")}</td>
                  <td>
                    <select class="credential-assignment" data-credential-id="${credential.credentialId}">
                      ${renderRegistrantOptions(credential.userAssignmentRegistrationId)}
                    </select>
                  </td>
                  <td>
                    <select class="credential-inuse" data-credential-id="${credential.credentialId}">
                      <option value="Y" ${credential.inUse ? "selected" : ""}>Y</option>
                      <option value="N" ${credential.inUse ? "" : "selected"}>N</option>
                    </select>
                  </td>
                  <td>
                    <select class="credential-tested" data-credential-id="${credential.credentialId}">
                      <option value="Y" ${credential.tested ? "selected" : ""}>Y</option>
                      <option value="N" ${credential.tested ? "" : "selected"}>N</option>
                    </select>
                  </td>
                  <td>
                    ${renderCredentialSecrets(credential)}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </details>
    `
    )
    .join("");

  credentialsAccordion.querySelectorAll(".credential-assignment").forEach((select) => {
    select.addEventListener("change", async () => {
      const element = select;
      element.disabled = true;
      credentialsStatus.textContent = "Saving assignment...";

      try {
        await apiPost("/credentials/assign", {
          credentialId: element.dataset.credentialId,
          registrationId: element.value
        });
        await loadCredentials();
        credentialsStatus.textContent = "Assignment saved.";
      } catch (error) {
        credentialsStatus.textContent = `Assignment failed: ${error.message}`;
      } finally {
        element.disabled = false;
      }
    });
  });

  credentialsAccordion.querySelectorAll(".credential-inuse").forEach((select) => {
    select.addEventListener("change", async () => {
      const element = select;
      element.disabled = true;
      credentialsStatus.textContent = "Saving In Use value...";

      try {
        await apiPost("/credentials/inuse", {
          credentialId: element.dataset.credentialId,
          inUse: element.value === "Y"
        });
        await loadCredentials();
        credentialsStatus.textContent = "In Use value saved.";
      } catch (error) {
        credentialsStatus.textContent = `In Use update failed: ${error.message}`;
      } finally {
        element.disabled = false;
      }
    });
  });

  credentialsAccordion.querySelectorAll(".credential-tested").forEach((select) => {
    select.addEventListener("change", async () => {
      const element = select;
      element.disabled = true;
      credentialsStatus.textContent = "Saving Tested value...";

      try {
        await apiPost("/credentials/tested", {
          credentialId: element.dataset.credentialId,
          tested: element.value === "Y"
        });
        await loadCredentials();
        credentialsStatus.textContent = "Tested value saved.";
      } catch (error) {
        credentialsStatus.textContent = `Tested update failed: ${error.message}`;
      } finally {
        element.disabled = false;
      }
    });
  });

  credentialsAccordion.querySelectorAll(".credential-reveal").forEach((button) => {
    button.addEventListener("click", () => {
      const credentialId = button.dataset.credentialId;
      if (!credentialId) {
        return;
      }

      if (state.revealedCredentialIds.has(credentialId)) {
        state.revealedCredentialIds.delete(credentialId);
      } else {
        state.revealedCredentialIds.add(credentialId);
      }

      renderCredentials();
    });
  });
}

async function loadCredentials() {
  const payload = await apiGet("/credentials");
  state.credentialsGroups = payload.groups || [];
  state.registrants = (payload.registrants || []).sort((a, b) => {
    const byLastName = String(a.lastName || "").localeCompare(String(b.lastName || ""));
    if (byLastName !== 0) {
      return byLastName;
    }
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  renderCredentials();
}

async function handleCredentialsImport() {
  if (!credentialsFile?.files?.length) {
    credentialsStatus.textContent = "Select a CSV or Excel file before importing credentials.";
    return;
  }

  credentialsImportButton.disabled = true;
  credentialsStatus.textContent = "Parsing credential file...";

  try {
    const records = await parseImportFile(credentialsFile.files[0]);
    if (!records.length) {
      credentialsStatus.textContent = "No credential rows found in the selected file.";
      return;
    }

    credentialsStatus.textContent = "Uploading credential records...";
    const result = await apiPost("/credentials/import", { credentials: records });
    credentialsStatus.textContent = `Credential import complete: ${result.imported} rows processed. Total credentials: ${result.total}.`;
    await loadCredentials();
  } catch (error) {
    credentialsStatus.textContent = `Credential import failed: ${error.message}`;
  } finally {
    credentialsImportButton.disabled = false;
  }
}

async function handleCredentialsExport() {
  if (!credentialsExportButton) {
    return;
  }

  credentialsExportButton.disabled = true;
  credentialsStatus.textContent = "Preparing credentials assignment export...";

  try {
    const rows = [
      ["Credential", "Source User Principal Name", "Type", "Credential Family Id", "User Assignment", "In Use (Y/N)", "Tested (Y/N)", "Password", "Tap", "User Assignment RegistrationId"]
    ];

    for (const group of state.credentialsGroups) {
      for (const credential of group.credentials || []) {
        rows.push([
          credential.credential || "",
          credential.sourceUserPrincipalName || "",
          credential.type || "",
          credential.credentialFamilyId || "",
          credential.userAssignmentDisplayName || "",
          credential.inUse ? "Y" : "N",
          credential.tested ? "Y" : "N",
          credential.password || "",
          credential.tap || "",
          credential.userAssignmentRegistrationId || ""
        ]);
      }
    }

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
    anchor.download = "credential-assignments.csv";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    credentialsStatus.textContent = `Credential assignments export downloaded (${rows.length - 1} records).`;
  } catch (error) {
    credentialsStatus.textContent = `Credential export failed: ${error.message}`;
  } finally {
    credentialsExportButton.disabled = false;
  }
}

function switchView(viewName) {
  const showCheckIn = viewName === "checkin";
  const showCurrent = viewName === "current";
  const showCredentials = viewName === "credentials";

  checkInView.classList.toggle("active", showCheckIn);
  currentView.classList.toggle("active", showCurrent);
  credentialsView.classList.toggle("active", showCredentials);

  tabCheckIn.classList.toggle("active", showCheckIn);
  tabCurrent.classList.toggle("active", showCurrent);
  tabCredentials.classList.toggle("active", showCredentials);

  tabCheckIn.setAttribute("aria-selected", String(showCheckIn));
  tabCurrent.setAttribute("aria-selected", String(showCurrent));
  tabCredentials.setAttribute("aria-selected", String(showCredentials));
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
        <div class="attendee-main">
          <strong>${formatDisplayName(attendee.name)}</strong>
          <span class="status-pill ${attendee.status === "Checked-In" ? "checked" : ""}">${attendee.status}</span>
        </div>
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
  const statuses = ["Pending", "Approve", "Checked-In"];
  const statusOptions = statuses
    .map((status) => `<option value="${status}" ${attendee.status === status ? "selected" : ""}>${status}</option>`)
    .join("");
  const detailTracks = ["No Code", "Low Code", "Pro Code", "Unknown"];
  const trackOptions = detailTracks
    .map((track) => `<option value="${track}" ${attendee.trackSelected === track ? "selected" : ""}>${track}</option>`)
    .join("");

  attendeeDetail.innerHTML = `
    <div class="detail-grid">
      <div class="detail-row"><span class="detail-label">Name</span><strong>${attendee.name}</strong></div>
      <div class="detail-row"><span class="detail-label">Title</span>${attendee.title}</div>
      <div class="detail-row"><span class="detail-label">Agency</span>${attendee.agency}</div>
      <div class="detail-row">
        <span class="detail-label">Track Selected</span>
        <select id="detailTrackSelect" class="detail-select">${trackOptions}</select>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <select id="detailStatusSelect" class="detail-select">${statusOptions}</select>
      </div>
      <button type="button" id="saveDetailButton" class="secondary-btn">Save Detail Changes</button>
      <button type="button" id="checkInButton" class="primary-btn">
        ${checked ? "Check Out" : "Check-In Attendee"}
      </button>
    </div>
  `;

  const detailTrackSelect = document.getElementById("detailTrackSelect");
  const detailStatusSelect = document.getElementById("detailStatusSelect");
  const saveDetailButton = document.getElementById("saveDetailButton");
  if (saveDetailButton && detailTrackSelect && detailStatusSelect) {
    saveDetailButton.addEventListener("click", async () => {
      saveDetailButton.disabled = true;
      saveDetailButton.textContent = "Saving...";

      try {
        const payload = await apiPost(`/attendee/update?id=${encodeURIComponent(attendee.registrationId)}`, {
          status: detailStatusSelect.value,
          trackSelected: detailTrackSelect.value
        });

        state.selectedAttendee = payload.attendee;
        const idx = state.attendees.findIndex((item) => item.registrationId === payload.attendee.registrationId);
        if (idx >= 0) {
          state.attendees[idx] = payload.attendee;
        }

        renderAttendees();
        renderAttendeeDetail();
        await loadDashboard();
      } catch {
        saveDetailButton.disabled = false;
        saveDetailButton.textContent = "Retry Save";
      }
    });
  }

  const checkInButton = document.getElementById("checkInButton");
  if (!checkInButton) {
    return;
  }

  checkInButton.addEventListener("click", async () => {
    checkInButton.disabled = true;
    checkInButton.textContent = checked ? "Checking Out..." : "Checking In...";

    try {
      const endpoint = checked ? "/checkout" : "/checkin";
      const payload = await apiPost(`${endpoint}?id=${encodeURIComponent(attendee.registrationId)}`);
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
  const tracks = Array.isArray(dashboard.tracks) && dashboard.tracks.length
    ? dashboard.tracks
    : ["No Code", "Low Code", "Pro Code", "Unknown"];

  if (!tracks.includes(state.selectedTrack)) {
    state.selectedTrack = tracks[0];
  }

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
  const checkedByTrack = dashboard.checkedInTrackCounts || { "No Code": 0, "Low Code": 0, "Pro Code": 0, Unknown: 0 };

  kpiTotalCheckedIn.innerHTML = `${dashboard.totalCheckedIn || 0}<span class="kpi-sub">(No Code: ${checkedByTrack["No Code"] || 0}, Low Code: ${checkedByTrack["Low Code"] || 0}, Pro Code: ${checkedByTrack["Pro Code"] || 0}, Unknown: ${checkedByTrack.Unknown || 0})</span>`;

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

  renderTrackButtons(payload);
  await loadTrackAgencies(state.selectedTrack);
}

async function handleManualRegistration() {
  const name = String(manualName?.value || "").trim();
  const title = String(manualTitle?.value || "").trim();
  const agency = String(manualAgency?.value || "").trim();
  const trackSelected = String(manualTrack?.value || "Unknown");

  if (!name) {
    manualStatus.textContent = "Name is required.";
    return;
  }

  manualRegisterButton.disabled = true;
  manualStatus.textContent = "Registering attendee...";

  try {
    await apiPost("/register", {
      name,
      title,
      agency,
      trackSelected
    });

    manualStatus.textContent = "Manual registration added.";
    manualName.value = "";
    manualTitle.value = "";
    manualAgency.value = "";
    manualTrack.value = "No Code";

    await Promise.all([loadInitials(), loadDashboard()]);
  } catch (error) {
    manualStatus.textContent = `Manual registration failed: ${error.message}`;
  } finally {
    manualRegisterButton.disabled = false;
  }
}

async function loadTrackAgencies(track) {
  const payload = await apiGet(`/track-agencies?track=${encodeURIComponent(track)}`);
  renderTrackAgencies(track, payload.agencies || []);
}

async function initialize() {
  tabCheckIn.addEventListener("click", () => switchView("checkin"));
  tabCurrent.addEventListener("click", () => switchView("current"));
  tabCredentials.addEventListener("click", () => switchView("credentials"));

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

  if (manualRegisterButton) {
    manualRegisterButton.addEventListener("click", () => {
      handleManualRegistration().catch(() => {
        manualStatus.textContent = "Manual registration failed due to an unexpected error.";
      });
    });
  }

  if (credentialsImportButton) {
    credentialsImportButton.addEventListener("click", () => {
      handleCredentialsImport().catch(() => {
        credentialsStatus.textContent = "Credential import failed due to an unexpected error.";
      });
    });
  }

  if (credentialsExportButton) {
    credentialsExportButton.addEventListener("click", () => {
      handleCredentialsExport().catch(() => {
        credentialsStatus.textContent = "Credential export failed due to an unexpected error.";
      });
    });
  }

  await Promise.all([loadInitials(), loadDashboard(), loadCredentials()]);
}

initialize().catch(() => {
  attendeeList.innerHTML = "<p class='hint'>Unable to load data. Ensure the API is running.</p>";
  agencyAccordion.innerHTML = "<p class='hint'>Unable to load dashboard.</p>";
  credentialsAccordion.innerHTML = "<p class='hint'>Unable to load credentials.</p>";
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Keep app behavior unchanged if service worker registration fails.
    });
  });
}

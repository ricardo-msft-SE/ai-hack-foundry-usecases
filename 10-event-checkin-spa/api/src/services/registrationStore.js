import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DefaultAzureCredential } from "@azure/identity";
import { TableClient } from "@azure/data-tables";
import { config } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const isAzureHosted = Boolean(process.env.WEBSITE_INSTANCE_ID || process.env.WEBSITE_SITE_NAME);
const localDataDir = process.env.EVENT_CHECKIN_DATA_DIR
  ? path.resolve(process.env.EVENT_CHECKIN_DATA_DIR)
  : isAzureHosted
    ? path.join(os.tmpdir(), "event-checkin-spa")
    : path.join(projectRoot, "data");
const localDataPath = path.join(localDataDir, "registrations.local.json");
const localCredentialsPath = path.join(localDataDir, "credentials.local.json");
const seedDataPathCandidates = [
  path.resolve(projectRoot, "sample-data", "initial-registrations.json"),
  path.resolve(projectRoot, "..", "sample-data", "initial-registrations.json")
];

const TRACKS = ["No Code", "Low Code", "Pro Code", "Unknown"];
const TRACK_SET = new Set(TRACKS);
const CREDENTIALS_PARTITION_SUFFIX = "-credentials";
const CREDENTIAL_FAMILY_TYPES = ["Azure", "GitHub", "Cloud PC"];
const AGENCY_CANONICAL_MAP = new Map([
  ["microsoft", "Microsoft"],
  ["dps", "Ohio Department of Public Safety"],
  ["odps", "Ohio Department of Public Safety"],
  ["departmentofpublicsafety", "Ohio Department of Public Safety"],
  ["ohiodepartmentofpublicsafety", "Ohio Department of Public Safety"],
  ["odjfs", "Ohio Department of Job and Family Services"],
  ["ohiojobandfamilyservices", "Ohio Department of Job and Family Services"],
  ["ohiodepartmentofjobandfamilyservices", "Ohio Department of Job and Family Services"],
  ["stateofohiojobfamilyservices", "Ohio Department of Job and Family Services"],
  ["stateofohiojobandfamilyservices", "Ohio Department of Job and Family Services"],
  ["obm", "Ohio Office of Budget and Management"],
  ["ohioofficeofbudgetandmanagement", "Ohio Office of Budget and Management"],
  ["stateofohioofficeofbudgetandmanagement", "Ohio Office of Budget and Management"],
  ["stateofohioobm", "Ohio Office of Budget and Management"],
  ["das", "Department of Administrative Services"],
  ["administrativeservices", "Department of Administrative Services"],
  ["departmentofadministrativeservices", "Department of Administrative Services"],
  ["deptofadministrativeservices", "Department of Administrative Services"],
  ["deptofadministrativeservices", "Department of Administrative Services"],
  ["bwc", "Ohio Bureau of Workers' Compensation"],
  ["ohiobwc", "Ohio Bureau of Workers' Compensation"],
  ["ohiobureauofworkerscompensation", "Ohio Bureau of Workers' Compensation"],
  ["stateofohiobureauofworkerscompensation", "Ohio Bureau of Workers' Compensation"],
  ["ohioepa", "Ohio Environmental Protection Agency"],
  ["ohioenvironmentalprotectionagency", "Ohio Environmental Protection Agency"],
  ["odot", "Ohio Department of Transportation"],
  ["ohiodepartmentoftransportation", "Ohio Department of Transportation"],
  ["ohiondepartmentoftransport", "Ohio Department of Transportation"],
  ["drc", "Ohio Department of Rehabilitation and Correction"],
  ["rehab", "Ohio Department of Rehabilitation and Correction"],
  ["rehabilitation", "Ohio Department of Rehabilitation and Correction"],
  ["departmentofrehabilitationandcorrection", "Ohio Department of Rehabilitation and Correction"],
  ["ohiodepartmentofrehabilitationandcorrection", "Ohio Department of Rehabilitation and Correction"],
  ["departmentofrehabandcorrections", "Ohio Department of Rehabilitation and Correction"],
  ["ohiodepartmentofrehabandcorrections", "Ohio Department of Rehabilitation and Correction"],
  ["stateofohiodrc", "Ohio Department of Rehabilitation and Correction"],
  ["ood", "Opportunities for Ohioans with Disabilities"],
  ["opportunitiesforohioanswithdisabilities", "Opportunities for Ohioans with Disabilities"],
  ["opportunitiesforohioanswithdisabilties", "Opportunities for Ohioans with Disabilities"],
  ["insurance", "Ohio Department of Insurance"],
  ["departmentofinsurance", "Ohio Department of Insurance"],
  ["ohiodepartmentofinsurance", "Ohio Department of Insurance"],
  ["deptofcommerce", "Ohio Department of Commerce"],
  ["deptcommerce", "Ohio Department of Commerce"],
  ["ohiodeptofcommerce", "Ohio Department of Commerce"],
  ["ohiodepartmentofcommerce", "Ohio Department of Commerce"],
  ["stateofohiocommerce", "Ohio Department of Commerce"],
  ["treasurerofstate", "Ohio Treasurer of State"],
  ["ohiotreasurerofstate", "Ohio Treasurer of State"],
  ["ohiotreasurersoffice", "Ohio Treasurer of State"],
  ["sco", "Supreme Court of Ohio"],
  ["stateofohio", "State of Ohio"]
]);

function makeAgencyLookupKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeAgencyName(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const mapped = AGENCY_CANONICAL_MAP.get(makeAgencyLookupKey(raw));
  return mapped || raw;
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toBoolean(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "y" || normalized === "yes" || normalized === "true" || normalized === "1";
}

function makeCredentialId(type, credential) {
  const typeSlug = slugify(type) || "unknown";
  const credentialSlug = slugify(credential) || "credential";
  return `cred-${typeSlug}-${credentialSlug}`;
}

function extractLocalPart(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  return raw.split("@")[0].trim();
}

function makeCredentialFamilyId(sourceLogin) {
  return `family-${slugify(sourceLogin) || "credential"}`;
}

function getCredentialForType(type, sourceLogin) {
  const localPart = extractLocalPart(sourceLogin);

  if (type === "GitHub") {
    return localPart ? `${localPart}_clabs` : "";
  }

  return String(sourceLogin || "").trim();
}

function normalizeCredentialType(inputType) {
  const raw = String(inputType || "").trim();
  if (!raw) {
    return "";
  }

  const normalized = raw.toLowerCase();
  if (normalized === "cloud pc" || normalized === "cloudpc") {
    return "Cloud PC";
  }
  if (normalized === "github") {
    return "GitHub";
  }
  if (normalized === "azure") {
    return "Azure";
  }

  return raw;
}

function normalizeCredentialCore(input) {
  const type = normalizeCredentialType(firstDefined(input.type, input.Type));
  const sourceUserPrincipalName = String(
    firstDefined(
      input.sourceUserPrincipalName,
      input.SourceUserPrincipalName,
      input.userPrincipalName,
      input.UserPrincipalName,
      input.upn,
      input.UPN,
      input.login,
      input.Login,
      input.username,
      input.Username,
      input.credential,
      input.Credential
    ) || ""
  ).trim();
  const credential = String(
    firstDefined(input.credential, input.Credential, input.username, input.Username, input.login, input.Login) || ""
  ).trim();

  if (!credential || !type) {
    return null;
  }

  const now = new Date().toISOString();
  const userAssignmentRegistrationId = String(
    firstDefined(
      input.userAssignmentRegistrationId,
      input.UserAssignmentRegistrationId,
      input.userAssignment,
      input.UserAssignment,
      input.assignedRegistrationId,
      input.AssignedRegistrationId
    ) || ""
  ).trim();

  return {
    credentialId: String(firstDefined(input.credentialId, input.CredentialId) || "").trim() || makeCredentialId(type, credential),
    credential,
    type,
    sourceUserPrincipalName,
    credentialFamilyId: String(
      firstDefined(input.credentialFamilyId, input.CredentialFamilyId, input.familyId, input.FamilyId) || ""
    ).trim() || makeCredentialFamilyId(sourceUserPrincipalName || credential),
    userAssignmentRegistrationId,
    userAssignmentDisplayName: String(
      firstDefined(input.userAssignmentDisplayName, input.UserAssignmentDisplayName) || ""
    ).trim(),
    inUse: toBoolean(firstDefined(input.inUse, input.InUse, input["In Use"], input["In Use (Y/N)"], false)),
    tested: toBoolean(firstDefined(input.tested, input.Tested, input["Tested"], input["Tested (Y/N)"], false)),
    password: String(firstDefined(input.password, input.Password) || "").trim(),
    tap: String(firstDefined(input.tap, input.Tap) || "").trim(),
    createdAtUtc: String(firstDefined(input.createdAtUtc, input.CreatedAtUtc) || now),
    updatedAtUtc: now
  };
}

function normalizeCredentialRecord(input) {
  return normalizeCredentialCore(input);
}

function expandCredentialImportRecords(input) {
  const sourceUserPrincipalName = String(
    firstDefined(input.userPrincipalName, input.UserPrincipalName, input.sourceUserPrincipalName, input.SourceUserPrincipalName) || ""
  ).trim();

  if (!sourceUserPrincipalName) {
    const normalized = normalizeCredentialRecord(input);
    return normalized ? [normalized] : [];
  }

  return CREDENTIAL_FAMILY_TYPES.map((type) =>
    normalizeCredentialCore({
      ...input,
      type,
      credential: getCredentialForType(type, sourceUserPrincipalName),
      sourceUserPrincipalName,
      credentialFamilyId: makeCredentialFamilyId(sourceUserPrincipalName)
    })
  ).filter(Boolean);
}

function groupCredentialsByType(records) {
  const groups = new Map();

  for (const record of records) {
    if (!groups.has(record.type)) {
      groups.set(record.type, []);
    }
    groups.get(record.type).push(record);
  }

  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([type, credentials]) => ({
      type,
      credentials: credentials.sort((a, b) => a.credential.localeCompare(b.credential))
    }));
}

function extractLastName(fullName) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    return "";
  }
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1];
}

function normalizeSeedRecord(input) {
  const lastName = extractLastName(input.name);
  const now = new Date().toISOString();

  return {
    registrationId: input.registrationId,
    status: input.status,
    name: input.name,
    title: input.title || "",
    agency: normalizeAgencyName(input.agency || ""),
    trackSelected: input.trackSelected || "Unknown",
    lastName,
    lastInitial: (lastName[0] || "").toUpperCase(),
    checkedInAtUtc: input.checkedInAtUtc || "",
    createdAtUtc: input.createdAtUtc || now
  };
}

function normalizeTrackName(track) {
  const raw = String(track || "").trim();
  if (!raw) {
    return "Unknown";
  }

  const normalized = raw.toLowerCase();
  if (normalized === "nocode" || normalized === "no code") return "No Code";
  if (normalized === "lowcode" || normalized === "low code") return "Low Code";
  if (normalized === "procode" || normalized === "pro code") return "Pro Code";

  return TRACK_SET.has(raw) ? raw : "Unknown";
}

function makeRegistrationId(index) {
  const suffix = String(index + 1).padStart(5, "0");
  const stamp = Date.now().toString(36);
  return `import-${stamp}-${suffix}`;
}

function normalizeImportRecord(input, index = 0) {
  const name = String(input.name || input.Name || "").trim();
  if (!name) {
    return null;
  }

  const statusRaw = String(input.status || input.Status || "Pending").trim();
  const status = statusRaw || "Pending";
  const trackSelected = normalizeTrackName(input.trackSelected || input.TrackSelected || input.Track || "Unknown");
  const title = String(input.title || input.Title || "").trim();
  const agency = normalizeAgencyName(String(input.agency || input.Agency || "").trim());
  const registrationId = String(input.registrationId || input.RegistrationId || "").trim() || makeRegistrationId(index);
  const lastName = extractLastName(name);
  const checkedInAtUtc = status === "Checked-In" ? String(input.checkedInAtUtc || input.CheckedInAtUtc || new Date().toISOString()) : "";

  return {
    registrationId,
    status,
    name,
    title,
    agency,
    trackSelected,
    lastName,
    lastInitial: (lastName[0] || "").toUpperCase(),
    checkedInAtUtc,
    createdAtUtc: String(input.createdAtUtc || input.CreatedAtUtc || new Date().toISOString())
  };
}

function buildCheckedInTrackCounts(records) {
  const checkedInTrackCounts = {
    "No Code": 0,
    "Low Code": 0,
    "Pro Code": 0
  };

  for (const record of records) {
    if (record.status !== "Checked-In") {
      continue;
    }

    const track = record.trackSelected || "Unknown";
    if (checkedInTrackCounts[track] !== undefined) {
      checkedInTrackCounts[track] += 1;
    }
  }

  return checkedInTrackCounts;
}

async function readSeedData() {
  for (const candidate of seedDataPathCandidates) {
    try {
      const raw = await fs.readFile(candidate, "utf-8");
      const parsed = JSON.parse(raw);
      return parsed.map(normalizeSeedRecord);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  // Keep the API available even if packaged seed data is missing.
  return [];
}

class LocalFileStore {
  async initialize() {
    await fs.mkdir(localDataDir, { recursive: true });
  }

  async loadRecords() {
    await this.initialize();
    try {
      const raw = await fs.readFile(localDataPath, "utf-8");
      if (!raw.trim()) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      if (error instanceof SyntaxError) {
        await fs.writeFile(localDataPath, "[]", "utf-8");
        return [];
      }
      throw error;
    }
  }

  async saveRecords(records) {
    await this.initialize();
    await fs.writeFile(localDataPath, JSON.stringify(records, null, 2), "utf-8");
  }

  async loadCredentials() {
    await this.initialize();
    try {
      const raw = await fs.readFile(localCredentialsPath, "utf-8");
      if (!raw.trim()) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      if (error instanceof SyntaxError) {
        await fs.writeFile(localCredentialsPath, "[]", "utf-8");
        return [];
      }
      throw error;
    }
  }

  async saveCredentials(records) {
    await this.initialize();
    await fs.writeFile(localCredentialsPath, JSON.stringify(records, null, 2), "utf-8");
  }

  async seedIfEmpty() {
    const existing = await this.loadRecords();
    if (existing.length > 0) {
      return;
    }
    const seed = await readSeedData();
    await this.saveRecords(seed);
  }

  async listInitials() {
    const records = await this.loadRecords();
    const counts = new Map();

    for (const record of records) {
      const key = (record.lastInitial || "").toUpperCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([initial, count]) => ({ initial, count }));
  }

  async listByInitial(initial) {
    const records = await this.loadRecords();
    const desired = (initial || "").toUpperCase();

    return records
      .filter((record) => record.lastInitial === desired)
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  async getById(registrationId) {
    const records = await this.loadRecords();
    return records.find((record) => record.registrationId === registrationId) || null;
  }

  async checkIn(registrationId) {
    const records = await this.loadRecords();
    const idx = records.findIndex((record) => record.registrationId === registrationId);

    if (idx < 0) {
      return null;
    }

    const current = records[idx];
    if (current.status !== "Checked-In") {
      current.status = "Checked-In";
      current.checkedInAtUtc = new Date().toISOString();
      records[idx] = current;
      await this.saveRecords(records);
    }

    return current;
  }

  async checkOut(registrationId) {
    const records = await this.loadRecords();
    const idx = records.findIndex((record) => record.registrationId === registrationId);

    if (idx < 0) {
      return null;
    }

    const current = records[idx];
    current.status = "Pending";
    current.checkedInAtUtc = "";
    records[idx] = current;
    await this.saveRecords(records);

    return current;
  }

  async updateAttendee(registrationId, updates = {}) {
    const records = await this.loadRecords();
    const idx = records.findIndex((record) => record.registrationId === registrationId);

    if (idx < 0) {
      return null;
    }

    const current = records[idx];
    const nextStatus = updates.status !== undefined ? String(updates.status || "").trim() : current.status;
    const nextTrack = updates.trackSelected !== undefined
      ? normalizeTrackName(updates.trackSelected)
      : current.trackSelected;

    const updated = {
      ...current,
      status: nextStatus || current.status,
      trackSelected: nextTrack || current.trackSelected
    };

    if (updated.status === "Checked-In") {
      updated.checkedInAtUtc = updated.checkedInAtUtc || new Date().toISOString();
    } else {
      updated.checkedInAtUtc = "";
    }

    records[idx] = updated;
    await this.saveRecords(records);
    return updated;
  }

  async getDashboard() {
    const records = await this.loadRecords();
    const totalRegistrants = records.length;
    const totalCheckedIn = records.filter((record) => record.status === "Checked-In").length;

    const trackCounts = {
      "No Code": 0,
      "Low Code": 0,
      "Pro Code": 0,
      Unknown: 0
    };

    for (const record of records) {
      const track = record.trackSelected || "Unknown";
      if (trackCounts[track] === undefined) {
        trackCounts[track] = 0;
      }
      trackCounts[track] += 1;
    }

    return {
      totalRegistrants,
      totalCheckedIn,
      trackCounts,
      checkedInTrackCounts: buildCheckedInTrackCounts(records)
    };
  }

  async getTrackAgencies(trackName) {
    const records = await this.loadRecords();
    const groups = new Map();
    const includeAllTracks = String(trackName || "").trim().toLowerCase() === "all tracks";

    for (const record of records) {
      if (!includeAllTracks && (record.trackSelected || "Unknown") !== trackName) {
        continue;
      }
      const normalizedAgency = normalizeAgencyName(record.agency || "");
      if (!groups.has(normalizedAgency)) {
        groups.set(normalizedAgency, []);
      }
      groups.get(normalizedAgency).push({
        ...record,
        agency: normalizedAgency
      });
    }

    return [...groups.entries()]
      .sort((a, b) => {
        const byCount = b[1].length - a[1].length;
        if (byCount !== 0) {
          return byCount;
        }
        return a[0].localeCompare(b[0]);
      })
      .map(([agency, attendees]) => ({
        agency,
        attendees: attendees.sort((a, b) => a.lastName.localeCompare(b.lastName))
      }));
  }

  async importRecords(inputRecords) {
    const records = await this.loadRecords();
    const byId = new Map(records.map((record) => [record.registrationId, record]));

    let imported = 0;
    for (let i = 0; i < inputRecords.length; i += 1) {
      const normalized = normalizeImportRecord(inputRecords[i], i);
      if (!normalized) {
        continue;
      }
      byId.set(normalized.registrationId, normalized);
      imported += 1;
    }

    await this.saveRecords([...byId.values()]);

    return {
      imported,
      total: byId.size
    };
  }

  async replaceRecords(inputRecords) {
    const normalized = [];

    for (let i = 0; i < inputRecords.length; i += 1) {
      const record = normalizeImportRecord(inputRecords[i], i);
      if (!record) {
        continue;
      }
      normalized.push(record);
    }

    await this.saveRecords(normalized);

    return {
      imported: normalized.length,
      total: normalized.length
    };
  }

  async registerAttendee(input) {
    const records = await this.loadRecords();
    const normalized = normalizeImportRecord(
      {
        ...input,
        status: "Pending"
      },
      records.length
    );

    if (!normalized) {
      throw new Error("Name is required.");
    }

    records.push(normalized);
    await this.saveRecords(records);
    return normalized;
  }

  async listCheckedIn() {
    const records = await this.loadRecords();
    return records
      .filter((record) => record.status === "Checked-In")
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  async listAllAttendees() {
    const records = await this.loadRecords();
    return records.sort((a, b) => {
      const byLastName = (a.lastName || "").localeCompare(b.lastName || "");
      if (byLastName !== 0) {
        return byLastName;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }

  async listCredentialsGroupedByType() {
    const credentials = await this.loadCredentials();
    return groupCredentialsByType(credentials);
  }

  async importCredentials(inputRecords) {
    const existing = await this.loadCredentials();
    const byId = new Map(existing.map((item) => [item.credentialId, item]));
    let imported = 0;

    for (const input of inputRecords) {
      const expandedRecords = expandCredentialImportRecords(input);
      for (const normalized of expandedRecords) {
        const current = byId.get(normalized.credentialId);
        byId.set(normalized.credentialId, {
          ...current,
          ...normalized,
          createdAtUtc: current?.createdAtUtc || normalized.createdAtUtc
        });
        imported += 1;
      }
    }

    const updated = [...byId.values()];
    await this.saveCredentials(updated);
    return {
      imported,
      total: updated.length
    };
  }

  async assignCredential(credentialId, registrationId) {
    const credentials = await this.loadCredentials();
    const idx = credentials.findIndex((item) => item.credentialId === credentialId);
    if (idx < 0) {
      return null;
    }

    const attendees = await this.loadRecords();
    const normalizedRegistrationId = String(registrationId || "").trim();
    const assignee = normalizedRegistrationId
      ? attendees.find((item) => item.registrationId === normalizedRegistrationId)
      : null;

    if (normalizedRegistrationId && !assignee) {
      throw new Error("Assigned registrant was not found.");
    }

    const target = credentials[idx];
    const now = new Date().toISOString();

    for (let i = 0; i < credentials.length; i += 1) {
      if (i === idx) {
        continue;
      }

      const current = credentials[i];
      if (current.type === target.type && current.userAssignmentRegistrationId === normalizedRegistrationId && normalizedRegistrationId) {
        credentials[i] = {
          ...current,
          userAssignmentRegistrationId: "",
          userAssignmentDisplayName: "",
          updatedAtUtc: now
        };
      }
    }

    credentials[idx] = {
      ...target,
      userAssignmentRegistrationId: normalizedRegistrationId,
      userAssignmentDisplayName: assignee?.name || "",
      updatedAtUtc: now
    };

    await this.saveCredentials(credentials);
    return credentials[idx];
  }

  async setCredentialInUse(credentialId, inUse) {
    const credentials = await this.loadCredentials();
    const idx = credentials.findIndex((item) => item.credentialId === credentialId);
    if (idx < 0) {
      return null;
    }

    credentials[idx] = {
      ...credentials[idx],
      inUse: Boolean(inUse),
      updatedAtUtc: new Date().toISOString()
    };

    await this.saveCredentials(credentials);
    return credentials[idx];
  }

  async setCredentialTested(credentialId, tested) {
    const credentials = await this.loadCredentials();
    const idx = credentials.findIndex((item) => item.credentialId === credentialId);
    if (idx < 0) {
      return null;
    }

    credentials[idx] = {
      ...credentials[idx],
      tested: Boolean(tested),
      updatedAtUtc: new Date().toISOString()
    };

    await this.saveCredentials(credentials);
    return credentials[idx];
  }
}

class TableStore {
  constructor() {
    if (config.tableAccountName) {
      this.client = new TableClient(
        `https://${config.tableAccountName}.table.core.windows.net`,
        config.tableName,
        new DefaultAzureCredential()
      );
    } else {
      this.client = TableClient.fromConnectionString(config.tableConnectionString, config.tableName);
    }

    this.credentialsPartitionKey = `${config.eventId}${CREDENTIALS_PARTITION_SUFFIX}`;
  }

  async initialize() {
    try {
      await this.client.createTable();
    } catch (error) {
      if (error.statusCode !== 409) {
        throw error;
      }
    }
  }

  entityFromRecord(record) {
    return {
      partitionKey: config.eventId,
      rowKey: record.registrationId,
      status: record.status,
      name: record.name,
      title: record.title,
      agency: record.agency,
      trackSelected: record.trackSelected,
      lastName: record.lastName,
      lastInitial: record.lastInitial,
      checkedInAtUtc: record.checkedInAtUtc || "",
      createdAtUtc: record.createdAtUtc || new Date().toISOString()
    };
  }

  recordFromEntity(entity) {
    return {
      registrationId: entity.rowKey,
      status: entity.status,
      name: entity.name,
      title: entity.title,
      agency: entity.agency,
      trackSelected: entity.trackSelected,
      lastName: entity.lastName,
      lastInitial: entity.lastInitial,
      checkedInAtUtc: entity.checkedInAtUtc || "",
      createdAtUtc: entity.createdAtUtc || ""
    };
  }

  credentialEntityFromRecord(record) {
    return {
      partitionKey: this.credentialsPartitionKey,
      rowKey: record.credentialId,
      credential: record.credential,
      type: record.type,
      sourceUserPrincipalName: record.sourceUserPrincipalName || "",
      credentialFamilyId: record.credentialFamilyId || "",
      userAssignmentRegistrationId: record.userAssignmentRegistrationId || "",
      userAssignmentDisplayName: record.userAssignmentDisplayName || "",
      inUse: Boolean(record.inUse),
      tested: Boolean(record.tested),
      password: record.password || "",
      tap: record.tap || "",
      createdAtUtc: record.createdAtUtc || new Date().toISOString(),
      updatedAtUtc: record.updatedAtUtc || new Date().toISOString()
    };
  }

  credentialRecordFromEntity(entity) {
    return {
      credentialId: entity.rowKey,
      credential: entity.credential,
      type: entity.type,
      sourceUserPrincipalName: entity.sourceUserPrincipalName || "",
      credentialFamilyId: entity.credentialFamilyId || "",
      userAssignmentRegistrationId: entity.userAssignmentRegistrationId || "",
      userAssignmentDisplayName: entity.userAssignmentDisplayName || "",
      inUse: Boolean(entity.inUse),
      tested: Boolean(entity.tested),
      password: entity.password || "",
      tap: entity.tap || "",
      createdAtUtc: entity.createdAtUtc || "",
      updatedAtUtc: entity.updatedAtUtc || ""
    };
  }

  async listAll() {
    const entities = this.client.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${config.eventId}'`
      }
    });

    const records = [];
    for await (const entity of entities) {
      records.push(this.recordFromEntity(entity));
    }

    return records;
  }

  async listAllCredentials() {
    const entities = this.client.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${this.credentialsPartitionKey}'`
      }
    });

    const records = [];
    for await (const entity of entities) {
      records.push(this.credentialRecordFromEntity(entity));
    }

    return records;
  }

  async seedIfEmpty() {
    // In Azure-hosted environments, never auto-seed from sample data.
    // Production data must be loaded explicitly via POST /api/import.
    if (isAzureHosted) {
      return;
    }

    const existing = await this.listAll();
    if (existing.length > 0) {
      return;
    }

    const seed = await readSeedData();
    for (const record of seed) {
      await this.client.upsertEntity(this.entityFromRecord(record), "Replace");
    }
  }

  async listInitials() {
    const records = await this.listAll();
    const counts = new Map();

    for (const record of records) {
      const key = (record.lastInitial || "").toUpperCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([initial, count]) => ({ initial, count }));
  }

  async listByInitial(initial) {
    const desired = (initial || "").toUpperCase();
    const entities = this.client.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${config.eventId}' and lastInitial eq '${desired}'`
      }
    });

    const records = [];
    for await (const entity of entities) {
      records.push(this.recordFromEntity(entity));
    }

    return records.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  async getById(registrationId) {
    try {
      const entity = await this.client.getEntity(config.eventId, registrationId);
      return this.recordFromEntity(entity);
    } catch {
      return null;
    }
  }

  async checkIn(registrationId) {
    const record = await this.getById(registrationId);
    if (!record) {
      return null;
    }

    if (record.status !== "Checked-In") {
      record.status = "Checked-In";
      record.checkedInAtUtc = new Date().toISOString();
      await this.client.upsertEntity(this.entityFromRecord(record), "Replace");
    }

    return record;
  }

  async checkOut(registrationId) {
    const record = await this.getById(registrationId);
    if (!record) {
      return null;
    }

    record.status = "Pending";
    record.checkedInAtUtc = "";
    await this.client.upsertEntity(this.entityFromRecord(record), "Replace");
    return record;
  }

  async updateAttendee(registrationId, updates = {}) {
    const record = await this.getById(registrationId);
    if (!record) {
      return null;
    }

    const nextStatus = updates.status !== undefined ? String(updates.status || "").trim() : record.status;
    const nextTrack = updates.trackSelected !== undefined
      ? normalizeTrackName(updates.trackSelected)
      : record.trackSelected;

    const updated = {
      ...record,
      status: nextStatus || record.status,
      trackSelected: nextTrack || record.trackSelected
    };

    if (updated.status === "Checked-In") {
      updated.checkedInAtUtc = updated.checkedInAtUtc || new Date().toISOString();
    } else {
      updated.checkedInAtUtc = "";
    }

    await this.client.upsertEntity(this.entityFromRecord(updated), "Replace");
    return updated;
  }

  async getDashboard() {
    const records = await this.listAll();
    const totalRegistrants = records.length;
    const totalCheckedIn = records.filter((record) => record.status === "Checked-In").length;

    const trackCounts = {
      "No Code": 0,
      "Low Code": 0,
      "Pro Code": 0,
      Unknown: 0
    };

    for (const record of records) {
      const track = record.trackSelected || "Unknown";
      if (trackCounts[track] === undefined) {
        trackCounts[track] = 0;
      }
      trackCounts[track] += 1;
    }

    return {
      totalRegistrants,
      totalCheckedIn,
      trackCounts,
      checkedInTrackCounts: buildCheckedInTrackCounts(records)
    };
  }

  async getTrackAgencies(trackName) {
    const records = await this.listAll();
    const groups = new Map();
    const includeAllTracks = String(trackName || "").trim().toLowerCase() === "all tracks";

    for (const record of records) {
      if (!includeAllTracks && (record.trackSelected || "Unknown") !== trackName) {
        continue;
      }
      const normalizedAgency = normalizeAgencyName(record.agency || "");
      if (!groups.has(normalizedAgency)) {
        groups.set(normalizedAgency, []);
      }
      groups.get(normalizedAgency).push({
        ...record,
        agency: normalizedAgency
      });
    }

    return [...groups.entries()]
      .sort((a, b) => {
        const byCount = b[1].length - a[1].length;
        if (byCount !== 0) {
          return byCount;
        }
        return a[0].localeCompare(b[0]);
      })
      .map(([agency, attendees]) => ({
        agency,
        attendees: attendees.sort((a, b) => a.lastName.localeCompare(b.lastName))
      }));
  }

  async importRecords(inputRecords) {
    let imported = 0;

    for (let i = 0; i < inputRecords.length; i += 1) {
      const normalized = normalizeImportRecord(inputRecords[i], i);
      if (!normalized) {
        continue;
      }

      await this.client.upsertEntity(this.entityFromRecord(normalized), "Replace");
      imported += 1;
    }

    const records = await this.listAll();
    return {
      imported,
      total: records.length
    };
  }

  async replaceRecords(inputRecords) {
    const normalized = [];

    for (let i = 0; i < inputRecords.length; i += 1) {
      const record = normalizeImportRecord(inputRecords[i], i);
      if (!record) {
        continue;
      }
      normalized.push(record);
    }

    const keepIds = new Set(normalized.map((item) => item.registrationId));
    const existing = await this.listAll();

    for (const row of existing) {
      if (keepIds.has(row.registrationId)) {
        continue;
      }
      await this.client.deleteEntity(config.eventId, row.registrationId);
    }

    for (const row of normalized) {
      await this.client.upsertEntity(this.entityFromRecord(row), "Replace");
    }

    return {
      imported: normalized.length,
      total: normalized.length
    };
  }

  async registerAttendee(input) {
    const existing = await this.listAll();
    const normalized = normalizeImportRecord(
      {
        ...input,
        status: "Pending"
      },
      existing.length
    );

    if (!normalized) {
      throw new Error("Name is required.");
    }

    await this.client.upsertEntity(this.entityFromRecord(normalized), "Replace");
    return normalized;
  }

  async listCheckedIn() {
    const records = await this.listAll();
    return records
      .filter((record) => record.status === "Checked-In")
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  async listAllAttendees() {
    const records = await this.listAll();
    return records.sort((a, b) => {
      const byLastName = (a.lastName || "").localeCompare(b.lastName || "");
      if (byLastName !== 0) {
        return byLastName;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }

  async listCredentialsGroupedByType() {
    const credentials = await this.listAllCredentials();
    return groupCredentialsByType(credentials);
  }

  async importCredentials(inputRecords) {
    let imported = 0;

    for (const input of inputRecords) {
      const expandedRecords = expandCredentialImportRecords(input);
      for (const normalized of expandedRecords) {
        try {
          const existing = await this.client.getEntity(this.credentialsPartitionKey, normalized.credentialId);
          normalized.createdAtUtc = existing.createdAtUtc || normalized.createdAtUtc;
        } catch {
          // No existing entity found; keep normalized timestamps.
        }

        await this.client.upsertEntity(this.credentialEntityFromRecord(normalized), "Replace");
        imported += 1;
      }
    }

    const total = (await this.listAllCredentials()).length;
    return {
      imported,
      total
    };
  }

  async assignCredential(credentialId, registrationId) {
    const credentials = await this.listAllCredentials();
    const idx = credentials.findIndex((item) => item.credentialId === credentialId);
    if (idx < 0) {
      return null;
    }

    const attendees = await this.listAll();
    const normalizedRegistrationId = String(registrationId || "").trim();
    const assignee = normalizedRegistrationId
      ? attendees.find((item) => item.registrationId === normalizedRegistrationId)
      : null;

    if (normalizedRegistrationId && !assignee) {
      throw new Error("Assigned registrant was not found.");
    }

    const target = credentials[idx];
    const now = new Date().toISOString();
    const updates = [];

    for (const credential of credentials) {
      if (
        credential.credentialId !== target.credentialId &&
        credential.type === target.type &&
        credential.userAssignmentRegistrationId === normalizedRegistrationId &&
        normalizedRegistrationId
      ) {
        updates.push({
          ...credential,
          userAssignmentRegistrationId: "",
          userAssignmentDisplayName: "",
          updatedAtUtc: now
        });
      }
    }

    const updatedTarget = {
      ...target,
      userAssignmentRegistrationId: normalizedRegistrationId,
      userAssignmentDisplayName: assignee?.name || "",
      updatedAtUtc: now
    };
    updates.push(updatedTarget);

    for (const update of updates) {
      await this.client.upsertEntity(this.credentialEntityFromRecord(update), "Replace");
    }

    return updatedTarget;
  }

  async setCredentialInUse(credentialId, inUse) {
    const credentials = await this.listAllCredentials();
    const target = credentials.find((item) => item.credentialId === credentialId);
    if (!target) {
      return null;
    }

    const updated = {
      ...target,
      inUse: Boolean(inUse),
      updatedAtUtc: new Date().toISOString()
    };

    await this.client.upsertEntity(this.credentialEntityFromRecord(updated), "Replace");
    return updated;
  }

  async setCredentialTested(credentialId, tested) {
    const credentials = await this.listAllCredentials();
    const target = credentials.find((item) => item.credentialId === credentialId);
    if (!target) {
      return null;
    }

    const updated = {
      ...target,
      tested: Boolean(tested),
      updatedAtUtc: new Date().toISOString()
    };

    await this.client.upsertEntity(this.credentialEntityFromRecord(updated), "Replace");
    return updated;
  }
}

let singletonStore = null;

export async function getRegistrationStore() {
  if (singletonStore) {
    return singletonStore;
  }

  const hasTableConfig = Boolean(config.tableConnectionString || config.tableAccountName);
  const shouldUseTableStorage = hasTableConfig && (config.useTableStorage || isAzureHosted);

  if (shouldUseTableStorage) {
    const maxAttempts = 3;
    const retryDelayMs = 2000;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        singletonStore = new TableStore();
        await singletonStore.initialize();
        await singletonStore.seedIfEmpty();
        return singletonStore;
      } catch (error) {
        lastError = error;
        singletonStore = null;
        if (attempt < maxAttempts) {
          console.warn(`Table storage init attempt ${attempt}/${maxAttempts} failed; retrying in ${retryDelayMs}ms.`, error?.message || error);
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    if (isAzureHosted) {
      // In production, never silently fall back — surface the error so the
      // caller receives a clean 500 instead of stale sample data.
      throw new Error(`Table storage unavailable after ${maxAttempts} attempts: ${lastError?.message || lastError}`);
    }

    console.warn("Table storage unavailable; falling back to local storage.", lastError?.message || lastError);
  }

  singletonStore = new LocalFileStore();
  await singletonStore.initialize();
  await singletonStore.seedIfEmpty();
  return singletonStore;
}

export function getSupportedTracks() {
  return TRACKS;
}

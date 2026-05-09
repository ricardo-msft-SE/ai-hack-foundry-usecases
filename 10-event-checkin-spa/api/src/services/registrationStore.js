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
const seedDataPathCandidates = [
  path.resolve(projectRoot, "sample-data", "initial-registrations.json"),
  path.resolve(projectRoot, "..", "sample-data", "initial-registrations.json")
];

const TRACKS = ["No Code", "Low Code", "Pro Code"];
const TRACK_SET = new Set([...TRACKS, "Unknown"]);

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
    agency: input.agency || "",
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
  const agency = String(input.agency || input.Agency || "").trim();
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

    for (const record of records) {
      if ((record.trackSelected || "Unknown") !== trackName) {
        continue;
      }
      if (!groups.has(record.agency)) {
        groups.set(record.agency, []);
      }
      groups.get(record.agency).push(record);
    }

    return [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
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

  async seedIfEmpty() {
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

    for (const record of records) {
      if ((record.trackSelected || "Unknown") !== trackName) {
        continue;
      }
      if (!groups.has(record.agency)) {
        groups.set(record.agency, []);
      }
      groups.get(record.agency).push(record);
    }

    return [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
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
}

let singletonStore = null;

export async function getRegistrationStore() {
  if (singletonStore) {
    return singletonStore;
  }

  const hasTableConfig = Boolean(config.tableConnectionString || config.tableAccountName);
  const shouldUseTableStorage = hasTableConfig && (config.useTableStorage || isAzureHosted);

  if (shouldUseTableStorage) {
    try {
      singletonStore = new TableStore();
      await singletonStore.initialize();
      await singletonStore.seedIfEmpty();
      return singletonStore;
    } catch (error) {
      console.warn("Table storage unavailable; falling back to local storage.", error?.message || error);
      singletonStore = null;
    }
  }

  singletonStore = new LocalFileStore();
  await singletonStore.initialize();
  await singletonStore.seedIfEmpty();
  return singletonStore;
}

export function getSupportedTracks() {
  return TRACKS;
}

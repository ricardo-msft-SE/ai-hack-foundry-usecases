import { app } from "@azure/functions";
import { getRegistrationStore, getSupportedTracks } from "./services/registrationStore.js";

function json(data, status = 200) {
  return {
    status,
    jsonBody: data,
    headers: {
      "Content-Type": "application/json"
    }
  };
}

function badRequest(message) {
  return json({ error: message }, 400);
}

function getPathSegments(request) {
  const pathname = new URL(request.url).pathname;
  return pathname.split("/").filter(Boolean);
}

function getAttendeeIdFromRequest(request) {
  const segments = getPathSegments(request);
  const checkinIndex = segments.indexOf("checkin");
  if (checkinIndex > 0) {
    return segments[checkinIndex - 1];
  }

  const attendeesIndex = segments.indexOf("attendees");
  if (attendeesIndex >= 0 && attendeesIndex + 1 < segments.length) {
    return segments[attendeesIndex + 1];
  }

  return "";
}

function getTrackFromRequest(request) {
  const segments = getPathSegments(request);
  const tracksIndex = segments.indexOf("tracks");
  if (tracksIndex >= 0 && tracksIndex + 1 < segments.length) {
    return decodeURIComponent(segments[tracksIndex + 1]);
  }

  return "";
}

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: async () => json({ ok: true })
});

app.http("getInitials", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "initials",
  handler: async () => {
    const store = await getRegistrationStore();
    const initials = await store.listInitials();
    return json({ initials });
  }
});

app.http("getAttendees", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "attendees",
  handler: async (request) => {
    const initial = request.query.get("initial");
    if (!initial) {
      return badRequest("Missing required query parameter: initial");
    }

    const store = await getRegistrationStore();
    const attendees = await store.listByInitial(initial);
    return json({ attendees });
  }
});

app.http("getAttendeeByQuery", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "attendee",
  handler: async (request) => {
    const id = request.query.get("id") || "";
    if (!id) {
      return badRequest("Missing required query parameter: id");
    }

    const store = await getRegistrationStore();
    const attendee = await store.getById(id);
    if (!attendee) {
      return json({ error: "Attendee not found" }, 404);
    }

    return json({ attendee });
  }
});

app.http("getAttendeeById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "attendees/{id}",
  handler: async (request) => {
    const id = getAttendeeIdFromRequest(request);
    if (!id) {
      return badRequest("Attendee id is required.");
    }
    const store = await getRegistrationStore();
    const attendee = await store.getById(id);

    if (!attendee) {
      return json({ error: "Attendee not found" }, 404);
    }

    return json({ attendee });
  }
});

app.http("checkInAttendee", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "attendees/{id}/checkin",
  handler: async (request) => {
    const id = getAttendeeIdFromRequest(request);
    if (!id) {
      return badRequest("Attendee id is required.");
    }
    const store = await getRegistrationStore();
    const attendee = await store.checkIn(id);

    if (!attendee) {
      return json({ error: "Attendee not found" }, 404);
    }

    return json({ attendee });
  }
});

app.http("getDashboard", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "dashboard",
  handler: async () => {
    const store = await getRegistrationStore();
    const dashboard = await store.getDashboard();
    return json({
      ...dashboard,
      tracks: getSupportedTracks()
    });
  }
});

app.http("getTrackAgencies", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "tracks/{track}/agencies",
  handler: async (request) => {
    const track = getTrackFromRequest(request);
    if (!track) {
      return badRequest("Track name is required.");
    }

    const store = await getRegistrationStore();
    const agencies = await store.getTrackAgencies(track);

    return json({
      track,
      agencies
    });
  }
});

app.http("getTrackAgenciesByQuery", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "track-agencies",
  handler: async (request) => {
    const track = request.query.get("track") || "";
    if (!track) {
      return badRequest("Missing required query parameter: track");
    }

    const store = await getRegistrationStore();
    const agencies = await store.getTrackAgencies(track);
    return json({ track, agencies });
  }
});

app.http("importRegistrations", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "import",
  handler: async (request) => {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const attendees = payload?.attendees;
    if (!Array.isArray(attendees)) {
      return badRequest("Body must include an attendees array.");
    }

    const store = await getRegistrationStore();
    const result = await store.importRecords(attendees);

    return json({
      message: "Import completed.",
      ...result
    });
  }
});

app.http("replaceRegistrations", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "replace",
  handler: async (request) => {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const attendees = payload?.attendees;
    if (!Array.isArray(attendees)) {
      return badRequest("Body must include an attendees array.");
    }

    const store = await getRegistrationStore();
    const result = await store.replaceRecords(attendees);

    return json({
      message: "Replace completed.",
      ...result
    });
  }
});

app.http("checkInAttendeeByQuery", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "checkin",
  handler: async (request) => {
    const id = request.query.get("id") || "";
    if (!id) {
      return badRequest("Missing required query parameter: id");
    }

    const store = await getRegistrationStore();
    const attendee = await store.checkIn(id);
    if (!attendee) {
      return json({ error: "Attendee not found" }, 404);
    }

    return json({ attendee });
  }
});

app.http("checkOutAttendeeByQuery", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "checkout",
  handler: async (request) => {
    const id = request.query.get("id") || "";
    if (!id) {
      return badRequest("Missing required query parameter: id");
    }

    const store = await getRegistrationStore();
    const attendee = await store.checkOut(id);
    if (!attendee) {
      return json({ error: "Attendee not found" }, 404);
    }

    return json({ attendee });
  }
});

app.http("updateAttendeeByQuery", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "attendee/update",
  handler: async (request) => {
    const id = request.query.get("id") || "";
    if (!id) {
      return badRequest("Missing required query parameter: id");
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    if (payload?.status === undefined && payload?.trackSelected === undefined) {
      return badRequest("Body must include status and/or trackSelected.");
    }

    const store = await getRegistrationStore();
    const attendee = await store.updateAttendee(id, {
      status: payload?.status,
      trackSelected: payload?.trackSelected
    });

    if (!attendee) {
      return json({ error: "Attendee not found" }, 404);
    }

    return json({ attendee });
  }
});

app.http("registerAttendee", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "register",
  handler: async (request) => {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    if (!payload?.name) {
      return badRequest("Field 'name' is required.");
    }

    const store = await getRegistrationStore();
    const attendee = await store.registerAttendee(payload);
    return json({ attendee }, 201);
  }
});

app.http("getCredentials", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "credentials",
  handler: async () => {
    const store = await getRegistrationStore();
    const groups = await store.listCredentialsGroupedByType();
    const registrants = await store.listAllAttendees();

    return json({
      groups,
      registrants
    });
  }
});

app.http("importCredentials", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "credentials/import",
  handler: async (request) => {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const credentials = payload?.credentials;
    if (!Array.isArray(credentials)) {
      return badRequest("Body must include a credentials array.");
    }

    const store = await getRegistrationStore();
    const result = await store.importCredentials(credentials);

    return json({
      message: "Credential import completed.",
      ...result
    });
  }
});

app.http("assignCredential", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "credentials/assign",
  handler: async (request) => {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const credentialId = String(payload?.credentialId || "").trim();
    const registrationId = String(payload?.registrationId || "").trim();

    if (!credentialId) {
      return badRequest("Field 'credentialId' is required.");
    }

    const store = await getRegistrationStore();
    try {
      const credential = await store.assignCredential(credentialId, registrationId);
      if (!credential) {
        return json({ error: "Credential not found" }, 404);
      }

      return json({ credential });
    } catch (error) {
      return badRequest(error?.message || "Unable to assign credential.");
    }
  }
});

app.http("setCredentialInUse", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "credentials/inuse",
  handler: async (request) => {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const credentialId = String(payload?.credentialId || "").trim();
    if (!credentialId) {
      return badRequest("Field 'credentialId' is required.");
    }

    const inUse = Boolean(payload?.inUse);
    const store = await getRegistrationStore();
    const credential = await store.setCredentialInUse(credentialId, inUse);
    if (!credential) {
      return json({ error: "Credential not found" }, 404);
    }

    return json({ credential });
  }
});

app.http("setCredentialTested", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "credentials/tested",
  handler: async (request) => {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const credentialId = String(payload?.credentialId || "").trim();
    if (!credentialId) {
      return badRequest("Field 'credentialId' is required.");
    }

    const tested = Boolean(payload?.tested);
    const store = await getRegistrationStore();
    const credential = await store.setCredentialTested(credentialId, tested);
    if (!credential) {
      return json({ error: "Credential not found" }, 404);
    }

    return json({ credential });
  }
});

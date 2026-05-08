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
  route: "admin/import",
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

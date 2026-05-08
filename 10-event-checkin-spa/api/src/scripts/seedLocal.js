import { getRegistrationStore } from "../services/registrationStore.js";

const store = await getRegistrationStore();
await store.seedIfEmpty();

console.log("Seed complete.");

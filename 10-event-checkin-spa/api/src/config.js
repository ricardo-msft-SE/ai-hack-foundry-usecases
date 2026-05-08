export const config = {
  eventId: process.env.EVENT_ID || "hackathon-registration-state-ohio",
  useTableStorage: String(process.env.USE_TABLE_STORAGE || "false").toLowerCase() === "true",
  tableConnectionString: process.env.AZURE_TABLE_CONNECTION_STRING || "",
  tableName: process.env.AZURE_TABLE_NAME || "Registrations",
  tableAccountName: process.env.AZURE_TABLE_ACCOUNT_NAME || ""
};

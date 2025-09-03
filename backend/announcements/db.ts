import { SQLDatabase } from "encore.dev/storage/sqldb";

export const announcementsDB = new SQLDatabase("announcements", {
  migrations: "./migrations",
});

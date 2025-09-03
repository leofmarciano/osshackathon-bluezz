import { SQLDatabase } from "encore.dev/storage/sqldb";

export const manifestoDB = new SQLDatabase("manifesto", {
  migrations: "./migrations",
});
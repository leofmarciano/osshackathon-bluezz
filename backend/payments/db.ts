import { SQLDatabase } from "encore.dev/storage/sqldb";

export const paymentsDB = new SQLDatabase("payments", {
  migrations: "./migrations",
});

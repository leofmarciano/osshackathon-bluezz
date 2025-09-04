import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";
import log from "encore.dev/log";

// Import the checkVotingStatus function
import { checkVotingStatus } from "./companies";

// Cron job to check voting status every hour
const _ = new CronJob("check-company-voting", {
  title: "Check Company Voting Status",
  every: "1h",
  endpoint: runVotingCheck,
});

// API endpoint for the cron job
export const runVotingCheck = api(
  { expose: false },
  async (): Promise<{ message: string }> => {
    try {
      log.info("Starting company voting status check");
      
      const result = await checkVotingStatus();
      
      log.info("Company voting status check completed", { 
        processed: result.processed 
      });
      
      return {
        message: `Voting status check completed. ${result.message}`
      };
    } catch (error) {
      log.error("Failed to run voting status check", error as Error);
      throw error;
    }
  }
);
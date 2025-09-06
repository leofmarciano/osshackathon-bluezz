import { Bucket } from "encore.dev/storage/objects";

// Bucket for storing ocean monitoring images
export const oceanImages = new Bucket("ocean-images", {
  versioned: false,
  public: false
});
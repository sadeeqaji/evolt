import { z } from "zod";

// Based on the columns in the screenshot
export const collectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  supply: z.number(),
  items: z.number(),
  floor: z.string(), // Using string for "---" or "0.1 ETH"
  totalVolume: z.string(), // Using string for "---" or "10 ETH"
  sales: z.number(),
  owners: z.number(),
  listed: z.string(), // Using string for "---" or "10%"
});

export type Collection = z.infer<typeof collectionSchema>;

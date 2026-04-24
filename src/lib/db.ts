import { drizzle } from "drizzle-orm/d1";

export const getDb = (dbBinding: any) => {
  return drizzle(dbBinding);
};

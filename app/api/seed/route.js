import { seedTransactions } from "@/actions/seed";
import { protectRoute } from "@/lib/arcjet";

export async function GET(req) {
  // Add Arcjet protection
  const protection = await protectRoute(req);
  if (protection) return protection;

  const result = await seedTransactions();
  return Response.json(result);
}
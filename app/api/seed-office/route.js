import { seedOfficeTransactions } from "@/actions/seed-office";
import { protectRoute } from "@/lib/arcjet";

export async function GET(req) {
  // Add Arcjet protection
  const protection = await protectRoute(req);
  if (protection) return protection;

  const result = await seedOfficeTransactions();
  return Response.json(result);
}

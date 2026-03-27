import { db } from "@/lib/prisma";
import { generateInsightsFromStats } from "@/lib/ai/insights";

export async function GET() {
  const now = new Date();

  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  const transactions = await db.transaction.findMany({
    where: {
      date: { gte: startDate },
    },
  });

  const stats = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount);

      if (t.type === "EXPENSE") {
        acc.totalExpenses += amount;
        acc.byCategory[t.category] =
          (acc.byCategory[t.category] || 0) + amount;
      } else {
        acc.totalIncome += amount;
      }

      return acc;
    },
    { totalIncome: 0, totalExpenses: 0, byCategory: {} }
  );

  const insights = await generateInsightsFromStats(stats, "this month");

  return Response.json({ insights });
}
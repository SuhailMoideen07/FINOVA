import { inngest } from "@/lib/inngest/client";
import {  checkBudgetAlerts, generateMonthlyReports } from "@/lib/inngest/functions";
import { serve } from "inngest/next";
import { processRecurringTransaction, triggerRecurringTransactions } from "@/lib/inngest/functions";
import { protectRoute } from "@/lib/arcjet";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [checkBudgetAlerts,
    triggerRecurringTransactions,
    processRecurringTransaction,
    generateMonthlyReports,
  ],
});
export async function POST(req) {
  const protection = await protectRoute(req);
  if (protection) return protection;
  
  // Your inngest code...
}
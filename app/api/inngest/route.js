import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlerts, generateMonthlyReports } from "@/lib/inngest/functions";
import { serve } from "inngest/next";
import { processRecurringTransaction, triggerRecurringTransactions } from "@/lib/inngest/functions";
import { protectRoute } from "@/lib/arcjet";
import { NextResponse } from "next/server";

// Create the serve handlers
const handlers = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts,
    triggerRecurringTransactions,
    processRecurringTransaction,
    generateMonthlyReports,
  ],
});

// Wrap GET with protection
export async function GET(req) {
  const protection = await protectRoute(req);
  if (protection) return protection;
  
  return handlers.GET(req);
}

// Wrap POST with protection
export async function POST(req) {
  const protection = await protectRoute(req);
  if (protection) return protection;
  
  return handlers.POST(req);
}

// Wrap PUT with protection
export async function PUT(req) {
  const protection = await protectRoute(req);
  if (protection) return protection;
  
  return handlers.PUT(req);
}
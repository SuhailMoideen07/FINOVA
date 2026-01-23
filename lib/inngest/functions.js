import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { endOfDay, startOfDay } from "date-fns";

// Helper function to safely convert any value to number
// Works with Prisma Decimal, plain numbers, strings, etc.
function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  // Handle Prisma Decimal or Decimal-like objects
  if (value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  // Handle string numbers or other types
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alerts",
    name: "Check Budget Alerts"
  },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true
                },
              },
            },
          },
        },
      });
    });

    console.log(`Found ${budgets.length} budgets to check`);

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      
      if (!defaultAccount) {
        console.warn(`No default account found for user ${budget.userId}, budget ${budget.id}`);
        continue;
      }

      await step.run(`check-budget-${budget.id}`, async () => {
        // Fix: Use startOfDay for proper date range
        const now = new Date();
        const startDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        const endDate = endOfDay(now);

        console.log(`Checking budget ${budget.id} for date range: ${startDate} to ${endDate}`);

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startDate,
              lte: endDate, // Add upper bound for clarity
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = toNumber(expenses._sum.amount);
        const budgetAmount = toNumber(budget.amount);

        console.log(`Budget ${budget.id}: Expenses=${totalExpenses}, Budget=${budgetAmount}`);

        if (budgetAmount === 0) {
          console.warn(`Budget ${budget.id} has zero amount`);
          return;
        }

        const percentageUsed = (totalExpenses / budgetAmount) * 100;
        console.log(`Budget ${budget.id}: ${percentageUsed.toFixed(1)}% used`);

        const shouldSendAlert = percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()));

        console.log(`Budget ${budget.id}: Should send alert? ${shouldSendAlert} (lastAlertSent: ${budget.lastAlertSent})`);
        
        if (shouldSendAlert) {
          const emailData = {
            percentageUsed: Number(percentageUsed).toFixed(1),
            budgetAmount: Number(budgetAmount).toFixed(2),
            totalExpenses: Number(totalExpenses).toFixed(2),
            accountName: defaultAccount.name,
          };

          console.log(`Sending budget alert email to ${budget.user.email}`);

          try {
            await sendEmail({
              to: budget.user.email,
              subject: `Budget Alert for ${defaultAccount.name}`,
              react: EmailTemplate({
                userName: budget.user.name,
                type: "budget-alert",
                data: emailData,
              })
            });

            console.log(`Email sent successfully for budget ${budget.id}`);

            await db.budget.update({
              where: { id: budget.id },
              data: { lastAlertSent: new Date() },
            });

            console.log(`Updated lastAlertSent for budget ${budget.id}`);
          } catch (error) {
            console.error(`Failed to send email for budget ${budget.id}:`, error);
            throw error; // Re-throw to mark step as failed
          }
        }
      });
    }

    return { checked: budgets.length };
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              { nextRecurringDate: { lte: new Date() } },
            ],
          },
        });
      }
    );

    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      await db.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: startOfDay(new Date()),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Use helper function for safe conversion
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -toNumber(transaction.amount)
            : toNumber(transaction.amount);

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  if (!transaction.nextRecurringDate) return true;

  const today = new Date();
  const nextDate = new Date(transaction.nextRecurringDate);

  return nextDate <= today;
}

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return db.user.findMany({
        include: { 
          accounts: true, // Get all accounts
        },
      });
    });

    console.log(`Generating monthly reports for ${users.length} users`);

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        if (user.accounts.length === 0) {
          console.warn(`No accounts found for user ${user.id}, skipping report`);
          return;
        }

        const now = new Date();
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthName = lastMonthDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        console.log(`Generating reports for user ${user.id} (${user.email}) - ${user.accounts.length} accounts`);

        // Collect stats for all accounts
        const accountReports = [];
        let totalIncome = 0;
        let totalExpenses = 0;
        let totalTransactions = 0;

        for (const account of user.accounts) {
          const stats = await getMonthlyStats(user.id, lastMonthDate, account.id);
          
          if (stats.transactionCount > 0) {
            accountReports.push({
              accountName: account.name,
              accountId: account.id,
              isDefault: account.isDefault,
              ...stats,
            });
            
            totalIncome += stats.totalIncome;
            totalExpenses += stats.totalExpenses;
            totalTransactions += stats.transactionCount;
          }
          
          console.log(`Account ${account.name}: Income=${stats.totalIncome}, Expenses=${stats.totalExpenses}, Transactions=${stats.transactionCount}`);
        }

        // Skip if no transactions across all accounts
        if (totalTransactions === 0) {
          console.log(`No transactions for user ${user.id} in ${monthName}, skipping report`);
          return;
        }

        // Generate insights based on total data
        const overallStats = {
          totalIncome,
          totalExpenses,
          byCategory: accountReports.reduce((acc, report) => {
            Object.entries(report.byCategory).forEach(([cat, amt]) => {
              acc[cat] = (acc[cat] || 0) + amt;
            });
            return acc;
          }, {}),
          transactionCount: totalTransactions,
        };

        const insights = await generateFinancialInsights(overallStats, monthName);

        // Format data for email
        const formattedAccountReports = accountReports.map(report => ({
          accountName: report.accountName,
          isDefault: report.isDefault,
          totalIncome: Number(report.totalIncome),
          totalExpenses: Number(report.totalExpenses),
          net: Number(report.totalIncome - report.totalExpenses),
          byCategory: Object.fromEntries(
            Object.entries(report.byCategory).map(([key, val]) => [key, Number(val)])
          ),
          transactionCount: report.transactionCount,
        }));

        const emailData = {
          accounts: formattedAccountReports,
          overall: {
            totalIncome: Number(totalIncome),
            totalExpenses: Number(totalExpenses),
            net: Number(totalIncome - totalExpenses),
            transactionCount: totalTransactions,
          },
          month: monthName,
          insights,
        };

        try {
          await sendEmail({
            to: user.email,
            subject: `Your Financial Report for ${monthName} - All Accounts`,
            react: EmailTemplate({
              userName: user.name,
              type: "monthly-report",
              data: emailData,
            }),
          });

          console.log(`Monthly report sent successfully to ${user.email} with ${accountReports.length} accounts`);
        } catch (error) {
          console.error(`Failed to send monthly report to ${user.email}:`, error);
          throw error;
        }
      });
    }

    return { processed: users.length };
  }
);

async function generateFinancialInsights(stats, month) {
  const prompt = `Analyze this financial data and provide 3 concise, actionable insights.
Focus on spending patterns and practical advice.
Keep it friendly and conversational.

Financial Data for ${month}:
- Total Income: ₹${stats.totalIncome}
- Total Expenses: ₹${stats.totalExpenses}
- Net Income: ₹${stats.totalIncome - stats.totalExpenses}
- Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: ₹${amount}`)
      .join(", ")}

Respond ONLY with a JSON array like:
["insight 1", "insight 2", "insight 3"]`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 512,
        }),
      }
    );

    const raw = await response.text();
    if (!response.ok) {
      throw new Error(`Groq API HTTP ${response.status}: ${raw}`);
    }

    const result = JSON.parse(raw);
    const text = result.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Empty Groq content");

    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI Insight generation failed:", err);
    return [
      "Your highest expense category this month deserves a closer look.",
      "Try setting a small savings goal for the coming month.",
      "Review recurring expenses to spot easy opportunities to save.",
    ];
  }
}

async function getMonthlyStats(userId, month, accountId = null) {
  // Fix: Proper month boundaries with detailed logging
  const startDate = startOfDay(new Date(month.getFullYear(), month.getMonth(), 1));
  const endDate = endOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  console.log(`===== Monthly Stats Query =====`);
  console.log(`User ID: ${userId}`);
  console.log(`Account ID: ${accountId || 'ALL ACCOUNTS'}`);
  console.log(`Month param: ${month.toISOString()}`);
  console.log(`Start Date: ${startDate.toISOString()}`);
  console.log(`End Date: ${endDate.toISOString()}`);
  console.log(`===============================`);

  const whereClause = {
    userId,
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  // Filter by account if provided
  if (accountId) {
    whereClause.accountId = accountId;
  }

  const transactions = await db.transaction.findMany({
    where: whereClause,
  });

  console.log(`Found ${transactions.length} transactions for user ${userId}${accountId ? ` in account ${accountId}` : ' (all accounts)'}`);
  
  if (transactions.length > 0) {
    console.log(`First transaction date: ${transactions[0].date}`);
    console.log(`Last transaction date: ${transactions[transactions.length - 1].date}`);
  }

  return transactions.reduce(
    (stats, t) => {
      // Use helper function for safe conversion
      const amount = toNumber(t.amount);

      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}
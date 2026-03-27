import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(req) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return Response.json({ error: "Message required" }, { status: 400 });
    }

    const user = await currentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
      include: { accounts: true },
    });

    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = dbUser.id;
    const now = new Date();

    // Last 3 months metadata
    const months = [0, 1, 2].map((i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        label: date.toLocaleString("default", { month: "long", year: "numeric" }),
        start: startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)),
        end: endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
      };
    });

    // Build compact financial context per project per month
    const projectSummaries = await Promise.all(
      dbUser.accounts.map(async (account) => {
        const monthlyData = await Promise.all(
          months.map(async (m) => {
            const transactions = await db.transaction.findMany({
              where: {
                userId,
                accountId: account.id,
                date: { gte: m.start, lte: m.end },
              },
              select: { type: true, amount: true, category: true },
            });

            let income = 0;
            let expenses = 0;
            const byCategory = {};

            for (const t of transactions) {
              const amt = Number(t.amount);
              if (t.type === "EXPENSE") {
                expenses += amt;
                byCategory[t.category] = (byCategory[t.category] || 0) + amt;
              } else {
                income += amt;
              }
            }

            const topCategories = Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([cat, amt]) => `${cat} ₹${amt.toLocaleString("en-IN")}`)
              .join(" | ") || "No transactions";

            return `  ${m.label}: Income ₹${income.toLocaleString("en-IN")} | Expenses ₹${expenses.toLocaleString("en-IN")} | Net ₹${(income - expenses).toLocaleString("en-IN")} | Top: ${topCategories}`;
          })
        );

        return `[${account.name}]\n${monthlyData.join("\n")}`;
      })
    );

    const currentMonth = months[0].label;
    const previousMonth = months[1].label;
    const financialContext = projectSummaries.join("\n\n");

    const systemPrompt = `You are Finova AI, a precise financial assistant for a construction project management app.

FINANCIAL DATA (last 3 months):
${financialContext}

RESPONSE RULES — follow strictly:
1. Answer in 3–5 lines maximum. No exceptions.
2. Lead with the key number or insight first.
3. Use ₹ with Indian comma formatting (e.g. ₹1,23,456).
4. "This month" = ${currentMonth}. "Last month" = ${previousMonth}.
5. When comparing projects or months, use a simple side-by-side format.
6. Never give generic financial advice. Stick to the user's actual data.
7. If data is missing or zero, say so plainly — don't pad the response.
8. End with one sharp, actionable observation if relevant.`;

    // Keep last 10 messages to avoid hitting token limits
    const trimmedHistory = history.slice(-10);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...trimmedHistory,
          { role: "user", content: message },
        ],
        temperature: 0.4,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const raw = await response.text();
      console.error("❌ Groq Error:", raw);
      throw new Error("Groq API failed");
    }

    const result = await response.json();
    const reply =
      result.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a response.";

    return Response.json({ reply });
  } catch (error) {
    console.error("🔥 CHAT API ERROR:", error);
    return Response.json(
      { reply: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
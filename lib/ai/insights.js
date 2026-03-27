export async function generateInsightsFromStats(stats, label = "this period") {
  const prompt = `Analyze this financial data and provide 3 concise, actionable insights.
Focus on spending patterns and practical advice.
Keep it friendly and conversational.

Financial Data for ${label}:
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
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
    const result = JSON.parse(raw);
    const text = result.choices?.[0]?.message?.content || "";

    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return [
      "Your spending pattern shows areas that can be optimized.",
      "Consider reviewing high expense categories.",
      "Maintaining a balance between income and expenses will improve stability.",
    ];
  }
}
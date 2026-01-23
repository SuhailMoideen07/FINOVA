"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

const ACCOUNT_ID = "a999809b-77ac-49f4-bb7e-083bf6b41e70";
const USER_ID = "6f91417a-2ed9-485f-b399-cd7d60d3c69f";

// Office-focused categories (only from your category.js)
const CATEGORIES = {
  INCOME: [
    { name: "consultation-fee", range: [3000, 20000], desc: "Design & planning consultation" },
    { name: "rental-income", range: [6000, 30000], desc: "Office space or equipment rent" },
    { name: "other-income", range: [2000, 15000], desc: "Miscellaneous office income" },
    { name: "maintenance-contract", range: [8000, 40000], desc: "Annual maintenance contract" },
  ],

  EXPENSE: [
    { name: "office-expense", range: [3000, 20000], desc: "Office rent & stationery" },
    { name: "marketing", range: [2000, 12000], desc: "Advertising & promotion" },
    { name: "site-utilities", range: [1500, 8000], desc: "Electricity & water bills" },
    { name: "travel-site", range: [1200, 9000], desc: "Client visit & site travel" },
    { name: "health-safety", range: [2000, 12000], desc: "Insurance & safety items" },
    { name: "other-expense", range: [1000, 8000], desc: "Miscellaneous office expense" },
  ],
};

function getRandomAmount(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function pick(type) {
  const list = CATEGORIES[type];
  const item = list[Math.floor(Math.random() * list.length)];
  return {
    category: item.name,
    amount: getRandomAmount(item.range[0], item.range[1]),
    desc: item.desc,
  };
}

export async function seedOfficeTransactions() {
  try {
    const transactions = [];
    let totalBalance = 0;

    // 120 days of office activity
    for (let i = 120; i >= 0; i--) {
      const date = subDays(new Date(), i);

      // Office is calmer: 0–2 entries per day
      const count = Math.floor(Math.random() * 3);

      for (let j = 0; j < count; j++) {
        // Office is more balanced than projects
        const type = Math.random() < 0.48 ? "INCOME" : "EXPENSE";
        const { category, amount, desc } = pick(type);

        const transaction = {
          id: crypto.randomUUID(),
          type,
          amount,
          description:
            type === "INCOME"
              ? `Received – ${desc}`
              : `Paid for ${desc}`,
          date,
          category,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        };

        totalBalance += type === "INCOME" ? amount : -amount;
        transactions.push(transaction);
      }
    }

    // Safety net: ensure office never ends negative
    if (totalBalance < 0) {
      const fixAmount = Math.abs(totalBalance) + getRandomAmount(20000, 60000);
      const date = new Date();

      transactions.push({
        id: crypto.randomUUID(),
        type: "INCOME",
        amount: fixAmount,
        description: "Received – Office fund adjustment",
        date,
        category: "other-income",
        status: "COMPLETED",
        userId: USER_ID,
        accountId: ACCOUNT_ID,
        createdAt: date,
        updatedAt: date,
      });

      totalBalance += fixAmount;
    }

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      await tx.transaction.createMany({
        data: transactions,
      });

      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Seeded ${transactions.length} office transactions (final balance ₹${totalBalance})`,
    };
  } catch (error) {
    console.error("Error seeding office transactions:", error);
    return { success: false, error: error.message };
  }
}

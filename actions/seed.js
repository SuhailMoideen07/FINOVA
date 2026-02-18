"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

const ACCOUNT_ID = "6c0b39c4-907c-4002-aaca-d183c799dfb3";
const USER_ID = "bd43262b-1dff-4265-9684-8926ae852c7b";

// Project-focused GLES categories (only from your category.js)
const CATEGORIES = {
  INCOME: [
    { name: "project-payment", range: [120000, 450000], desc: "House construction project payment" },
    { name: "advance-receipt", range: [40000, 220000], desc: "Advance for new house project" },
    { name: "consultation-fee", range: [5000, 30000], desc: "House plan & design consultation" },
    { name: "maintenance-contract", range: [10000, 70000], desc: "Annual maintenance contract" },
    { name: "other-income", range: [3000, 25000], desc: "Miscellaneous company income" },
  ],

  EXPENSE: [
    { name: "building-materials", range: [20000, 180000], desc: "Cement, sand & bricks purchase" },
    { name: "steel-iron", range: [18000, 160000], desc: "Steel rods & structural iron" },
    { name: "labour-wages", range: [12000, 65000], desc: "Daily labour & contract wages" },
    { name: "machinery-rent", range: [6000, 40000], desc: "JCB, mixer & equipment rent" },
    { name: "transport-logistics", range: [3000, 28000], desc: "Material transport & fuel" },
    { name: "site-utilities", range: [1500, 10000], desc: "Site electricity & water" },
    { name: "tools-equipment", range: [4000, 35000], desc: "Construction tools & safety gear" },
    { name: "travel-site", range: [1200, 14000], desc: "Engineer site visit travel" },
    { name: "permits-fees", range: [5000, 32000], desc: "Panchayat & building permits" },
    { name: "health-safety", range: [2000, 18000], desc: "Insurance & safety equipment" },
    { name: "other-expense", range: [1000, 12000], desc: "Miscellaneous site expense" },
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

export async function seedTransactions() {
  try {
    const transactions = [];
    let totalBalance = 0;

    // 120 days (~4 months)
    for (let i = 120; i >= 0; i--) {
      const date = subDays(new Date(), i);

      // 1–4 entries per day
      const count = Math.floor(Math.random() * 4) + 1;

      for (let j = 0; j < count; j++) {
        // More expenses day-to-day, but incomes are larger
        const type = Math.random() < 0.38 ? "INCOME" : "EXPENSE";
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

    // Safety net: if somehow negative, inject a final project payment
    if (totalBalance < 0) {
      const fixAmount = Math.abs(totalBalance) + getRandomAmount(50000, 150000);
      const date = new Date();

      transactions.push({
        id: crypto.randomUUID(),
        type: "INCOME",
        amount: fixAmount,
        description: "Received – Final project settlement",
        date,
        category: "project-payment",
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
      message: `Seeded ${transactions.length} project transactions (final balance ₹${totalBalance})`,
    };
  } catch (error) {
    console.error("Error seeding project transactions:", error);
    return { success: false, error: error.message };
  }
}

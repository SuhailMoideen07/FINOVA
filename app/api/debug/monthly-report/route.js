// Create this file: app/api/debug/monthly-report/route.js

import { db } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { NextResponse } from "next/server";

// Helper function to safely convert any value to number
function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

async function getMonthlyStats(userId, month) {
  const startDate = startOfDay(new Date(month.getFullYear(), month.getMonth(), 1));
  const endDate = endOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      account: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  const stats = transactions.reduce(
    (stats, t) => {
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

  return { stats, transactions, startDate, endDate };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate last month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const { stats, transactions, startDate, endDate } = await getMonthlyStats(userId, lastMonth);

    // Get dashboard stats for comparison (current month from first day)
    const currentMonthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const currentMonthEnd = endOfDay(now);
    
    const dashboardTransactions = await db.transaction.findMany({
      where: {
        userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      include: {
        account: true,
      },
    });

    const dashboardStats = dashboardTransactions.reduce(
      (stats, t) => {
        const amount = toNumber(t.amount);
        if (t.type === "EXPENSE") {
          stats.totalExpenses += amount;
        } else {
          stats.totalIncome += amount;
        }
        return stats;
      },
      { totalExpenses: 0, totalIncome: 0, transactionCount: dashboardTransactions.length }
    );

    // Group transactions by account
    const transactionsByAccount = transactions.reduce((acc, t) => {
      const accountName = t.account?.name || 'Unknown';
      if (!acc[accountName]) {
        acc[accountName] = { income: 0, expenses: 0, count: 0 };
      }
      const amount = toNumber(t.amount);
      if (t.type === "EXPENSE") {
        acc[accountName].expenses += amount;
      } else {
        acc[accountName].income += amount;
      }
      acc[accountName].count++;
      return acc;
    }, {});

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accounts: user.accounts.map(a => ({
          id: a.id,
          name: a.name,
          isDefault: a.isDefault,
        })),
      },
      debug: {
        currentDate: now.toISOString(),
        queryMonth: lastMonth.toLocaleString("default", { month: "long", year: "numeric" }),
        queryStartDate: startDate.toISOString(),
        queryEndDate: endDate.toISOString(),
      },
      lastMonthReport: {
        month: lastMonth.toLocaleString("default", { month: "long", year: "numeric" }),
        totalIncome: stats.totalIncome,
        totalExpenses: stats.totalExpenses,
        net: stats.totalIncome - stats.totalExpenses,
        byCategory: stats.byCategory,
        transactionCount: stats.transactionCount,
        byAccount: transactionsByAccount,
      },
      currentMonthDashboard: {
        month: now.toLocaleString("default", { month: "long", year: "numeric" }),
        dateRange: `${currentMonthStart.toISOString()} to ${currentMonthEnd.toISOString()}`,
        totalIncome: dashboardStats.totalIncome,
        totalExpenses: dashboardStats.totalExpenses,
        net: dashboardStats.totalIncome - dashboardStats.totalExpenses,
        transactionCount: dashboardStats.transactionCount,
      },
      sampleTransactions: {
        lastMonth: transactions.slice(0, 5).map(t => ({
          date: t.date,
          type: t.type,
          amount: toNumber(t.amount),
          category: t.category,
          description: t.description,
          account: t.account?.name,
        })),
        currentMonth: dashboardTransactions.slice(0, 5).map(t => ({
          date: t.date,
          type: t.type,
          amount: toNumber(t.amount),
          category: t.category,
          description: t.description,
          account: t.account?.name,
        })),
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
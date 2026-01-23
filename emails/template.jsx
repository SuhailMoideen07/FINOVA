import {
  Html,
  Head,
  Body,
  Preview,
  Heading,
  Container,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = {},
}) {
  if (type === "monthly-report") {
    // New multi-account structure
    const { accounts = [], overall = {}, month = "", insights = [] } = data;
    const netAmount = overall.totalIncome - overall.totalExpenses;
    const isPositive = netAmount >= 0;

    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report - All Accounts</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            {/* Header */}
            <Section style={styles.header}>
              <Heading style={styles.heading}>Monthly Financial Report</Heading>
              <Text style={styles.headerSubtitle}>All Accounts Summary</Text>
            </Section>

            {/* Main Content */}
            <Section style={styles.content}>
              <Text style={styles.greeting}>Hello {userName},</Text>
              <Text style={styles.mainText}>
                Here&rsquo;s your comprehensive financial summary for {month}:
              </Text>

              {/* Overall Summary */}
              <Section style={styles.overallSection}>
                <Text style={styles.sectionTitle}>📊 Overall Summary</Text>
                <Section style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Income</Text>
                    <Text style={{ ...styles.statValue, color: "#10b981" }}>
                      ₹{overall.totalIncome?.toLocaleString()}
                    </Text>
                  </div>
                  <div style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Expenses</Text>
                    <Text style={{ ...styles.statValue, color: "#ef4444" }}>
                      ₹{overall.totalExpenses?.toLocaleString()}
                    </Text>
                  </div>
                  <div style={styles.statCard}>
                    <Text style={styles.statLabel}>Net Balance</Text>
                    <Text style={{ 
                      ...styles.statValue, 
                      color: isPositive ? "#10b981" : "#ef4444" 
                    }}>
                      {isPositive ? "+" : ""}₹{netAmount?.toLocaleString()}
                    </Text>
                  </div>
                  <div style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Transactions</Text>
                    <Text style={styles.statValue}>
                      {overall.transactionCount}
                    </Text>
                  </div>
                </Section>
              </Section>

              {/* Per-Account Breakdown */}
              {accounts.length > 0 && (
                <Section style={styles.accountsSection}>
                  <Text style={styles.sectionTitle}>💼 Per-Account Breakdown</Text>
                  {accounts
                    .sort((a, b) => {
                      // Default account first
                      if (a.isDefault && !b.isDefault) return -1;
                      if (!a.isDefault && b.isDefault) return 1;
                      return 0;
                    })
                    .map((account, index) => {
                    const accountNet = account.totalIncome - account.totalExpenses;
                    const accountPositive = accountNet >= 0;

                    return (
                      <Section key={index} style={styles.accountCard}>
                        <Text style={styles.accountName}>
                          {account.accountName}
                          {account.isDefault && (
                            <span style={styles.defaultBadge}> (Default)</span>
                          )}
                        </Text>
                        
                        <div style={styles.accountStats}>
                          <div style={styles.accountStatRow}>
                            <Text style={styles.accountStatLabel}>Income:</Text>
                            <Text style={{ ...styles.accountStatValue, color: "#10b981" }}>
                              ₹{account.totalIncome?.toLocaleString()}
                            </Text>
                          </div>
                          <div style={styles.accountStatRow}>
                            <Text style={styles.accountStatLabel}>Expenses:</Text>
                            <Text style={{ ...styles.accountStatValue, color: "#ef4444" }}>
                              ₹{account.totalExpenses?.toLocaleString()}
                            </Text>
                          </div>
                          <div style={styles.accountStatRow}>
                            <Text style={styles.accountStatLabel}>Net:</Text>
                            <Text style={{ 
                              ...styles.accountStatValue, 
                              color: accountPositive ? "#10b981" : "#ef4444",
                              fontWeight: "700"
                            }}>
                              {accountPositive ? "+" : ""}₹{accountNet?.toLocaleString()}
                            </Text>
                          </div>
                          <div style={styles.accountStatRow}>
                            <Text style={styles.accountStatLabel}>Transactions:</Text>
                            <Text style={styles.accountStatValue}>
                              {account.transactionCount}
                            </Text>
                          </div>
                        </div>

                        {/* Category Breakdown for this account */}
                        {account.byCategory && Object.keys(account.byCategory).length > 0 && (
                          <Section style={styles.categoryMini}>
                            <Text style={styles.categoryMiniTitle}>Expenses by Category:</Text>
                            {Object.entries(account.byCategory).map(([category, amount]) => (
                              <div key={category} style={styles.categoryMiniRow}>
                                <Text style={styles.categoryMiniLabel}>{category}</Text>
                                <Text style={styles.categoryMiniAmount}>
                                  ₹{amount?.toLocaleString()}
                                </Text>
                              </div>
                            ))}
                          </Section>
                        )}
                      </Section>
                    );
                  })}
                </Section>
              )}

              {/* AI Insights */}
              {insights && insights.length > 0 && (
                <Section style={styles.insightsSection}>
                  <Text style={styles.sectionTitle}>💡 FINOVA Insights</Text>
                  {insights.map((insight, index) => (
                    <Text key={index} style={styles.insightText}>
                      • {insight}
                    </Text>
                  ))}
                </Section>
              )}
            </Section>

            {/* Footer */}
            <Section style={styles.footer}>
              <Text style={styles.footerText}>
                Track your finances intelligently with FINOVA
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    const budgetAmount = parseFloat(data?.budgetAmount) || 0;
    const totalExpenses = parseFloat(data?.totalExpenses) || 0;
    const percentageUsed = parseFloat(data?.percentageUsed) || 0;
    
    const remaining = budgetAmount - totalExpenses;
    const isWarning = percentageUsed >= 75;
    const isDanger = percentageUsed >= 90;

    return (
      <Html>
        <Head />
        <Preview>Budget Alert - {data?.percentageUsed}% Used</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            {/* Header */}
            <Section style={styles.header}>
              <Heading style={styles.heading}>Budget Alert</Heading>
            </Section>

            {/* Main Content */}
            <Section style={styles.content}>
              <Text style={styles.greeting}>Hello {userName},</Text>
              <Text style={styles.mainText}>
                You&rsquo;ve used{" "}
                <strong
                  style={{
                    color: isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981",
                    fontSize: "20px",
                  }}
                >
                  {data?.percentageUsed}%
                </strong>{" "}
                of your monthly budget.
              </Text>

              {/* Stats Grid */}
              <Section style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Budget Amount</Text>
                  <Text style={styles.statValue}>
                    ₹{data?.budgetAmount}
                  </Text>
                </div>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Spent So Far</Text>
                  <Text style={{ ...styles.statValue, color: "#ef4444" }}>
                    ₹{data?.totalExpenses}
                  </Text>
                </div>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={{ ...styles.statValue, color: "#10b981" }}>
                    ₹{remaining.toFixed(2)}
                  </Text>
                </div>
              </Section>

              {/* Warning Message */}
              {isWarning && (
                <Section style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    {isDanger
                      ? `⚠️ You're at ${data?.percentageUsed}% of your budget. Consider reducing spending to avoid going over limit.`
                      : `⚡ You're at ${data?.percentageUsed}% of your budget. Keep an eye on your expenses.`}
                  </Text>
                </Section>
              )}
            </Section>

            {/* Footer */}
            <Section style={styles.footer}>
              <Text style={styles.footerText}>
                Track your finances intelligently with FINOVA
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  return null;
}

const styles = {
  body: {
    backgroundColor: "#f3f4f6",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    margin: 0,
    padding: "40px 20px",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  header: {
    background: "linear-gradient(to bottom right, #06b6d4, #10b981)",
    padding: "24px 24px 20px",
    textAlign: "center",
  },
  heading: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 4px",
    letterSpacing: "-0.5px",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "14px",
    fontWeight: "500",
    margin: "0",
  },
  content: {
    padding: "32px 24px",
  },
  greeting: {
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  mainText: {
    color: "#4b5563",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 32px",
  },
  overallSection: {
    marginBottom: "32px",
  },
  sectionTitle: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "700",
    margin: "0 0 16px",
    paddingBottom: "8px",
    borderBottom: "2px solid #e5e7eb",
  },
  statsGrid: {
    margin: "0 0 0px",
  },
  statCard: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "12px",
    textAlign: "center",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 8px",
  },
  statValue: {
    color: "#1f2937",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0",
  },
  accountsSection: {
    marginBottom: "32px",
  },
  accountCard: {
    backgroundColor: "#ffffff",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  },
  accountName: {
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 16px",
  },
  defaultBadge: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    marginLeft: "8px",
  },
  accountStats: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
  },
  accountStatRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  accountStatLabel: {
    color: "#6b7280",
    fontSize: "15px",
    fontWeight: "500",
    margin: "0",
  },
  accountStatValue: {
    color: "#1f2937",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0",
  },
  categoryMini: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "12px",
  },
  categoryMiniTitle: {
    color: "#92400e",
    fontSize: "13px",
    fontWeight: "600",
    margin: "0 0 8px",
  },
  categoryMiniRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
  },
  categoryMiniLabel: {
    color: "#78350f",
    fontSize: "13px",
    margin: "0",
  },
  categoryMiniAmount: {
    color: "#78350f",
    fontSize: "13px",
    fontWeight: "600",
    margin: "0",
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0 0",
  },
  warningText: {
    color: "#92400e",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0",
    textAlign: "center",
  },
  footer: {
    backgroundColor: "#f9fafb",
    padding: "24px",
    textAlign: "center",
    borderTop: "1px solid #e5e7eb",
  },
  footerText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "0",
  },
  insightsSection: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "20px",
    margin: "0",
  },
  insightText: {
    color: "#1e40af",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 10px",
  },
};
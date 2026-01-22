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
    const netAmount = data?.stats.totalIncome - data?.stats.totalExpenses;
    const isPositive = netAmount >= 0;

    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            {/* Header */}
            <Section style={styles.header}>
              <Heading style={styles.heading}>Monthly Financial Report</Heading>
            </Section>

            {/* Main Content */}
            <Section style={styles.content}>
              <Text style={styles.greeting}>Hello {userName},</Text>
              <Text style={styles.mainText}>
                Here&rsquo;s your financial summary for {data?.month}:
              </Text>

              {/* Main Stats Grid */}
              <Section style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Income</Text>
                  <Text style={{ ...styles.statValue, color: "#10b981" }}>
                    ${data?.stats.totalIncome?.toLocaleString()}
                  </Text>
                </div>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Expenses</Text>
                  <Text style={{ ...styles.statValue, color: "#ef4444" }}>
                    ${data?.stats.totalExpenses?.toLocaleString()}
                  </Text>
                </div>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Net</Text>
                  <Text style={{ 
                    ...styles.statValue, 
                    color: isPositive ? "#10b981" : "#ef4444" 
                  }}>
                    ${netAmount?.toLocaleString()}
                  </Text>
                </div>
              </Section>

              {/* Category Breakdown */}
              {data?.stats?.byCategory && (
                <Section style={styles.categorySection}>
                  <Text style={styles.sectionTitle}>Expenses by Category</Text>
                  {Object.entries(data?.stats.byCategory).map(
                    ([category, amount]) => (
                      <div key={category} style={styles.categoryRow}>
                        <Text style={styles.categoryLabel}>{category}</Text>
                        <Text style={styles.categoryAmount}>${amount?.toLocaleString()}</Text>
                      </div>
                    )
                  )}
                </Section>
              )}

              {/* AI Insights */}
              {data?.insights && data.insights.length > 0 && (
                <Section style={styles.insightsSection}>
                  <Text style={styles.sectionTitle}>FINOVA Insights</Text>
                  {data.insights.map((insight, index) => (
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
    // Parse the already-formatted strings back to numbers for calculations
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
                    ${data?.budgetAmount}
                  </Text>
                </div>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Spent So Far</Text>
                  <Text style={{ ...styles.statValue, color: "#ef4444" }}>
                    ${data?.totalExpenses}
                  </Text>
                </div>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={{ ...styles.statValue, color: "#10b981" }}>
                    ${remaining.toFixed(2)}
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
    backgroundColor: "#ffffff",
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
    padding: "20px 24px",
    textAlign: "center",
  },
  heading: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0",
    letterSpacing: "-0.5px",
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
  statsGrid: {
    margin: "0 0 24px",
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
  categorySection: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    margin: "0 0 24px",
  },
  sectionTitle: {
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  categoryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  categoryLabel: {
    color: "#4b5563",
    fontSize: "15px",
    margin: "0",
  },
  categoryAmount: {
    color: "#1f2937",
    fontSize: "15px",
    fontWeight: "600",
    margin: "0",
  },
  insightsSection: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "20px",
    margin: "0 0 24px",
  },
  insightText: {
    color: "#1e40af",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0 0 8px",
  },
};
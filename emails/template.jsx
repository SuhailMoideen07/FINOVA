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
  if (type === "monthly-alert") {
    // TODO: Add monthly alert template
    return null;
  }

  if (type === "budget-alert") {
    const remaining = data?.budgetAmount - data?.totalExpenses;
    const isWarning = data?.percentageUsed >= 75;
    const isDanger = data?.percentageUsed >= 90;

    return (
      <Html>
        <Head />
        <Preview>Budget Alert - {data?.percentageUsed.toFixed(1)}% Used</Preview>
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
                  {data?.percentageUsed.toFixed(1)}%
                </strong>{" "}
                of your monthly budget.
              </Text>

              {/* Stats Grid */}
              <Section style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Budget Amount</Text>
                  <Text style={styles.statValue}>
                    ${data?.budgetAmount.toLocaleString()}
                  </Text>
                </div>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Spent So Far</Text>
                  <Text style={{ ...styles.statValue, color: "#ef4444" }}>
                    ${data?.totalExpenses.toLocaleString()}
                  </Text>
                </div>
                <div style={styles.statCard}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={{ ...styles.statValue, color: "#10b981" }}>
                    ${remaining.toLocaleString()}
                  </Text>
                </div>
              </Section>

              {/* Warning Message */}
              {isWarning && (
                <Section style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    {isDanger
                      ? `⚠️ You're at ${data?.percentageUsed.toFixed(1)}% of your budget. Consider reducing spending to avoid going over limit.`
                      : `⚡ You're at ${data?.percentageUsed.toFixed(1)}% of your budget. Keep an eye on your expenses.`}
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
};
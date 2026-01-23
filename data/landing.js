import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Zap,
  Repeat,
  Building2,
  Truck,
} from "lucide-react";

// Stats Data (Company-focused)
export const statsData = [
  {
    value: "120+",
    label: "Projects Managed",
  },
  {
    value: "₹45Cr+",
    label: "Expenses Tracked",
  },
  {
    value: "99.9%",
    label: "System Reliability",
  },
  {
    value: "4.8/5",
    label: "Client Satisfaction",
  },
];

// Features Data (Construction-Focused)
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Project Analytics",
    description:
      "Track every project’s income and expenses with clear, real-time insights.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Bill Scanner",
    description:
      "Scan material bills and site receipts to auto-fill transactions instantly.",
  },
  {
    icon: <Building2 className="h-8 w-8 text-blue-600" />,
    title: "Project-Based Accounts",
    description:
      "Maintain separate financial views for each site, client, or project.",
  },
  {
    icon: <Truck className="h-8 w-8 text-blue-600" />,
    title: "Material & Labour Tracking",
    description:
      "Monitor spending on cement, steel, labour wages, and machinery with ease.",
  },
  {
    icon: <Repeat className="h-8 w-8 text-blue-600" />,
    title: "Recurring Costs",
    description:
      "Automatically handle rent, salaries, EMI payments, and maintenance charges.",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Automated Insights",
    description:
      "Get clear suggestions on cost control and project profitability.",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Set Up Your Company",
    description:
      "Create accounts for your office, projects, and operational expenses.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "2. Record Every Transaction",
    description:
      "Add expenses manually or scan bills directly from the construction site.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "3. Understand Your Growth",
    description:
      "View project-wise profit, cash flow, and spending patterns instantly.",
  },
];

// Testimonials Data (Neutral, Professional Names)
export const testimonialsData = [
  {
    name: "Alex Morgan",
    role: "Construction Contractor",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "Earlier I tracked everything in notebooks. Now I know exactly where every rupee goes on each site. This changed how I run my business.",
  },
  {
    name: "Emma Clarke",
    role: "Project Manager",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "Scanning bills directly from site saves so much time. No more lost receipts or missing expenses at month end.",
  },
  {
    name: "Daniel Wright",
    role: "Civil Engineer",
    image: "https://randomuser.me/api/portraits/men/56.jpg",
    quote:
      "Now we can clearly see which projects are profitable and where costs are leaking. It feels like having a financial brain for the company.",
  },
];

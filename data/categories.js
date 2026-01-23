export const defaultCategories = [
  // Income Categories (Company-Oriented)
  {
    id: "project-payment",
    name: "Project Payment",
    type: "INCOME",
    color: "#22c55e", // green-500 (Salary)
    icon: "Building2",
  },
  {
    id: "advance-receipt",
    name: "Advance Receipt",
    type: "INCOME",
    color: "#06b6d4", // cyan-500 (Freelance)
    icon: "Wallet",
  },
  {
    id: "consultation-fee",
    name: "Consultation Fee",
    type: "INCOME",
    color: "#6366f1", // indigo-500 (Investments)
    icon: "ClipboardList",
  },
  {
    id: "maintenance-contract",
    name: "Maintenance Contract",
    type: "INCOME",
    color: "#ec4899", // pink-500 (Business)
    icon: "Wrench",
  },
  {
    id: "rental-income",
    name: "Rental Income",
    type: "INCOME",
    color: "#f59e0b", // amber-500 (Rental)
    icon: "Home",
  },
  {
    id: "other-income",
    name: "Other Income",
    type: "INCOME",
    color: "#64748b", // slate-500 (Other Income)
    icon: "Plus",
  },

  // Expense Categories (Construction Focused)
  {
    id: "building-materials",
    name: "Building Materials",
    type: "EXPENSE",
    color: "#ef4444", // red-500 (Housing)
    icon: "Boxes",
    subcategories: ["Cement", "Sand", "Bricks", "Aggregates"],
  },
  {
    id: "steel-iron",
    name: "Steel & Iron",
    type: "EXPENSE",
    color: "#f97316", // orange-500 (Transportation)
    icon: "Hammer",
    subcategories: ["TMT Bars", "Frames", "Wire"],
  },
  {
    id: "labour-wages",
    name: "Labour Wages",
    type: "EXPENSE",
    color: "#84cc16", // lime-500 (Groceries)
    icon: "Users",
  },
  {
    id: "machinery-rent",
    name: "Machinery Rent",
    type: "EXPENSE",
    color: "#06b6d4", // cyan-500 (Utilities)
    icon: "Truck",
    subcategories: ["JCB", "Mixer", "Scaffolding"],
  },
  {
    id: "transport-logistics",
    name: "Transport & Logistics",
    type: "EXPENSE",
    color: "#8b5cf6", // violet-500 (Entertainment)
    icon: "Truck",
    subcategories: ["Lorry", "Fuel", "Delivery"],
  },
  {
    id: "site-utilities",
    name: "Site Utilities",
    type: "EXPENSE",
    color: "#f43f5e", // rose-500 (Food)
    icon: "Zap",
    subcategories: ["Electricity", "Water"],
  },
  {
    id: "tools-equipment",
    name: "Tools & Equipment",
    type: "EXPENSE",
    color: "#ec4899", // pink-500 (Shopping)
    icon: "Tool",
    subcategories: ["Drills", "Safety Gear", "Measuring Tools"],
  },
  {
    id: "office-expense",
    name: "Office Expenses",
    type: "EXPENSE",
    color: "#14b8a6", // teal-500 (Healthcare)
    icon: "Briefcase",
    subcategories: ["Stationery", "Rent", "Internet"],
  },
  {
    id: "marketing",
    name: "Marketing & Promotion",
    type: "EXPENSE",
    color: "#6366f1", // indigo-500 (Education)
    icon: "Megaphone",
    subcategories: ["Ads", "Banners", "Brochures"],
  },
  {
    id: "travel-site",
    name: "Site Travel",
    type: "EXPENSE",
    color: "#0ea5e9", // sky-500 (Travel)
    icon: "Car",
  },
  {
    id: "permits-fees",
    name: "Permits & Fees",
    type: "EXPENSE",
    color: "#64748b", // slate-500 (Insurance)
    icon: "FileText",
    subcategories: ["Panchayat", "Building Permit", "Tax"],
  },
  {
    id: "health-safety",
    name: "Health & Safety",
    type: "EXPENSE",
    color: "#f472b6", // pink-400 (Gifts)
    icon: "ShieldCheck",
    subcategories: ["Insurance", "Medical", "Safety Kits"],
  },
  {
    id: "other-expense",
    name: "Other Expenses",
    type: "EXPENSE",
    color: "#94a3b8", // slate-400 (Other Expense)
    icon: "MoreHorizontal",
  },
];

export const categoryColors = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.color;
  return acc;
}, {});

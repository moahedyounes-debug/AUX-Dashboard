// Sample data layer for the AUX ASC Performance & Inventory Dashboard.
// Modeled on the production Google Sheets column mappings. Swap these
// constants for live data (Google Sheets / Lovable Cloud) when ready.

export const BRANCHES = ["Riyadh", "Jeddah", "Dammam", "Makkah", "Madinah"] as const;

export const ticketKpis = {
  total: 1284,
  pending: 196,
  completed: 1088,
  pendingRate: 15.3,
  rate48h: 78.4,
  rate72h: 91.2,
};

export const monthlyRepairRate = [
  { month: "Jan", rate48h: 71, rate72h: 86, target48: 80, target72: 90 },
  { month: "Feb", rate48h: 74, rate72h: 88, target48: 80, target72: 90 },
  { month: "Mar", rate48h: 73, rate72h: 87, target48: 80, target72: 90 },
  { month: "Apr", rate48h: 77, rate72h: 90, target48: 80, target72: 90 },
  { month: "May", rate48h: 79, rate72h: 91, target48: 80, target72: 90 },
  { month: "Jun", rate48h: 81, rate72h: 93, target48: 80, target72: 90 },
];

export const branchPerformance = [
  { branch: "Riyadh", completed: 342, pending: 41, rate: 89 },
  { branch: "Jeddah", completed: 268, pending: 53, rate: 83 },
  { branch: "Dammam", completed: 201, pending: 38, rate: 84 },
  { branch: "Makkah", completed: 162, pending: 34, rate: 83 },
  { branch: "Madinah", completed: 115, pending: 30, rate: 79 },
];

export const rescheduledReasons = [
  { reason: "Customer Unavailable", count: 64 },
  { reason: "Part Not Available", count: 48 },
  { reason: "Technician Shortage", count: 31 },
  { reason: "Access Denied", count: 22 },
  { reason: "Other", count: 17 },
];

export const productLinePerformance = [
  { line: "Split AC", tickets: 512, rate: 88 },
  { line: "Window AC", tickets: 214, rate: 84 },
  { line: "Cassette", tickets: 188, rate: 82 },
  { line: "Ducted", tickets: 201, rate: 79 },
  { line: "Portable", tickets: 169, rate: 86 },
];

// ---- Call Center (from SLA_ABANDON_SUMMARY + COLUMN_MAPPING) ----
export const callCenterKpis = {
  totalIB: 50,
  answeredIB: 27,
  withinSLA: 12,
  abandonedIB: 23,
  slaRate: 44.4,
  abandonRate: 46.0,
  avgAHT: "04:12",
  avgTHT: "06:48",
};

export const callCenterMonthly = [
  { month: "May 2025", slaRate: 57.6, abandonRate: 45.9, totalIB: 61, answered: 33 },
  { month: "Jun 2025", slaRate: 44.4, abandonRate: 46.0, totalIB: 50, answered: 27 },
];

export const callsByQueue = [
  { queue: "Sales", calls: 142 },
  { queue: "Support", calls: 268 },
  { queue: "Warranty", calls: 96 },
  { queue: "Spare Parts", calls: 74 },
];

export const whatsappChannel = [
  { month: "Mar", messages: 820, sla: 71 },
  { month: "Apr", messages: 910, sla: 68 },
  { month: "May", messages: 1040, sla: 73 },
  { month: "Jun", messages: 988, sla: 70 },
];

export const agentEvaluations = [
  { agent: "Sara A.", quality: 4.6, courtesy: 4.8, technical: 4.2, overall: 4.5 },
  { agent: "Mohammed K.", quality: 4.2, courtesy: 4.4, technical: 4.6, overall: 4.4 },
  { agent: "Lina F.", quality: 4.0, courtesy: 4.5, technical: 3.9, overall: 4.1 },
  { agent: "Omar T.", quality: 3.8, courtesy: 4.1, technical: 4.3, overall: 4.0 },
  { agent: "Huda S.", quality: 4.7, courtesy: 4.6, technical: 4.5, overall: 4.6 },
];

// ---- Spare Parts ----
export const partsKpis = {
  totalSkus: 1426,
  totalStock: 38420,
  lowStock: 84,
  outOfStock: 27,
  reorderAlert: 53,
};

export const branchStock = [
  { branch: "Main WH", skus: 1426, stock: 24180 },
  { branch: "Riyadh SVC", skus: 612, stock: 5240 },
  { branch: "Jeddah SVC", skus: 548, stock: 4120 },
  { branch: "Dammam SVC", skus: 421, stock: 2960 },
  { branch: "Makkah SVC", skus: 318, stock: 1920 },
];

export const monthlyConsumption = [
  { month: "Jan", consumed: 2140 },
  { month: "Feb", consumed: 2380 },
  { month: "Mar", consumed: 2210 },
  { month: "Apr", consumed: 2560 },
  { month: "May", consumed: 2790 },
  { month: "Jun", consumed: 2640 },
];

export const abcClassification = [
  { name: "A (High value)", value: 18 },
  { name: "B (Medium)", value: 34 },
  { name: "C (Low)", value: 48 },
];

export type ReturnStatus = "PENDING_RETURN" | "IN_TRANSIT" | "RETURNED" | "IN_USE";

export const returnKpis = {
  totalTracked: 312,
  pendingReturn: 86,
  inTransit: 54,
  returned: 172,
};

export const returnRecords: {
  id: string;
  part: string;
  branch: string;
  awb: string;
  status: ReturnStatus;
  updated: string;
}[] = [
  { id: "RT-1042", part: "Compressor 1.5T", branch: "Riyadh SVC", awb: "SMSA882140", status: "IN_TRANSIT", updated: "2025-06-08" },
  { id: "RT-1043", part: "PCB Main Board", branch: "Jeddah SVC", awb: "SMSA882155", status: "RETURNED", updated: "2025-06-07" },
  { id: "RT-1044", part: "Fan Motor", branch: "Dammam SVC", awb: "—", status: "PENDING_RETURN", updated: "2025-06-06" },
  { id: "RT-1045", part: "Capacitor 45uF", branch: "Makkah SVC", awb: "SMSA882190", status: "IN_USE", updated: "2025-06-05" },
  { id: "RT-1046", part: "Thermostat Sensor", branch: "Riyadh SVC", awb: "SMSA882201", status: "RETURNED", updated: "2025-06-04" },
  { id: "RT-1047", part: "Remote Control", branch: "Madinah SVC", awb: "—", status: "PENDING_RETURN", updated: "2025-06-03" },
];

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

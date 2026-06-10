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

// ---- Daily Operations ----
export const dailyAging = [
  { branch: "Riyadh", d0_1: 28, d2_3: 14, d4plus: 6 },
  { branch: "Jeddah", d0_1: 22, d2_3: 18, d4plus: 9 },
  { branch: "Dammam", d0_1: 17, d2_3: 11, d4plus: 5 },
  { branch: "Makkah", d0_1: 13, d2_3: 9, d4plus: 7 },
  { branch: "Madinah", d0_1: 9, d2_3: 6, d4plus: 4 },
];

export const technicianLoad = [
  { technician: "Ahmed M.", assigned: 32, closed: 27 },
  { technician: "Yousef R.", assigned: 28, closed: 24 },
  { technician: "Khalid S.", assigned: 25, closed: 19 },
  { technician: "Faisal N.", assigned: 21, closed: 18 },
  { technician: "Nasser A.", assigned: 18, closed: 15 },
];

export const serviceHours = [
  { hour: "08:00", tickets: 12 },
  { hour: "10:00", tickets: 28 },
  { hour: "12:00", tickets: 34 },
  { hour: "14:00", tickets: 41 },
  { hour: "16:00", tickets: 26 },
  { hour: "18:00", tickets: 14 },
];

// ---- Pending Analysis ----
export const pendingByReason = [
  { reason: "Awaiting Part", count: 58, avgDays: 6.2 },
  { reason: "Customer Schedule", count: 41, avgDays: 3.8 },
  { reason: "Technician Backlog", count: 33, avgDays: 4.5 },
  { reason: "Approval Pending", count: 27, avgDays: 5.1 },
  { reason: "Access Issue", count: 19, avgDays: 7.4 },
  { reason: "Other", count: 18, avgDays: 2.9 },
];

export const pendingAging = [
  { bucket: "0-2 days", count: 64 },
  { bucket: "3-5 days", count: 58 },
  { bucket: "6-10 days", count: 41 },
  { bucket: "11+ days", count: 33 },
];

// ---- Deep Insights ----
export const serviceTypePerformance = [
  { type: "Installation", tickets: 318, rate: 90 },
  { type: "Repair", tickets: 642, rate: 82 },
  { type: "Maintenance", tickets: 214, rate: 88 },
  { type: "Inspection", tickets: 110, rate: 94 },
];

export const completionResults = [
  { name: "Resolved", value: 1088 },
  { name: "Rescheduled", value: 124 },
  { name: "Rejected", value: 48 },
  { name: "Escalated", value: 24 },
];

// ---- ASC Performance ----
export const ascPerformance = [
  { asc: "ZAM", tickets: 412, rate48h: 81, rate72h: 93, slaScore: 88 },
  { asc: "wiFEX", tickets: 338, rate48h: 76, rate72h: 89, slaScore: 82 },
  { asc: "Classic", tickets: 287, rate48h: 79, rate72h: 91, slaScore: 85 },
  { asc: "DOZN", tickets: 164, rate48h: 73, rate72h: 86, slaScore: 78 },
  { asc: "ABL", tickets: 83, rate48h: 70, rate72h: 84, slaScore: 74 },
];

// ---- Rejected / Returned ----
export const rejectedKpis = {
  totalRejected: 48,
  totalReturned: 172,
  reworkRate: 6.4,
  avgReturnDays: 4.8,
};

export const rejectedRecords: {
  id: string;
  ticket: string;
  branch: string;
  reason: string;
  status: "Rejected" | "Returned" | "Rework";
  date: string;
}[] = [
  { id: "RJ-2011", ticket: "TK-88421", branch: "Riyadh", reason: "Customer not satisfied", status: "Rework", date: "2025-06-08" },
  { id: "RJ-2012", ticket: "TK-88455", branch: "Jeddah", reason: "Wrong part fitted", status: "Returned", date: "2025-06-07" },
  { id: "RJ-2013", ticket: "TK-88490", branch: "Dammam", reason: "Repeat fault", status: "Rejected", date: "2025-06-06" },
  { id: "RJ-2014", ticket: "TK-88501", branch: "Makkah", reason: "Incomplete repair", status: "Rework", date: "2025-06-05" },
  { id: "RJ-2015", ticket: "TK-88533", branch: "Madinah", reason: "Defective replacement", status: "Returned", date: "2025-06-04" },
];

// ---- Activity Log ----
export const activityLog: {
  ts: string;
  user: string;
  action: string;
  page: string;
}[] = [
  { ts: "2025-06-10 09:14", user: "moahed.younis", action: "View page", page: "overview" },
  { ts: "2025-06-10 09:12", user: "sara.a", action: "Export Excel", page: "spare-parts" },
  { ts: "2025-06-10 09:05", user: "omar.t", action: "Refresh data", page: "call-center" },
  { ts: "2025-06-10 08:58", user: "moahed.younis", action: "Filter applied", page: "pending" },
  { ts: "2025-06-10 08:51", user: "lina.f", action: "Login", page: "auth" },
  { ts: "2025-06-10 08:40", user: "huda.s", action: "View page", page: "branches" },
];

export const exportDatasets = [
  { name: "Service Tickets", rows: 1284, format: "XLSX / CSV", source: "Main Dashboard" },
  { name: "Spare Parts Inventory", rows: 1426, format: "XLSX / CSV", source: "Parts Management" },
  { name: "Part Returns", rows: 312, format: "XLSX / CSV", source: "Parts Management" },
  { name: "Call Center KPIs", rows: 988, format: "XLSX / CSV", source: "Call Center KPI" },
  { name: "Agent Evaluations", rows: 245, format: "XLSX / CSV", source: "Agent Evaluation" },
];

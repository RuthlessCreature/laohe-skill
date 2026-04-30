import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const outputPath = path.join(skillRoot, "assets", "excel", "laohe_product_lifecycle_templates.xlsx");
const verify = process.argv.includes("--verify");

const workbook = Workbook.create();

const theme = {
  ink: "#111827",
  slate: "#334155",
  primary: "#0F766E",
  secondary: "#1D4ED8",
  surface: "#F8FAFC",
  header: "#E2E8F0",
  soft: "#ECFDF5",
  warn: "#FEF3C7",
  danger: "#FEE2E2",
  white: "#FFFFFF",
};

const statusValues = ["Not Started", "Draft", "In Progress", "Blocked", "Ready", "Done"];
const priorityValues = ["P0", "P1", "P2", "P3"];
const probabilityValues = ["Low", "Medium", "High"];

function fmtTitle(sheet, range, title) {
  const r = sheet.getRange(range);
  r.values = [[title]];
  r.merge();
  r.format = {
    fill: theme.ink,
    font: { bold: true, color: theme.white, size: 16 },
  };
  r.format.rowHeightPx = 36;
}

function fmtHeader(sheet, range, fill = theme.primary) {
  sheet.getRange(range).format = {
    fill,
    font: { bold: true, color: theme.white },
  };
}

function fmtSubHeader(sheet, range) {
  sheet.getRange(range).format = {
    fill: theme.header,
    font: { bold: true, color: theme.ink },
  };
}

function setWidths(sheet, widths) {
  widths.forEach((px, i) => {
    sheet.getRangeByIndexes(0, i, 80, 1).format.columnWidthPx = px;
  });
}

function addTable(sheet, range, name) {
  const table = sheet.tables.add(range, true, name);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
  return table;
}

function prep(sheet, freezeRows = 3) {
  sheet.showGridLines = false;
  if (freezeRows > 0) sheet.freezePanes.freezeRows(freezeRows);
}

const lifecycleRows = [
  ["Intake", "00 One-page Strategy", "", "", "", "Success metric and buyer/user are clear", "Draft"],
  ["Creative", "12 Creative Engineering Ideas", "", "", "", "Shortlist scored by feasibility, distribution, monetization, and surprise", "Draft"],
  ["Market", "01 Market and ICP", "", "", "", "Time-sensitive claims are source-checked", "Draft"],
  ["Opportunity", "02 Opportunity Brief", "", "", "", "Weighted score and decision are documented", "Draft"],
  ["Product", "03 PRD", "", "", "", "P0 scope and acceptance criteria are approved", "Draft"],
  ["Architecture", "04 Architecture RFC", "", "", "", "Interfaces risks and rollout plan are reviewed", "Draft"],
  ["Project", "05 Project Plan", "", "", "", "Milestones owners and risk register are active", "Draft"],
  ["Quality", "06 Test Plan", "", "", "", "Release gates and evidence requirements are defined", "Draft"],
  ["Launch", "07 GTM Plan", "", "", "", "Audience offer channels and funnel targets are ready", "Draft"],
  ["Finance", "08 Unit Economics", "", "", "", "Payback LTV/CAC and sensitivity are reviewed", "Draft"],
  ["Review", "11 Postmortem", "", "", "", "Lessons and next actions are assigned", "Draft"],
];

const pricingRows = [
  ["Entry", "Small team", 99, "Prove value quickly", "Core workflow and email support", "Low volume", "Needs automation or integrations"],
  ["Core", "Growing team", 299, "Run the workflow end to end", "Automation, integrations, reporting", "Standard volume", "Needs governance or premium support"],
  ["Premium", "Enterprise or high-risk buyer", 999, "Outcome assurance", "Custom onboarding, SLA, advanced controls", "Custom scope", "Needs strategic services"],
];

const pipelineRows = [
  ["Example Co", "Ops", "VP Operations", "Manual reporting pain", "Discovery", 12000, "Send ROI calculator", "", new Date("2026-05-08"), 0.2, null],
  ["", "", "", "", "Targeted", "", "", "", "", 0.1, null],
  ["", "", "", "", "Proposal", "", "", "", "", 0.5, null],
];

const riskRows = [
  ["No urgent buyer", "Commercial", "Discovery calls praise but no budget", "Medium", "High", "Test paid pilot offer", "", "Open"],
  ["Scope creep", "Product", "Custom requests exceed P0", "Medium", "Medium", "Keep non-goals explicit", "", "Open"],
  ["Reliability miss", "Engineering", "P95 latency above target", "Low", "High", "Add performance gate and rollback plan", "", "Open"],
  ["CAC too high", "Finance", "Payback above 12 months", "Medium", "High", "Shift channel mix or raise price", "", "Open"],
];

const launchRows = [
  ["Product", "P0 acceptance criteria signed off", "", "", "Not Started", ""],
  ["Engineering", "Production observability enabled", "", "", "Not Started", ""],
  ["QA", "Release gate passed", "", "", "Not Started", ""],
  ["GTM", "Landing page published", "", "", "Not Started", ""],
  ["Sales", "First 50 target accounts loaded", "", "", "Not Started", ""],
  ["Finance", "Pricing and ROI calculator reviewed", "", "", "Not Started", ""],
  ["Support", "Onboarding and FAQ ready", "", "", "Not Started", ""],
];

const ideaRows = [
  [
    "Spreadsheet-to-SaaS audit",
    "Excel workflow + SaaS automation",
    "Import/export plus workflow automation",
    "Ops manager",
    "Template funnel",
    "Paid audit then subscription",
    4,
    4,
    4,
    4,
    3,
    4,
    3,
    null,
    "Publish template and sell 3 paid audits",
    "No urgent buyer",
  ],
  [
    "Compliance evidence bot",
    "Regulation + document intelligence",
    "Agent workflow and evidence collection",
    "Compliance lead",
    "Founder-led outbound",
    "Monthly compliance package",
    3,
    4,
    3,
    5,
    4,
    4,
    4,
    null,
    "Interview 5 compliance leads",
    "Procurement friction",
  ],
  [
    "Field-ops photo QA",
    "Computer vision + facilities ops",
    "Mobile capture and anomaly scoring",
    "Ops director",
    "Installer/agency partners",
    "Per-site subscription",
    3,
    3,
    4,
    4,
    4,
    3,
    4,
    null,
    "Mock 20-photo audit for one operator",
    "Data quality and edge cases",
  ],
];

const dashboard = workbook.worksheets.add("Dashboard");
prep(dashboard, 5);
fmtTitle(dashboard, "A1:H1", "老何产品生命周期模板");
dashboard.getRange("A3:H3").values = [["Metric", "Value", "Meaning", "", "Lifecycle Progress", "", "", ""]];
fmtHeader(dashboard, "A3:C3", theme.primary);
fmtHeader(dashboard, "E3:H3", theme.secondary);
dashboard.getRange("A4:C8").values = [
  ["Done phases", null, "Lifecycle rows marked Done"],
  ["Ready phases", null, "Lifecycle rows marked Ready"],
  ["Blocked risks", null, "Risk rows marked Blocked/Open"],
  ["Base MRR", null, "Base scenario monthly recurring revenue"],
  ["Base CAC payback", null, "Months to repay CAC"],
];
dashboard.getRange("B4:B8").formulas = [
  ['=COUNTIF(Lifecycle!G4:G14,"Done")'],
  ['=COUNTIF(Lifecycle!G4:G14,"Ready")'],
  ['=COUNTIF(Risks!H4:H23,"Open")'],
  ["=Finance!D9"],
  ["=Finance!D11"],
];
dashboard.getRange("B7").format.numberFormat = "$#,##0";
dashboard.getRange("B8").format.numberFormat = "0.0";
dashboard.getRange("E4:H7").values = [
  ["Scenario", "MRR", "Gross Profit", "LTV/CAC"],
  ["Downside", null, null, null],
  ["Base", null, null, null],
  ["Upside", null, null, null],
];
dashboard.getRange("F5:H7").formulas = [
  ["=Finance!C9", "=Finance!C10", "=Finance!C13"],
  ["=Finance!D9", "=Finance!D10", "=Finance!D13"],
  ["=Finance!E9", "=Finance!E10", "=Finance!E13"],
];
dashboard.getRange("F5:G7").format.numberFormat = "$#,##0";
dashboard.getRange("H5:H7").format.numberFormat = "0.0x";
dashboard.getRange("A10:H10").values = [["Recommended use", "Internal Markdown", "Customer Excel", "Decision Gate", "Evidence", "Owner", "Due", "Status"]];
fmtHeader(dashboard, "A10:H10", theme.primary);
dashboard.getRange("A11:H17").values = [
  ["Start strategy", "00-one-page-strategy.md", "Lifecycle", "Problem-value fit", "Buyer/user and success metric", "", "", "Draft"],
  ["Invent wedges", "12-creative-engineering-ideas.md", "Idea Bank", "Creative leverage fit", "Shortlisted ideas with weighted scores", "", "", "Draft"],
  ["Define product", "03-prd.md", "Lifecycle", "Scope fit", "P0 acceptance criteria", "", "", "Draft"],
  ["Plan engineering", "04-architecture-rfc.md", "Risks", "Technical fit", "Interfaces and rollout", "", "", "Draft"],
  ["Prepare launch", "07-launch-gtm-plan.md", "Launch", "Launch fit", "Offer and channel plan", "", "", "Draft"],
  ["Model money", "08-finance-and-unit-economics.md", "Finance", "Economic fit", "Payback and LTV/CAC", "", "", "Draft"],
  ["Close customer", "10-customer-proposal.md", "Customer ROI", "Buying fit", "ROI and commercial terms", "", "", "Draft"],
];
addTable(dashboard, "A10:H17", "DashboardUseTable");
dashboard.getRange("H11:H17").dataValidation = { rule: { type: "list", values: statusValues } };
setWidths(dashboard, [150, 210, 220, 150, 220, 120, 120, 120]);

const lifecycle = workbook.worksheets.add("Lifecycle");
prep(lifecycle);
fmtTitle(lifecycle, "A1:G1", "产品生命周期路线图");
lifecycle.getRange("A3:G3").values = [["Phase", "Artifact", "Owner", "Start", "Due", "Exit Criteria", "Status"]];
fmtHeader(lifecycle, "A3:G3");
lifecycle.getRange("A4:G14").values = lifecycleRows;
lifecycle.getRange("G4:G14").dataValidation = { rule: { type: "list", values: statusValues } };
addTable(lifecycle, "A3:G14", "LifecycleTable");
lifecycle.getRange("D4:E33").setNumberFormat("yyyy-mm-dd");
setWidths(lifecycle, [120, 210, 120, 110, 110, 340, 120]);

const ideas = workbook.worksheets.add("Idea Bank");
prep(ideas);
fmtTitle(ideas, "A1:P1", "骚点子与跨界工程点子库");
ideas.getRange("A3:P3").values = [[
  "Idea",
  "Cross-domain Combo",
  "Engineering Lever",
  "Buyer/User",
  "Distribution",
  "Monetization",
  "D",
  "M",
  "F",
  "V",
  "S",
  "R",
  "X",
  "Weighted Score",
  "48-hour Test",
  "Risk",
]];
fmtHeader(ideas, "A3:P3");
ideas.getRange("A4:P6").values = ideaRows;
ideas.getRange("N4:N6").formulas = [
  ["=0.22*G4+0.18*H4+0.16*I4+0.14*J4+0.12*K4+0.10*L4+0.08*M4"],
  ["=0.22*G5+0.18*H5+0.16*I5+0.14*J5+0.12*K5+0.10*L5+0.08*M5"],
  ["=0.22*G6+0.18*H6+0.16*I6+0.14*J6+0.12*K6+0.10*L6+0.08*M6"],
];
ideas.getRange("G4:M30").dataValidation = { rule: { type: "whole", operator: "between", formula1: 1, formula2: 5 } };
ideas.getRange("N4:N30").format.numberFormat = "0.00";
addTable(ideas, "A3:P6", "IdeaBankTable");
ideas.getRange("A9:F9").values = [["Scoring", "D Distribution", "M Monetization", "F Feasibility", "V Value", "S Surprise"]];
fmtSubHeader(ideas, "A9:F9");
ideas.getRange("A10:F10").values = [["Formula", "0.22", "0.18", "0.16", "0.14", "0.12"]];
ideas.getRange("A11:F11").values = [["Also includes", "R Repeatability 0.10", "X Cross-domain 0.08", "Reject novelty with no buyer", "Prefer 48-hour tests", ""]];
setWidths(ideas, [200, 230, 240, 150, 160, 190, 55, 55, 55, 55, 55, 55, 55, 120, 260, 210]);

const finance = workbook.worksheets.add("Finance");
prep(finance);
fmtTitle(finance, "A1:F1", "财务与单位经济模型");
finance.getRange("A3:F3").values = [["Metric", "Symbol", "Downside", "Base", "Upside", "Formula or Note"]];
fmtHeader(finance, "A3:F3");
finance.getRange("A4:F13").values = [
  ["Price per account", "P", 99, 199, 399, "Monthly subscription or equivalent"],
  ["Accounts", "N", 20, 75, 200, "Paying accounts"],
  ["Monthly churn", "c", 0.08, 0.04, 0.02, "Logo churn"],
  ["Gross margin", "GM", 0.65, 0.78, 0.86, "Revenue less variable costs"],
  ["CAC", "CAC", 900, 650, 450, "Blended acquisition cost"],
  ["MRR", "MRR", null, null, null, "P*N"],
  ["Gross profit", "GP", null, null, null, "MRR*GM"],
  ["CAC payback months", "Payback", null, null, null, "CAC/(P*GM)"],
  ["LTV", "LTV", null, null, null, "(P*GM)/churn"],
  ["LTV/CAC", "LTV_CAC", null, null, null, "LTV/CAC"],
];
finance.getRange("C9:E13").formulas = [
  ["=C4*C5", "=D4*D5", "=E4*E5"],
  ["=C9*C7", "=D9*D7", "=E9*E7"],
  ["=C8/(C4*C7)", "=D8/(D4*D7)", "=E8/(E4*E7)"],
  ["=(C4*C7)/C6", "=(D4*D7)/D6", "=(E4*E7)/E6"],
  ["=C12/C8", "=D12/D8", "=E12/E8"],
];
finance.getRange("C4:E4").format.numberFormat = "$#,##0";
finance.getRange("C5:E5").format.numberFormat = "0";
finance.getRange("C6:E7").format.numberFormat = "0.0%";
finance.getRange("C8:E10").format.numberFormat = "$#,##0";
finance.getRange("C11:E11").format.numberFormat = "0.0";
finance.getRange("C12:E12").format.numberFormat = "$#,##0";
finance.getRange("C13:E13").format.numberFormat = "0.0x";
addTable(finance, "A3:F13", "FinanceModelTable");
finance.getRange("H3:K3").values = [["Scenario", "MRR", "Gross Profit", "LTV/CAC"]];
fmtSubHeader(finance, "H3:K3");
finance.getRange("H4:K6").values = [["Downside", null, null, null], ["Base", null, null, null], ["Upside", null, null, null]];
finance.getRange("I4:K6").formulas = [
  ["=C9", "=C10", "=C13"],
  ["=D9", "=D10", "=D13"],
  ["=E9", "=E10", "=E13"],
];
finance.getRange("I4:J6").format.numberFormat = "$#,##0";
finance.getRange("K4:K6").format.numberFormat = "0.0x";
const financeChart = finance.charts.add("bar", finance.getRange("H3:J6"));
financeChart.title = "MRR and Gross Profit by Scenario";
financeChart.hasLegend = true;
financeChart.xAxis = { axisType: "textAxis" };
financeChart.yAxis = { numberFormatCode: "$#,##0" };
financeChart.setPosition("H8", "M23");
setWidths(finance, [180, 95, 110, 110, 110, 260, 35, 115, 110, 115, 90, 110, 110]);

const pricing = workbook.worksheets.add("Pricing");
prep(pricing);
fmtTitle(pricing, "A1:G1", "定价与包装");
pricing.getRange("A3:G3").values = [["Package", "Target Buyer", "Price", "Core Promise", "Included", "Limit", "Upgrade Trigger"]];
fmtHeader(pricing, "A3:G3");
pricing.getRange("A4:G6").values = pricingRows;
pricing.getRange("C4:C6").format.numberFormat = "$#,##0";
addTable(pricing, "A3:G6", "PricingTable");
setWidths(pricing, [120, 220, 110, 260, 280, 180, 270]);

const pipeline = workbook.worksheets.add("Pipeline");
prep(pipeline);
fmtTitle(pipeline, "A1:K1", "销售管线");
pipeline.getRange("A3:K3").values = [["Account", "Segment", "Buyer", "Trigger", "Stage", "ARR Potential", "Next Step", "Owner", "Due", "Probability", "Weighted ARR"]];
fmtHeader(pipeline, "A3:K3");
pipeline.getRange("A4:K6").values = pipelineRows;
pipeline.getRange("K4:K6").formulas = [["=F4*J4"], ["=F5*J5"], ["=F6*J6"]];
pipeline.getRange("F4:F40").format.numberFormat = "$#,##0";
pipeline.getRange("J4:J40").format.numberFormat = "0%";
pipeline.getRange("K4:K40").format.numberFormat = "$#,##0";
pipeline.getRange("I4:I40").setNumberFormat("yyyy-mm-dd");
pipeline.getRange("E4:E6").dataValidation = { rule: { type: "list", values: ["Targeted", "Discovery", "Demo", "Proposal", "Closed Won", "Closed Lost"] } };
addTable(pipeline, "A3:K6", "PipelineTable");
setWidths(pipeline, [160, 130, 170, 230, 130, 140, 245, 110, 110, 105, 130]);

const risks = workbook.worksheets.add("Risks");
prep(risks);
fmtTitle(risks, "A1:H1", "风险登记表");
risks.getRange("A3:H3").values = [["Risk", "Category", "Signal", "Probability", "Impact", "Mitigation", "Owner", "Status"]];
fmtHeader(risks, "A3:H3");
risks.getRange("A4:H7").values = riskRows;
risks.getRange("D4:D7").dataValidation = { rule: { type: "list", values: probabilityValues } };
risks.getRange("E4:E7").dataValidation = { rule: { type: "list", values: probabilityValues } };
risks.getRange("H4:H7").dataValidation = { rule: { type: "list", values: ["Open", "Watching", "Mitigated", "Closed", "Blocked"] } };
addTable(risks, "A3:H7", "RiskTable");
setWidths(risks, [180, 120, 260, 110, 95, 260, 110, 110]);

const launch = workbook.worksheets.add("Launch");
prep(launch);
fmtTitle(launch, "A1:F1", "发布检查表");
launch.getRange("A3:F3").values = [["Workstream", "Item", "Owner", "Due", "Status", "Evidence"]];
fmtHeader(launch, "A3:F3");
launch.getRange("A4:F10").values = launchRows;
launch.getRange("D4:D40").setNumberFormat("yyyy-mm-dd");
launch.getRange("E4:E10").dataValidation = { rule: { type: "list", values: statusValues } };
addTable(launch, "A3:F10", "LaunchTable");
setWidths(launch, [130, 300, 120, 110, 120, 260]);

const roi = workbook.worksheets.add("Customer ROI");
prep(roi);
fmtTitle(roi, "A1:F1", "客户 ROI 计算器");
roi.getRange("A3:F3").values = [["Line Item", "Description", "Qty", "Unit Price", "Total", "Notes"]];
fmtHeader(roi, "A3:F3");
roi.getRange("A4:F10").values = [
  ["Implementation", "Initial setup and onboarding", 1, 5000, null, ""],
  ["Subscription", "Monthly core package", 12, 299, null, ""],
  ["Premium Support", "Optional support retainer", 12, 500, null, ""],
  ["Annual Benefit", "Time savings, risk reduction, or revenue lift", 1, 50000, null, "Customer-adjustable"],
  ["Annual Cost", "Implementation + subscription + support", 1, null, null, ""],
  ["Net Benefit", "Annual benefit less annual cost", 1, null, null, ""],
  ["ROI", "Net benefit divided by annual cost", 1, null, null, ""],
];
roi.getRange("E4:E7").formulas = [["=C4*D4"], ["=C5*D5"], ["=C6*D6"], ["=C7*D7"]];
roi.getRange("E8:E10").formulas = [["=SUM(E4:E6)"], ["=E7-E8"], ["=E9/E8"]];
roi.getRange("D4:E9").format.numberFormat = "$#,##0";
roi.getRange("E10").format.numberFormat = "0%";
fmtSubHeader(roi, "A12:F12");
roi.getRange("A12:F12").values = [["Close Plan", "Decision Maker", "Procurement Path", "Start Date", "Next Meeting", "Status"]];
roi.getRange("A13:F15").values = [["", "", "", "", "", "Draft"], ["", "", "", "", "", "Draft"], ["", "", "", "", "", "Draft"]];
roi.getRange("F13:F15").dataValidation = { rule: { type: "list", values: statusValues } };
addTable(roi, "A3:F10", "CustomerRoiTable");
setWidths(roi, [150, 310, 125, 120, 120, 210]);

for (const sheetName of ["Dashboard", "Lifecycle", "Idea Bank", "Finance", "Pricing", "Pipeline", "Risks", "Launch", "Customer ROI"]) {
  const ws = workbook.worksheets.getItem(sheetName);
  ws.getUsedRange().format.wrapText = true;
}

if (verify) {
  const errors = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 50 },
    summary: "formula error scan",
  });
  console.log(errors.ndjson);

  const previewDir = path.join("/tmp", "laohe-workbook-previews");
  await fs.mkdir(previewDir, { recursive: true });
  for (const sheetName of ["Dashboard", "Lifecycle", "Idea Bank", "Finance", "Pricing", "Pipeline", "Risks", "Launch", "Customer ROI"]) {
    const blob = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
    const safe = sheetName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await fs.writeFile(path.join(previewDir, `${safe}.png`), new Uint8Array(await blob.arrayBuffer()));
  }
  console.log(`Rendered previews: ${previewDir}`);
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);

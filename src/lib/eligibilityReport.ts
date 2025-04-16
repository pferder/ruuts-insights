// src/utils/generateReport.ts
import jsPDF from "jspdf";
import * as turf from "@turf/turf";

export function formatYear(year: number | string | null | undefined): string {
  if (year === null || year === undefined) return "N/A";
  let numYear = typeof year === "string" ? parseInt(year, 10) : year;
  if (isNaN(numYear)) return "N/A";
  if (numYear >= 0 && numYear < 100) {
    numYear = numYear >= 50 ? 1900 + numYear : 2000 + numYear;
  }
  return numYear.toString();
}


export function generatePdfReport(farm, derivedEligibility): void {
  if (!derivedEligibility) {
    alert("Cannot generate report: Missing required data."); return;
  }

  const boundaryArea = farm.size;
  const deforArea = derivedEligibility.deforestationAreaHa ?? 0;
  const forestArea = derivedEligibility.forestAreaHa ?? 0;
  const wetlandsArea = derivedEligibility.wetlandsAreaHa ?? 0;
  const eligibleArea = derivedEligibility.eligibleAreaHa ?? null;
  const deforYearsRaw = derivedEligibility.deforestationYears ?? [];
  const deforYearsFormatted = deforYearsRaw.length > 0 ? deforYearsRaw.map(formatYear).join(", ") : "None Detected";
  const hasDeforestation = deforArea > 0.001;

  const doc = new jsPDF();
  const title = "Eligibility Analysis Report";
  const date = new Date().toLocaleDateString();
  let yPos = 20;
  const defaultFont = 'helvetica';

  doc.setFontSize(18); doc.setFont(defaultFont, "bold"); doc.text(title, 105, yPos, { align: "center" });
  yPos += 10; doc.setFontSize(10); doc.setFont(defaultFont, "normal"); doc.text(`Report Generated: ${date}`, 105, yPos, { align: "center" });
  yPos += 15; doc.setFontSize(12); doc.setFont(defaultFont, "bold"); doc.text("Project Boundary", 14, yPos);
  yPos += 7; doc.setFont(defaultFont, "normal"); doc.text(`- Total Area: ${boundaryArea.toFixed(2)} ha`, 14, yPos);
  yPos += 10; doc.setFontSize(12); doc.setFont(defaultFont, "bold"); doc.text("Area Analysis (Overlaps within Boundary)", 14, yPos);
  yPos += 7; doc.setFont(defaultFont, "normal");
  doc.text(`- Deforestation: ${deforArea.toFixed(2)} ha ${hasDeforestation ? `(Years: ${deforYearsFormatted})` : "(None Detected)"}`, 14, yPos);
  yPos += 5; doc.text(`- Forest Cover: ${forestArea.toFixed(2)} ha`, 14, yPos);
  yPos += 5; doc.text(`- Wetlands: ${wetlandsArea.toFixed(2)} ha`, 14, yPos);
  yPos += 10; doc.setFont(defaultFont, "bold");
  doc.text(`Calculated Eligible Area: ${eligibleArea !== null ? eligibleArea.toFixed(2) + " ha" : "Not Calculated"}`, 14, yPos);
  doc.setFont(defaultFont, "normal"); doc.setFontSize(9); doc.setTextColor(100); doc.text(`  (Boundary Area minus overlapping Deforestation, Forest, and Wetlands)`, 16, yPos + 4);
  doc.setTextColor(0); doc.setFontSize(12); yPos += 15; doc.setFontSize(8); doc.setTextColor(150);
  doc.text("Disclaimer: This report is based on automated analysis...", 14, yPos, { maxWidth: 180 });

  doc.save(`${title.replace(/ /g, "_")}_${date}.pdf`);
}
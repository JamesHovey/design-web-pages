import jsPDF from "jspdf";

interface DesignExportData {
  name: string;
  description: string;
  rationale: string;
  ctaStrategy: string;
  accessibilityScore: number;
  distinctivenessScore: number;
  estimatedBuildTime: number;
  qualityStrengths: string[];
  qualityIssues: string[];
  screenshots: Record<string, string>;
  project: {
    url: string;
    industry: string;
    siteType: string;
  };
}

/**
 * Generate a professional PDF document for a design variation
 * Includes design details, screenshots, and recommendations
 */
export async function generateDesignPDF(design: DesignExportData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper to add new page if needed
  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Title Page
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Website Design Proposal", margin, yPos);
  yPos += 15;

  doc.setFontSize(20);
  doc.setTextColor(100, 100, 100);
  doc.text(design.name, margin, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Project: ${design.project.url}`, margin, yPos);
  yPos += 7;
  doc.text(`Industry: ${design.project.industry}`, margin, yPos);
  yPos += 7;
  doc.text(`Site Type: ${design.project.siteType}`, margin, yPos);
  yPos += 15;

  // Design Description
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Design Overview", margin, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const descriptionLines = doc.splitTextToSize(design.description, pageWidth - 2 * margin);
  doc.text(descriptionLines, margin, yPos);
  yPos += descriptionLines.length * 5 + 10;

  // Quality Scores
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Quality Metrics", margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Accessibility Score
  doc.text(`Accessibility Score: ${design.accessibilityScore}/100`, margin + 5, yPos);
  const accessColor = design.accessibilityScore >= 80 ? [34, 197, 94] : design.accessibilityScore >= 60 ? [234, 179, 8] : [239, 68, 68];
  doc.setFillColor(accessColor[0], accessColor[1], accessColor[2]);
  doc.rect(margin + 70, yPos - 4, (design.accessibilityScore / 100) * 60, 5, "F");
  yPos += 10;

  // Distinctiveness Score
  doc.text(`Distinctiveness Score: ${design.distinctivenessScore}/100`, margin + 5, yPos);
  const distinctColor = design.distinctivenessScore >= 80 ? [34, 197, 94] : design.distinctivenessScore >= 60 ? [234, 179, 8] : [239, 68, 68];
  doc.setFillColor(distinctColor[0], distinctColor[1], distinctColor[2]);
  doc.rect(margin + 70, yPos - 4, (design.distinctivenessScore / 100) * 60, 5, "F");
  yPos += 10;

  doc.text(`Estimated Build Time: ${design.estimatedBuildTime} minutes`, margin + 5, yPos);
  yPos += 15;

  // Design Rationale
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Design Rationale", margin, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const rationaleLines = doc.splitTextToSize(design.rationale, pageWidth - 2 * margin);
  doc.text(rationaleLines, margin, yPos);
  yPos += rationaleLines.length * 5 + 10;

  // CTA Strategy
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Call-to-Action Strategy", margin, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const ctaLines = doc.splitTextToSize(design.ctaStrategy, pageWidth - 2 * margin);
  doc.text(ctaLines, margin, yPos);
  yPos += ctaLines.length * 5 + 10;

  // Quality Strengths
  if (design.qualityStrengths.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Quality Strengths", margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    design.qualityStrengths.forEach((strength) => {
      checkPageBreak(8);
      doc.text(`• ${strength}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  // Quality Issues
  if (design.qualityIssues.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Areas for Improvement", margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    design.qualityIssues.forEach((issue) => {
      checkPageBreak(8);
      doc.text(`• ${issue}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  // Screenshots
  if (design.screenshots && Object.keys(design.screenshots).length > 0) {
    doc.addPage();
    yPos = margin;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Design Previews", margin, yPos);
    yPos += 10;

    const viewports = Object.keys(design.screenshots);
    for (const viewport of viewports) {
      checkPageBreak(100);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const viewportName = viewport.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      doc.text(viewportName, margin, yPos);
      yPos += 8;

      try {
        // Add screenshot image
        const imgData = design.screenshots[viewport];
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = 80; // Fixed height for consistency

        doc.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      } catch (error) {
        console.error(`Failed to add screenshot for ${viewport}:`, error);
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("(Screenshot unavailable)", margin + 5, yPos);
        yPos += 15;
      }
    }
  }

  // Footer on last page
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    margin,
    pageHeight - 10
  );
  doc.text(
    "Turd Polisher - AI-Powered Website Design Generator",
    pageWidth - margin - 80,
    pageHeight - 10
  );

  return doc.output("blob");
}

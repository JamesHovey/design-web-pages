import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Serve design HTML preview as standalone page
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const design = await prisma.design.findUnique({
      where: { id },
      select: {
        htmlPreview: true,
        cssCode: true,
        name: true,
      },
    });

    if (!design) {
      return new NextResponse("Design not found", { status: 404 });
    }

    // Combine HTML and CSS into a complete page with Elementor styling
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${design.name} - Design Preview</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
/* Elementor Base Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
}

/* Elementor Container Styles */
.elementor-element {
  position: relative;
}

.e-con {
  display: flex;
  width: 100%;
}

.e-con-boxed {
  max-width: 1200px;
  margin: 0 auto;
}

.e-con-full {
  width: 100%;
}

.e-con-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.e-flex {
  display: flex;
}

/* Widget Wrapper */
.elementor-widget {
  position: relative;
  margin-bottom: 20px;
}

.elementor-widget-container {
  width: 100%;
}

/* Heading Widget */
.elementor-heading-title {
  margin: 0;
  padding: 0;
  line-height: 1.2;
}

/* Button Widget */
.elementor-button-wrapper {
  display: inline-block;
}

.elementor-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 600;
}

.elementor-button-content-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.elementor-size-xs { padding: 8px 16px; font-size: 12px; }
.elementor-size-sm { padding: 12px 24px; font-size: 14px; }
.elementor-size-md { padding: 14px 28px; font-size: 16px; }
.elementor-size-lg { padding: 16px 32px; font-size: 18px; }
.elementor-size-xl { padding: 20px 40px; font-size: 20px; }

/* Divider Widget */
.elementor-divider {
  padding: 15px 0;
}

.elementor-divider-separator {
  display: block;
  border-top: 1px solid #ddd;
}

/* Spacer Widget */
.elementor-spacer-inner {
  display: block;
}

/* Icon Widget */
.elementor-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
}

/* Icon Box Widget */
.elementor-icon-box-wrapper {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.elementor-icon-box-icon {
  flex-shrink: 0;
}

.elementor-icon-box-content {
  flex-grow: 1;
}

.elementor-icon-box-title {
  margin: 0 0 10px;
}

.elementor-icon-box-description {
  margin: 0;
}

/* Image Box Widget */
.elementor-image-box-wrapper {
  text-align: center;
}

.elementor-image-box-img {
  margin: 0 0 20px;
}

.elementor-image-box-img img {
  width: 100%;
  height: auto;
  display: block;
}

/* Testimonial Widget */
.elementor-testimonial-wrapper {
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
}

.elementor-testimonial-content {
  margin: 0 0 20px;
  font-style: italic;
  line-height: 1.6;
}

.elementor-testimonial-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Star Rating Widget */
.elementor-star-rating {
  color: #ffc107;
  font-size: 24px;
}

/* Social Icons Widget */
.elementor-social-icons-wrapper {
  display: flex;
  gap: 10px;
}

.elementor-social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.3s;
}

/* Counter Widget */
.elementor-counter {
  text-align: center;
}

.elementor-counter-number {
  font-size: 48px;
  font-weight: 700;
  display: block;
}

.elementor-counter-title {
  margin-top: 10px;
  font-size: 16px;
}

/* Progress Widget */
.elementor-progress-wrapper {
  margin: 20px 0;
}

.elementor-progress-bar {
  background: #e0e0e0;
  border-radius: 10px;
  height: 20px;
  position: relative;
  margin-top: 10px;
}

.elementor-progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 2s ease;
}

.elementor-progress-text,
.elementor-progress-percentage {
  font-size: 14px;
  font-weight: 600;
}

/* Accordion Widget */
.elementor-accordion {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.elementor-accordion-item {
  border-bottom: 1px solid #e0e0e0;
}

.elementor-accordion-item:last-child {
  border-bottom: none;
}

.elementor-tab-title {
  padding: 15px 20px;
  cursor: pointer;
  background: white;
  transition: background 0.3s;
}

.elementor-tab-title:hover,
.elementor-tab-title.elementor-active {
  background: #f9f9f9;
}

.elementor-tab-content {
  padding: 0 20px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.elementor-tab-content.elementor-active {
  padding: 15px 20px;
  max-height: 1000px;
}

/* Tabs Widget */
.elementor-tabs-wrapper {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  gap: 5px;
}

.elementor-tabs .elementor-tab-title {
  border: none;
  border-bottom: 2px solid transparent;
  padding: 12px 24px;
  cursor: pointer;
}

.elementor-tabs .elementor-tab-title.elementor-active {
  border-bottom-color: currentColor;
}

.elementor-tab-content {
  padding: 20px;
}

/* Alert Widget */
.elementor-alert {
  padding: 15px 20px;
  border-radius: 4px;
  border: 1px solid;
}

.elementor-alert-info {
  background: #d1ecf1;
  border-color: #0dcaf0;
  color: #0c5460;
}

.elementor-alert-warning {
  background: #fff3cd;
  border-color: #ffc107;
  color: #856404;
}

.elementor-alert-success {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.elementor-alert-danger {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

/* CTA Widget */
.elementor-cta {
  padding: 60px 40px;
  text-align: center;
  border-radius: 12px;
}

.elementor-cta__title {
  margin: 0 0 15px;
  font-size: 36px;
}

.elementor-cta__description {
  margin: 0 0 30px;
  font-size: 18px;
}

.elementor-cta__button {
  display: inline-block;
}

/* Header/Footer */
.elementor-location-header,
.elementor-location-footer {
  width: 100%;
}

.elementor-section-wrap {
  width: 100%;
}

/* Custom Design CSS */
${design.cssCode}
  </style>
</head>
<body>
${design.htmlPreview}
</body>
</html>`;

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving design preview:", error);
    return new NextResponse("Failed to load preview", { status: 500 });
  }
}

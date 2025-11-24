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

/* Image Gallery Widget - Modern Grid with Hover Effects */
.elementor-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.elementor-gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.elementor-gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.elementor-gallery-item-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.elementor-gallery-item:hover .elementor-gallery-item-image {
  transform: scale(1.05);
}

.elementor-gallery-item-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 24px;
}

.elementor-gallery-item:hover .elementor-gallery-item-overlay {
  opacity: 1;
}

/* Image Carousel Widget - Modern Slider */
.elementor-image-carousel {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.elementor-carousel-slides {
  position: relative;
  height: 400px;
}

.elementor-carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.elementor-carousel-slide.active {
  opacity: 1;
}

.elementor-carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.elementor-carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.elementor-carousel-nav:hover {
  background: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.1);
}

.elementor-carousel-prev {
  left: 20px;
}

.elementor-carousel-next {
  right: 20px;
}

.elementor-carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.elementor-carousel-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.elementor-carousel-indicator.active {
  background: white;
  width: 32px;
  border-radius: 6px;
}

/* Icon List Widget - Modern Clean List */
.elementor-icon-list-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.elementor-icon-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  transition: all 0.2s ease;
}

.elementor-icon-list-item:hover {
  padding-left: 8px;
}

.elementor-icon-list-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color, #007bff);
}

.elementor-icon-list-text {
  font-size: 16px;
  line-height: 1.6;
}

/* Toggle Widget */
.elementor-toggle {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.elementor-toggle-item {
  border-bottom: 1px solid #e0e0e0;
}

.elementor-toggle-item:last-child {
  border-bottom: none;
}

.elementor-toggle .elementor-tab-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
}

.elementor-toggle .elementor-tab-title:hover {
  background: #f9f9f9;
}

.elementor-toggle-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color, #007bff);
}

/* Audio Widget - Modern Player */
.elementor-audio-player {
  width: 100%;
  height: 54px;
  border-radius: 27px;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Form Widget - Modern Input Styles */
.elementor-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.elementor-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.elementor-field-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.elementor-field {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.elementor-field:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

textarea.elementor-field {
  resize: vertical;
  min-height: 120px;
}

/* Price Table Widget - Modern Card Design */
.elementor-price-table {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  border: 2px solid #e0e0e0;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.elementor-price-table:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.elementor-price-table-featured {
  border-color: var(--primary-color, #007bff);
  border-width: 3px;
  box-shadow: 0 8px 24px rgba(0, 123, 255, 0.15);
}

.elementor-price-table-ribbon {
  position: absolute;
  top: 20px;
  right: -35px;
  background: var(--primary-color, #007bff);
  color: white;
  padding: 6px 40px;
  transform: rotate(45deg);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.elementor-price-table-heading {
  font-size: 24px;
  margin: 0 0 24px;
  color: #333;
}

.elementor-price-table-price {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary-color, #007bff);
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.elementor-price-table-currency {
  font-size: 28px;
  align-self: flex-start;
  margin-top: 8px;
}

.elementor-price-table-period {
  font-size: 18px;
  font-weight: 400;
  color: #666;
  align-self: flex-end;
  margin-bottom: 12px;
}

.elementor-price-table-features-list {
  list-style: none;
  padding: 0;
  margin: 32px 0;
}

.elementor-price-table-feature-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.elementor-price-table-feature-icon {
  color: #28a745;
}

.elementor-price-table-button {
  width: 100%;
  padding: 16px 32px;
  background: var(--primary-color, #007bff);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
  transition: all 0.3s ease;
}

.elementor-price-table-button:hover {
  background: var(--secondary-color, #0056b3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* Flip Box Widget - 3D Flip Effect */
.elementor-flip-box {
  perspective: 1000px;
  min-height: 300px;
}

.elementor-flip-box-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
}

.elementor-flip-box-front {
  background: linear-gradient(135deg, var(--primary-color, #007bff) 0%, var(--secondary-color, #6c757d) 100%);
  color: white;
}

.elementor-flip-box-back {
  background: white;
  transform: rotateY(180deg);
  border: 2px solid #e0e0e0;
}

.elementor-flip-box:hover .elementor-flip-box-front {
  transform: rotateY(-180deg);
}

.elementor-flip-box:hover .elementor-flip-box-back {
  transform: rotateY(0);
}

.elementor-flip-box-layer-inner {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.elementor-flip-box-layer-title {
  font-size: 28px;
  margin: 0 0 16px;
}

.elementor-flip-box-button {
  margin-top: 20px;
  padding: 12px 32px;
  background: var(--primary-color, #007bff);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
  transition: all 0.3s ease;
}

.elementor-flip-box-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* Countdown Widget - Modern Digital Display */
.elementor-countdown-wrapper {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.elementor-countdown-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 100px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.elementor-countdown-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.elementor-countdown-digits {
  display: block;
  font-size: 48px;
  font-weight: 700;
  color: var(--primary-color, #007bff);
  line-height: 1;
  margin-bottom: 8px;
}

.elementor-countdown-label {
  display: block;
  font-size: 14px;
  text-transform: uppercase;
  color: #666;
  font-weight: 600;
  letter-spacing: 1px;
}

/* Animated Headline Widget - Modern Typography */
.elementor-headline {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.elementor-headline-dynamic-wrapper {
  position: relative;
  overflow: hidden;
}

.elementor-headline-dynamic-text {
  color: var(--primary-color, #007bff);
  display: inline-block;
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modern Design Enhancements - Glassmorphism & Gradients */
.elementor-widget:hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smooth Transitions */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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

export interface QualityCheck {
  name: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  feedback?: string;
}

export interface ValidationResult {
  distinctivenessScore: number; // 0-100
  issues: string[];
  strengths: string[];
  checks: QualityCheck[];
  genericPatternDetected: boolean;
}

/**
 * Validate design quality and calculate distinctiveness score
 * Based on critical design principles from requirements
 */
export function validateDesign(widgetStructure: any): ValidationResult {
  const checks: QualityCheck[] = [];

  // Check 1: Asymmetric layout (15 points)
  const hasAsymmetricLayout = checkAsymmetricLayout(widgetStructure);
  checks.push({
    name: "Uses asymmetric layout (not centered everything)",
    passed: hasAsymmetricLayout,
    points: hasAsymmetricLayout ? 15 : 0,
    maxPoints: 15,
    feedback: hasAsymmetricLayout
      ? "Good use of asymmetric layouts"
      : "Design appears to center everything - consider 70/30 splits or offset content",
  });

  // Check 2: Typography variations (15 points)
  const typographyScore = checkTypographyVariations(widgetStructure);
  checks.push({
    name: "Typography has 3+ size variations",
    passed: typographyScore.passed,
    points: typographyScore.points,
    maxPoints: 15,
    feedback: typographyScore.feedback,
  });

  // Check 3: Strategic color use (15 points)
  const colorScore = checkStrategicColorUse(widgetStructure);
  checks.push({
    name: "Color used strategically (not just primary everywhere)",
    passed: colorScore.passed,
    points: colorScore.points,
    maxPoints: 15,
    feedback: colorScore.feedback,
  });

  // Check 4: Varied spacing (10 points)
  const spacingScore = checkVariedSpacing(widgetStructure);
  checks.push({
    name: "Spacing is varied and intentional (3+ values)",
    passed: spacingScore.passed,
    points: spacingScore.points,
    maxPoints: 10,
    feedback: spacingScore.feedback,
  });

  // Check 5: Distinctive layout pattern (15 points)
  const layoutScore = checkDistinctiveLayout(widgetStructure);
  checks.push({
    name: "Layout pattern is uncommon/distinctive",
    passed: layoutScore.passed,
    points: layoutScore.points,
    maxPoints: 15,
    feedback: layoutScore.feedback,
  });

  // Check 6: Industry personality (10 points)
  const personalityScore = checkIndustryPersonality(widgetStructure);
  checks.push({
    name: "Industry personality is clear",
    passed: personalityScore.passed,
    points: personalityScore.points,
    maxPoints: 10,
    feedback: personalityScore.feedback,
  });

  // Check 7: Decorative elements (10 points)
  const decorativeScore = checkDecorativeElements(widgetStructure);
  checks.push({
    name: "Includes decorative/distinctive elements",
    passed: decorativeScore.passed,
    points: decorativeScore.points,
    maxPoints: 10,
    feedback: decorativeScore.feedback,
  });

  // Check 8: Content specificity (10 points)
  const contentScore = checkContentSpecificity(widgetStructure);
  checks.push({
    name: "Content is industry-specific (no generic phrases)",
    passed: contentScore.passed,
    points: contentScore.points,
    maxPoints: 10,
    feedback: contentScore.feedback,
  });

  // Calculate total score
  const totalPoints = checks.reduce((sum, check) => sum + check.points, 0);
  const maxPoints = checks.reduce((sum, check) => sum + check.maxPoints, 0);
  const distinctivenessScore = Math.round((totalPoints / maxPoints) * 100);

  // Determine if generic pattern detected
  const genericPatternDetected = distinctivenessScore < 70;

  // Extract issues and strengths
  const issues = checks
    .filter((check) => !check.passed)
    .map((check) => check.feedback || check.name);

  const strengths = checks
    .filter((check) => check.passed)
    .map((check) => check.feedback || check.name);

  return {
    distinctivenessScore,
    issues,
    strengths,
    checks,
    genericPatternDetected,
  };
}

function checkAsymmetricLayout(structure: any): boolean {
  const sections = structure.sections || [];
  const asymmetricLayouts = ["asymmetric", "70-30", "offset", "split", "bento"];

  return sections.some((section: any) =>
    asymmetricLayouts.some((pattern) =>
      section.layout?.toLowerCase().includes(pattern)
    )
  );
}

function checkTypographyVariations(structure: any): {
  passed: boolean;
  points: number;
  feedback: string;
} {
  const sections = structure.sections || [];
  const fontSizes = new Set<number>();

  sections.forEach((section: any) => {
    section.widgets?.forEach((widget: any) => {
      if (widget.styling?.fontSize) {
        const desktopSize =
          typeof widget.styling.fontSize === "object"
            ? widget.styling.fontSize.desktop
            : widget.styling.fontSize;

        if (desktopSize) {
          const size = parseInt(desktopSize);
          if (!isNaN(size)) fontSizes.add(size);
        }
      }
    });
  });

  const uniqueSizes = fontSizes.size;
  const passed = uniqueSizes >= 3;
  const points = passed ? 15 : Math.min(uniqueSizes * 5, 15);

  return {
    passed,
    points,
    feedback: passed
      ? `Good typography hierarchy with ${uniqueSizes} distinct sizes`
      : `Only ${uniqueSizes} font sizes found - add more dramatic size variations`,
  };
}

function checkStrategicColorUse(structure: any): {
  passed: boolean;
  points: number;
  feedback: string;
} {
  const sections = structure.sections || [];
  let hasGradients = false;
  let hasColorVariety = false;
  let colorCount = 0;

  sections.forEach((section: any) => {
    if (section.background?.type === "gradient") hasGradients = true;
    if (section.background?.color) colorCount++;

    section.widgets?.forEach((widget: any) => {
      if (widget.styling?.background?.includes("gradient")) hasGradients = true;
      if (widget.styling?.color) colorCount++;
    });
  });

  hasColorVariety = colorCount >= 3;
  const passed = hasGradients && hasColorVariety;
  const points = (hasGradients ? 8 : 0) + (hasColorVariety ? 7 : 0);

  return {
    passed,
    points,
    feedback: passed
      ? "Strategic color use with gradients and variety"
      : `${!hasGradients ? "Add gradients for depth. " : ""}${!hasColorVariety ? "Use more color variety" : ""}`,
  };
}

function checkVariedSpacing(structure: any): {
  passed: boolean;
  points: number;
  feedback: string;
} {
  const sections = structure.sections || [];
  const spacingValues = new Set<number>();

  sections.forEach((section: any) => {
    if (section.styling?.padding) {
      const padding = section.styling.padding;
      ["top", "bottom", "left", "right"].forEach((side) => {
        if (padding[side]) {
          const value = parseInt(padding[side]);
          if (!isNaN(value)) spacingValues.add(value);
        }
      });
    }
  });

  const uniqueSpacing = spacingValues.size;
  const passed = uniqueSpacing >= 3;
  const points = passed ? 10 : Math.min(uniqueSpacing * 3, 10);

  return {
    passed,
    points,
    feedback: passed
      ? `Good spacing rhythm with ${uniqueSpacing} different values`
      : `Only ${uniqueSpacing} spacing values found - use varied spacing (40px, 64px, 96px, etc.)`,
  };
}

function checkDistinctiveLayout(structure: any): {
  passed: boolean;
  points: number;
  feedback: string;
} {
  const sections = structure.sections || [];
  const genericPatterns = ["three-column", "centered", "standard-grid"];
  const distinctivePatterns = [
    "bento",
    "asymmetric",
    "diagonal",
    "masonry",
    "offset",
  ];

  const hasGeneric = sections.some((section: any) =>
    genericPatterns.some((pattern) =>
      section.layout?.toLowerCase().includes(pattern)
    )
  );

  const hasDistinctive = sections.some((section: any) =>
    distinctivePatterns.some((pattern) =>
      section.layout?.toLowerCase().includes(pattern)
    )
  );

  const passed = hasDistinctive && !hasGeneric;
  const points = passed ? 15 : hasDistinctive ? 10 : 5;

  return {
    passed,
    points,
    feedback: passed
      ? "Distinctive layout pattern"
      : "Consider more unconventional layout patterns (bento-box, asymmetric grids, etc.)",
  };
}

function checkIndustryPersonality(structure: any): {
  passed: boolean;
  points: number;
  feedback: string;
} {
  // This would be more sophisticated with actual industry analysis
  // For now, check if design has personality indicators
  const sections = structure.sections || [];
  const hasPersonality = sections.some(
    (section: any) =>
      section.decorativeElements?.length > 0 ||
      section.background?.type === "gradient" ||
      section.layout?.includes("creative")
  );

  return {
    passed: hasPersonality,
    points: hasPersonality ? 10 : 5,
    feedback: hasPersonality
      ? "Clear industry personality evident"
      : "Add more industry-specific personality elements",
  };
}

function checkDecorativeElements(structure: any): {
  passed: boolean;
  points: number;
  feedback: string;
} {
  const sections = structure.sections || [];
  const decorativeCount = sections.reduce(
    (count: number, section: any) =>
      count + (section.decorativeElements?.length || 0),
    0
  );

  const passed = decorativeCount >= 2;
  const points = Math.min(decorativeCount * 5, 10);

  return {
    passed,
    points,
    feedback: passed
      ? `${decorativeCount} decorative elements add distinctiveness`
      : "Add decorative elements (abstract shapes, patterns, etc.)",
  };
}

function checkContentSpecificity(structure: any): {
  passed: boolean;
  points: number;
  feedback: string;
} {
  const sections = structure.sections || [];
  const genericPhrases = [
    "your trusted partner",
    "we deliver excellence",
    "contact us today",
    "learn more",
    "get started",
    "click here",
  ];

  let genericCount = 0;
  sections.forEach((section: any) => {
    section.widgets?.forEach((widget: any) => {
      if (widget.text) {
        const text = widget.text.toLowerCase();
        genericPhrases.forEach((phrase) => {
          if (text.includes(phrase)) genericCount++;
        });
      }
    });
  });

  const passed = genericCount === 0;
  const points = passed ? 10 : Math.max(10 - genericCount * 2, 0);

  return {
    passed,
    points,
    feedback: passed
      ? "Content is specific and industry-relevant"
      : `${genericCount} generic phrases found - make content more specific`,
  };
}

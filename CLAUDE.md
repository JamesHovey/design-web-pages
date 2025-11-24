# Claude Instructions

## Version Management

**IMPORTANT: After every significant change, update the version number.**

### Version Update Process

1. **Update the version in:** `/components/VersionIndicator.tsx`
2. **Version format:** `MAJOR.MINOR.PATCH` (e.g., 1.7.0)
3. **When to increment:**
   - **MAJOR** (1.x.x): Breaking changes, major feature overhauls
   - **MINOR** (x.7.x): New features, significant improvements
   - **PATCH** (x.x.1): Bug fixes, small improvements

### Examples of Changes That Require Version Updates

- ✅ Adding new features (design patterns, widgets, functionality)
- ✅ Fixing bugs or issues
- ✅ Improving existing features
- ✅ Updating CSS/design systems
- ✅ Adding new API endpoints
- ✅ Database schema changes
- ✅ UI/UX improvements

### Version Update Template

```typescript
const version = "X.Y.Z";
const phase = "Deployed";
const buildDate = "YYYY-MM-DD";
```

### Commit Message Format

When updating version, include changelog in commit:

```
Update version to X.Y.Z

Version X.Y.Z includes:
- Feature 1 description
- Feature 2 description
- Bug fix description
```

---

## Current Version

**v1.8.0** (November 24, 2025)

### Changelog

**v1.8.0** (2025-11-24)
- **INCREMENTAL APPROACH**: Focus on Global Headers first before body content
- Global Widgets configuration UI with header widget options
- Header-only AI design generation system
- New header widgets: Site Logo, Nav Menu, Search, Icon Box, Cart Icon
- Professional header CSS with sticky navigation
- Database schema updated for globalHeaderConfig storage
- AI prompt redesigned to generate only professional headers

**v1.7.0** (2025-11-24)
- Professional design patterns from 30-site analysis
- Universal shadow system (2px 2px 6px rgba(0,0,0,0.3))
- 8px spacing grid system
- Standardized transitions (0.35s ease-out)
- Enhanced hover states with shadow boost
- Project persistence in Recent Projects dashboard
- Full design storage and retrieval

**v1.6.0** (2025-11-24)
- Added 13 new widget generators
- Modern CSS with glassmorphism and gradients
- Comprehensive Elementor integration with 30+ widgets
- JSON exporters updated
- Claude AI prompts include widget schemas

---

## Project Context

This is a **website design generator** that creates professional Elementor-compatible mockups using AI.

### Key Goals
- Generate visually professional HTML mockups
- Match professional Elementor design standards
- Use proper spacing, shadows, and visual hierarchy
- Store and display projects in dashboard

### Important Files
- `/components/VersionIndicator.tsx` - Version display
- `/app/api/designs/[id]/preview/route.ts` - CSS design system
- `/lib/design/designGenerator.ts` - AI design generation
- `/lib/elementor/htmlGenerator.ts` - HTML widget generation
- `/app/dashboard/page.tsx` - Main dashboard

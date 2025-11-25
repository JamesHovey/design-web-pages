# Claude Instructions

## Version Management

**IMPORTANT: After every significant change, update the version number.**

**🔒 AUTOMATED ENFORCEMENT:** A pre-commit hook automatically enforces version updates. If you commit significant changes without updating the version, the commit will be blocked with a clear error message.

### Version Update Process

1. **Update the version in:** `/components/VersionIndicator.tsx`
2. **Version format:** `MAJOR.MINOR.PATCH` (e.g., 1.7.0)
3. **When to increment:**
   - **MAJOR** (1.x.x): Breaking changes, major feature overhauls
   - **MINOR** (x.7.x): New features, significant improvements
   - **PATCH** (x.x.1): Bug fixes, small improvements

### Pre-Commit Hook

Location: `.git/hooks/pre-commit`

**What it does:**
- Detects changes to significant files (`/app`, `/lib`, `/components`, database schema, etc.)
- Blocks commits if `VersionIndicator.tsx` wasn't also updated
- Shows a clear error message explaining what needs to be done
- Allows commits to proceed when version is properly updated

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

**v1.19.0** (November 25, 2025)

### Changelog

**v1.19.0** (2025-11-25)
- **INTELLIGENT MEDIA FETCHING**: Media now fetched AFTER Claude designs layout (not during URL detection)
- Analyzes widget structures to determine exact media requirements
- Fetches only the images/videos actually needed by the design
- Significantly faster URL detection (no waiting for Unsplash/Pexels APIs)
- More efficient: no wasted API calls for unused media assets
- New media analyzer utility to scan widget structures

**v1.13.0** (2025-11-25)
- **AUTOMATIC URL DETECTION**: Enter a URL and detection starts automatically (no button click needed)
- Real-time progress animation showing detection stages
- Visual indicators for: Content extraction, Site type, Industry, Logo colors
- Fallback industry detection when AI classification fails
- Improved error logging for debugging industry detection
- Enhanced UX with 800ms debounce for URL validation

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

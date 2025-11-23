# Design Web Pages - AI-Powered Website Design Generator

Internal web application for generating professional website designs for budget clients using AI. Eliminates the Copy Writing and Design phases while maintaining quality standards.

## 🎯 Project Overview

**Purpose:** Internal tool for Development team to generate distinctive, production-grade website designs using Claude AI

**Target Users:** Development team members at marketing agency

**Key Features:**
- URL scraping and site analysis
- AI-powered design generation (3 variations)
- Competitor research automation
- Color scheme generation from logos
- Elementor widget-based designs
- Quality validation and scoring
- PDF export for specifications

## 🛠 Tech Stack

- **Frontend:** Next.js 15.4.6 (App Router), React 19.1.0, TypeScript 5, Tailwind CSS v4
- **Backend:** Next.js API Routes, PostgreSQL, Prisma 6.13.0
- **Authentication:** NextAuth.js 4.24.11 with bcryptjs
- **AI:** Anthropic Claude SDK 0.65.0 (Sonnet 4.5)
- **Web Scraping:** Puppeteer 24.22.3 + Stealth plugin
- **Media Processing:** Sharp (.avif conversion), html2canvas (screenshots), jsPDF (PDF export)
- **Design Tools:** Chroma.js (color harmony), @uiw/react-color (color picker)
- **APIs:** Google Fonts API, iStock API (for placeholder images)

## 📁 Project Structure

```
design-web-pages/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── dashboard/           # Main dashboard
│   ├── projects/            # Project management
│   │   ├── new/             # Create new project
│   │   ├── [id]/            # Project details
│   │   │   ├── configure/   # Configuration dashboard
│   │   │   ├── generating/  # Loading state
│   │   │   └── results/     # Design results
│   │   └── saved/           # Gallery of designs
│   └── api/                 # API routes
├── components/              # React components
├── lib/                     # Utility libraries
│   ├── scraping/            # Puppeteer services
│   ├── ai/                  # Claude AI integration
│   ├── colors/              # Color extraction & harmony
│   ├── fonts/               # Google Fonts integration
│   ├── media/               # Image/video processing
│   ├── elementor/           # Widget definitions
│   └── export/              # PDF/JSON export
└── prisma/                  # Database schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API keys (see Environment Variables)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/JamesHovey/design-web-pages.git
cd design-web-pages
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/design_web_pages"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_FONTS_API_KEY="your-key"
ISTOCK_API_KEY="your-key"
ISTOCK_API_SECRET="your-secret"
```

4. **Set up the database:**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Critical Design Principles

The AI generates designs following these principles to avoid generic patterns:

1. **Asymmetric Layouts:** 70/30 splits, offset content, varied grid patterns
2. **Varied Spacing:** Strategic use of 40px, 64px, 96px, 120px, 160px (not uniform padding)
3. **Dramatic Typography:** H1: 64px, H2: 40px, H3: 28px, Body: 18px
4. **Strategic Color Use:** Gradients, overlays, unexpected combinations
5. **Industry-Specific Content:** No generic phrases like "Learn More" or "Your Trusted Partner"
6. **Accessibility:** WCAG AA minimum (targeting AAA)

## 📊 Design Variations

Each project generates **3 design variations:**

1. **Conservative:** Professional, trust-building, traditional but modern
2. **Balanced:** Modern with personality, approachable yet credible
3. **Bold:** Attention-grabbing, unconventional layouts, strong visual identity

## 🔄 Workflow

1. **Enter URL:** Input existing website URL to redesign
2. **Scraping:** Automatic content extraction and site classification (E-commerce vs Lead Gen)
3. **Competitor Analysis:** AI identifies and analyzes 3-5 competitors
4. **Configuration:**
   - Select viewports (Desktop, Laptop, Tablet, Mobile)
   - Configure colors (auto-extract from logo or custom)
   - Select fonts (AI-recommended or manual override)
   - Choose Elementor widgets
5. **Generate Designs:** Claude AI generates 3 distinct homepage designs
6. **Quality Validation:** Automatic scoring (target: 85+/100)
7. **Preview:** View designs across selected viewports
8. **Export:** Download PDF specifications or JSON structure

## 🏗 Database Schema

### Key Models

- **User:** Authentication and project ownership
- **Project:** Scraped content, configuration, status
- **Design:** Widget structure, screenshots, quality scores
- **CompetitorCache:** Cached competitor analysis (7-day TTL)
- **ElementorWidget:** Widget definitions and best practices

See `prisma/schema.prisma` for complete schema.

## 🔐 Security

- API keys protected (never exposed in client code)
- Rate limiting on expensive operations
- Input validation with Zod
- Sanitized scraped content
- CORS configuration
- SQL injection prevention via Prisma

## 🚢 Deployment (Railway)

1. **Connect Repository:** Link GitHub repo to Railway
2. **Set Environment Variables:** Configure all env vars in Railway dashboard
3. **Database:** Railway will provision PostgreSQL automatically
4. **Deploy:** Push to main branch triggers auto-deployment

Build command: `prisma generate && prisma migrate deploy && next build`
Start command: `next start`

## 📈 Success Metrics

- **Time Savings:** 80% reduction in design phase
- **Cost Efficiency:** 60-70% cheaper than full-service design
- **Quality:** 90%+ accessibility scores
- **Distinctiveness:** 85%+ quality scores
- **Adoption:** 100% of budget clients within 3 months

## 🛣 Development Phases

### Phase 1: Core Infrastructure ✅
- Authentication system
- Database setup
- Basic dashboard UI
- URL scraping pipeline
- Site classification

### Phase 2: Configuration UI (In Progress)
- Viewport selector
- Color scheme builder
- Font selector
- Widget selector
- Media configuration

### Phase 3: AI Integration (Upcoming)
- Competitor research automation
- Claude API design generation
- Design preview rendering
- Quality validation
- Auto-refinement

### Phase 4: Media & Polish (Upcoming)
- iStock API integration
- Image processing pipeline
- YouTube placeholders
- Screenshot generation
- Gallery with filters

### Phase 5: Export & Testing (Upcoming)
- PDF export
- JSON export
- QA testing
- Performance optimization
- Documentation

## 📝 Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Run database migrations
```

## 🤝 Contributing

This is an internal tool. Contact the Development team lead for contribution guidelines.

## 📄 License

Proprietary - Internal use only

## 🆘 Support

For issues or questions, contact the Development team or create an issue in this repository.

---

**Built with ❤️ by the Development Team**

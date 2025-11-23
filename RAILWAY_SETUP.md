# Railway Deployment Setup Guide

## Prerequisites
- GitHub repository connected to Railway
- Railway account

## Step-by-Step Deployment

### 1. Add PostgreSQL Database

In your Railway project dashboard:

1. Click **"+ New"** button
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will automatically:
   - Create the database
   - Set the `DATABASE_URL` environment variable
   - Link it to your project

### 2. Set Required Environment Variables

Go to your Railway project settings and add these variables:

```bash
# Railway auto-provides this when you add PostgreSQL
DATABASE_URL=<automatically set by Railway>

# Required for NextAuth.js
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Optional: Set to production
NODE_ENV=production
```

**To generate `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

### 3. Deploy

Railway will automatically deploy when you:
- Push to the `main` branch
- Or manually trigger a deploy in Railway dashboard

### 4. Build Process

The build script (`railway-build.sh`) will:

1. ✅ Generate Prisma client
2. ✅ Run database migrations (if `DATABASE_URL` is set)
3. ✅ Build Next.js application

### 5. Verify Deployment

Once deployed:

1. Open your Railway app URL
2. You should see the **Gateway login page**
3. Login with:
   - Username: `pmw`
   - Password: `pmw`
4. Register a new user account
5. Access the dashboard

## Troubleshooting

### Build fails with "DATABASE_URL not found"
- **Solution:** Add PostgreSQL database in Railway (Step 1)

### Build succeeds but app won't start
- **Solution:** Check that `NEXTAUTH_SECRET` is set

### Gateway login not working
- **Solution:** Check browser console for errors, ensure cookies are enabled

### Database connection errors
- **Solution:** Verify `DATABASE_URL` is set correctly in Railway

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set by Railway) |
| `NEXTAUTH_URL` | Yes | Your Railway app URL |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `NODE_ENV` | Optional | Set to `production` |
| `ANTHROPIC_API_KEY` | Later | For AI features (Phase 3) |
| `GOOGLE_FONTS_API_KEY` | Later | For font selection (Phase 2) |
| `ISTOCK_API_KEY` | Later | For image placeholders (Phase 4) |

## What's Deployed

### ✅ Phase 1 (Current)
- Gateway authentication
- User login/registration
- Dashboard with project options
- Route protection middleware

### 🚧 Coming Next
- Phase 2: URL scraping and configuration
- Phase 3: AI design generation
- Phase 4: Media processing and gallery
- Phase 5: PDF export

## Support

If you encounter issues:
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Ensure PostgreSQL database is connected
4. Check that migrations ran successfully

---

**Note:** The application requires a PostgreSQL database to function. Make sure to add it before deploying!

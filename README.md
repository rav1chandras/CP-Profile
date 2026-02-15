# Admissions Command Center - Next.js with Neon Postgres

A modern admissions profile management system built with Next.js 15, TypeScript, Tailwind CSS, and Neon Postgres.

## ⚠️ Important Update

This version uses **Neon Postgres** (the current standard) instead of the deprecated `@vercel/postgres` package.

## Features

- **Real-time Profile Calculations**: Dynamic academic index, rigor score, and EC scoring
- **Database Persistence**: Save and load profiles using Neon Postgres
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Interactive Controls**: Sliders, inputs, and checkboxes for profile customization
- **Strategic Insights**: AI-powered feedback based on profile data
- **Edge Runtime**: Fast, globally distributed API routes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres (Serverless)
- **Runtime**: Edge Runtime for API routes
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Vercel account (for deployment)

### Local Development

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variable**
   
   Create a `.env.local` file:
   ```env
   DATABASE_URL="your-neon-database-url"
   ```
   
   Get your DATABASE_URL from:
   - Vercel (after connecting Neon Postgres), or
   - Neon dashboard at https://neon.tech

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

### Option 1: Through Vercel (Easiest)

1. Deploy to Vercel first (see DEPLOYMENT.md)
2. Add Neon Postgres in Storage tab
3. DATABASE_URL is automatically added
4. Copy the value to your `.env.local` for local development

### Option 2: Direct Neon Setup

1. Go to https://neon.tech and create account
2. Create a new project
3. Copy the connection string
4. Add to `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   ```

The table will be created automatically on first save.

## Deployment to Vercel

See **DEPLOYMENT.md** for complete step-by-step instructions.

**Quick version:**
1. Push code to GitHub
2. Import to Vercel
3. Add Neon Postgres in Storage tab
4. Redeploy
5. Done!

## Project Structure

```
admissions-app/
├── app/
│   ├── api/
│   │   └── profile/
│   │       └── route.ts          # API with Neon integration
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   └── Dashboard.tsx             # Main dashboard component
├── .env.example                  # Example environment variables
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies (updated for Neon)
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## API Endpoints

### GET `/api/profile`
Fetches the most recent user profile.

**Response**:
```json
{
  "profile": {
    "id": 1,
    "gpa": 3.95,
    "sat": 1510,
    ...
  }
}
```

### POST `/api/profile`
Saves a new user profile.

**Request**:
```json
{
  "gpa": 3.95,
  "sat": 1510,
  "act": 0,
  ...
}
```

**Response**:
```json
{
  "success": true,
  "profile": { ... }
}
```

## Database Schema

```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  gpa DECIMAL(3, 2),
  sat INTEGER,
  act INTEGER,
  ap_offered INTEGER,
  ap_taken INTEGER,
  ec_tier INTEGER,
  roles INTEGER,
  major_multiplier DECIMAL(3, 2),
  is_ed BOOLEAN,
  is_athlete BOOLEAN,
  is_legacy BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## What Changed from Old Version

If you're updating from the old `@vercel/postgres` version:

1. **Dependencies**: Updated to `@neondatabase/serverless`
2. **API Routes**: Simplified to use single `DATABASE_URL`
3. **Edge Runtime**: API routes now run on Edge for better performance
4. **Next.js**: Updated to Next.js 15 (latest stable)
5. **React**: Updated to React 19

## Environment Variables

Only one environment variable needed:

- `DATABASE_URL` - Neon Postgres connection string

This is automatically set when you connect Neon Postgres through Vercel's Storage tab.

## Troubleshooting

### "DATABASE_URL not configured"

**Solutions:**
1. Ensure Neon database is connected in Vercel Storage tab
2. Redeploy after connecting
3. For local dev, add DATABASE_URL to `.env.local`

### "Connection refused" or Database sleeping

**Solutions:**
1. Neon free tier databases sleep after inactivity
2. First request after sleep takes 5-10 seconds
3. Subsequent requests are instant
4. Consider Neon paid tier for always-on databases

### Build or Type Errors

**Solutions:**
1. Delete `node_modules` and `.next` folders
2. Run `npm install` again
3. Run `npm run build` to check for errors
4. Ensure you're using Node.js 18+

## Performance

- **Edge Runtime**: API routes run globally on Cloudflare's edge network
- **Serverless Database**: Neon automatically scales connections
- **Automatic Optimization**: Next.js optimizes images, fonts, and bundles
- **Cold Start**: ~100ms for Edge Functions, ~5s for sleeping Neon databases

## Neon Free Tier Limits

- 0.5 GB storage
- 1 compute unit (shared CPU)
- Database sleeps after 5 minutes of inactivity
- Unlimited queries
- Perfect for development and small projects

## Future Enhancements

- User authentication
- Multiple profile support
- College matching algorithm
- Data export (CSV/PDF)
- Historical profile tracking
- Comparison with peers

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is provided as-is for educational purposes.

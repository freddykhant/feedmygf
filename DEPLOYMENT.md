# Production Deployment Checklist

## ✅ Completed
- Rate limiting with Upstash (10 requests per 10 seconds)
- All console.logs removed from production code
- TypeScript/ESLint errors fixed
- Tailwind CSS v4 warnings resolved
- Production build tested and passing
- Environment variables documented

## 🚀 Vercel Deployment Steps

### 1. Required Environment Variables
Add these to your Vercel project settings:

```bash
# Database
DATABASE_URL="your-neon-postgres-url"

# NextAuth.js
NEXTAUTH_SECRET="generate-with-npx-auth-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Places API
GOOGLE_PLACES_API_KEY="your-google-places-api-key"

# Upstash Redis
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

### 2. Upstash Redis Setup
1. Sign up at https://upstash.com
2. Create a new Redis database
3. Copy the REST URL and REST TOKEN
4. Add them to Vercel environment variables

### 3. Google APIs Configuration
Ensure these APIs are enabled in Google Cloud Console:
- Places API (New)
- Geocoding API

### 4. OAuth Redirect URLs
Add your Vercel domain to Google OAuth authorized redirect URIs:
- `https://your-domain.vercel.app/api/auth/callback/google`

### 5. Database Migration
Run Prisma migrations on your Neon database:
```bash
pnpm prisma migrate deploy
```

### 6. Deploy
Push to your GitHub repository and Vercel will automatically deploy.

## 📝 Rate Limiting Details
- **Strategy**: Sliding window
- **Limit**: 10 requests per 10 seconds per IP address
- **Identifier**: Uses `x-forwarded-for` header (Vercel provides this)
- **Applied to**: All tRPC procedures (search, getDetails, reverseGeocode, searchRestaurants)

## 🔒 Security Features
- Rate limiting on all API routes
- Password hashing with bcryptjs
- JWT session strategy for credentials auth
- Environment variables validated at build time

## 🎨 Design
- Luma-inspired aesthetic with light gradients
- SF Pro font stack
- Responsive design optimized for desktop and mobile

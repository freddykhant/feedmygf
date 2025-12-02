# feedmygf

restaurant finder with vibes. can't decide where to eat? just set your preferences and get a random spot nearby.

## demo

<img src="./public/fmg.gif" width="800" />

## tech stack

- next.js 15 + app router
- trpc for type-safe apis
- prisma + neon postgres
- nextauth for google oauth + email/password
- google places api (new version)
- upstash redis for rate limiting
- tailwind css v4
- canvas-confetti for the celebration vibes

## setup

```bash
# install deps
pnpm install

# copy env file
cp .env.example .env

# add your keys to .env:
# - DATABASE_URL (neon postgres)
# - NEXTAUTH_SECRET (run: npx auth secret)
# - GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
# - GOOGLE_PLACES_API_KEY (enable Places API + Geocoding API)
# - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

# run migrations
pnpm prisma migrate dev

# start dev server
pnpm dev
```

## features

- ✅ email/password + google oauth
- ✅ google places autocomplete with current location
- ✅ cuisine-specific filtering (italian, japanese, chinese, etc.)
- ✅ restaurant photos from google places
- ✅ confetti animation on success
- ✅ rate limiting on all api calls
- ✅ production build passing with zero errors

built with the t3 stack.

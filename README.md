# feedmygf

restaurant finder with vibes. can't decide where to eat? just set your preferences and get a random spot nearby.

available as both a web app and chrome extension.

## demo

<img src="./public/fmg.gif" width="800" />

## features

- ✅ web app + chrome extension
- ✅ google places autocomplete with current location
- ✅ cuisine-specific filtering (italian, japanese, chinese, etc.)
- ✅ restaurant photos from google places
- ✅ confetti animation on success
- ✅ rate limiting on all api calls
- ✅ fully responsive mobile design
- ✅ production build passing with zero errors

## tech stack

- next.js 15 + app router
- trpc for type-safe apis
- prisma + neon postgres
- google places api (new version)
- upstash redis for rate limiting
- tailwind css v4
- canvas-confetti for the celebration vibes
- chrome extension manifest v3

## web app

```bash
# install deps
pnpm install

# copy env file
cp .env.example .env

# add your keys to .env:
# - DATABASE_URL (neon postgres)
# - GOOGLE_PLACES_API_KEY (enable Places API + Geocoding API)
# - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

# run migrations
pnpm prisma migrate dev

# start dev server
pnpm dev
```

## chrome extension

the chrome extension lives in `/src/extension` and uses the same api as the web app.

### loading the extension

1. go to `chrome://extensions/`
2. enable "developer mode"
3. click "load unpacked"
4. select `/src/extension` folder

built with the t3 stack.

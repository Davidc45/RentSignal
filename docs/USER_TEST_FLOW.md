# RentSignal — manual user test flow

Use this checklist to confirm the integrated landing experience and AppSync data path.

## Prerequisites

1. Copy `.env.example` to `.env.local` (if needed) and set:
   - `NEXT_PUBLIC_APPSYNC_URL`
   - `NEXT_PUBLIC_APPSYNC_API_KEY`
   - `NEXT_PUBLIC_AWS_REGION`
2. From the project root: `npm install`
3. Start the app: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Automated checks (optional)

- `npm run test:run` — unit tests for `fetchMarketSnapshot` (no `.env.local` required).
- `npm run test:appsync:live` — optional live GraphQL call (requires `.env.local` and `RUN_APPSYNC_LIVE` via script).

## UI test flow

### A. Static landing (baseline)

1. Confirm hero, stats row, “How it works”, “What you get”, and footer render.
2. Confirm the **preview row** shows the three **sample** cards (San Francisco, Sacramento, Oakland) and caption: “Sample comparison · $70k annual income · 1 Bedroom”.

### B. City search and chips

1. Click the city search field; type **Santa**.
2. Choose **Santa Ana** from the list — a chip should appear.
3. Add a second city (e.g. **Sacramento**).
4. Remove a chip with **×**; confirm the city returns to the pool and can be re-added.

### C. Income and bedrooms

1. Set **Annual income** to a value you care about (e.g. `80000`).
2. Change **Bedrooms** (e.g. `1` or `2`).

### D. Compare → live data

1. With at least one city selected, click **Compare**.
2. Button should show **Loading…** briefly; a message may appear: “Fetching live market snapshots for …”.
3. On success:
   - Preview cards should match **your selected cities** (names and data from the API).
   - Caption should read **Live comparison** with your income and bedroom count.
4. Change cities or income and click **Compare** again; data should refresh.

### E. Errors

1. Temporarily break `.env.local` (e.g. wrong API key) and restart `npm run dev`.
2. Click **Compare** — you should see a **red error** message in the preview area (not a silent failure).

### F. Edge cases

1. **No cities selected** — Compare stays disabled.
2. **Three cities** — select three, set income/bedrooms, Compare; three cards should fill when the backend supports all slugs.

## Notes

- City slugs must match **`data/cities.js`**: kebab-case from the display name only (e.g. Santa Ana → `santa-ana`, Chula Vista → `chula-vista`). The resolver uses `getCityBySlug`; unknown slugs fail.
- To support **every city** in the picker: ensure each name in `CitySelector` has a row in `data/cities.js` with the correct `slug`, `hudFips`, `hudCbsa`, and coordinates. Redeploy the AppSync Lambda after updating the dataset.

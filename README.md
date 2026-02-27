# transcript-formatter

React + TypeScript app for previewing and exporting TV transcripts to printable PDFs.

## Data layout (TBBT)

Transcript data is stored under:

- `public/data/tbbt/index.json`
- `public/data/tbbt/S{SS}/s{SS}e{EE}.json`

Examples:

- `public/data/tbbt/S01/s01e01.json`
- `public/data/tbbt/S10/s10e24.json`

`index.json` is the source of truth for episode file paths. Runtime always loads episodes via `episodes[].file` from index.

## Scripts

### npm scripts

- `npm run dev` — start Vite dev server.
- `npm run build` — run TypeScript project build and Vite production build.
- `npm run lint` — run ESLint.
- `npm run preview` — preview production bundle.
- `npm run scrape:index` — scrape and regenerate `public/data/tbbt/index.json`.
- `npm run scrape:episode` — scrape episode transcripts (supports `--season` and `--episode`).
- `npm run validate` — validate index/file integrity and transcript sanity checks.

### script files

- `scripts/scrape-tbbt.ts` — scraper and index generator.
- `scripts/parse-utils.ts` — paragraph classification and normalization helpers.
- `scripts/validate.ts` — dataset validation checks.

## Typical workflow

1. Regenerate index: `npm run scrape:index`
2. Scrape episodes: `npm run scrape:episode -- --season=1` (or full run without filters)
3. Validate data: `npm run validate`
4. Start app: `npm run dev`
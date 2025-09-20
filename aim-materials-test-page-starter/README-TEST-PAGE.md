# Aim Materials — Test Page Starter

Drop-in page + API to search across your ML dataset and Materials Project.

## Files
- `app/test/page.tsx` — front-end search UI (cards/table, filters, pagination)
- `app/api/search/route.ts` — server route that merges ML + MP results
- `lib/types.ts` — shared types
- `lib/search-ml.ts` — reads `data/ml_materials.json`
- `lib/search-mp.ts` — calls MP API (server-only)
- `data/ml_materials.json` — sample data (replace with your VAE+GNN outputs)
- `.env.local.example` — copy to `.env.local` and fill values

## Install
1. Copy these files into an existing Next.js 13/14 app (app router).
2. Create `.env.local` from `.env.local.example` and set `MP_API_KEY`.
3. Ensure your tsconfig has `baseUrl` + `paths` if you use `@/` imports.
   (This kit uses relative imports; if you prefer `@/lib`, adjust paths.)
4. `npm run dev` → open `/test`.

## Security
- Never expose `MP_API_KEY` on the client. Keep MP calls in `/api/search` only.
- Do NOT commit `.env.local`. Use `.gitignore`.

## Deploy
- **GitHub + Vercel** (recommended): push repo → “Import Project” on Vercel → add env vars.
- **StackBlitz/CodeSandbox**: good for quick shareable editor links (not for secrets).
- **GitHub Gist**: only if sharing 1–2 files. For multi-file apps, use a repo.

## Next steps
- Add sorting (band gap desc, density asc, etc.).
- Add more filters (spacegroup, crystal system, elastic moduli).
- Hook Postgres (Prisma) when your dataset grows.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack CEP (Conquis Especialidades Proyecto) application for browsing specialty categories with associated PDFs and images. It consists of a React frontend and an Express.js backend.

## Commands

### Frontend (from `frontend/` directory)
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build (port 23500)
```

### Backend (from `backend/` directory)
```bash
npm run dev      # Development with nodemon (NODE_ENV=development, port 3000)
npm start        # Production server (NODE_ENV=production, port 23510)
```

## Architecture

### Frontend (`frontend/`)
- **React 19** with **Vite 6** and ES modules
- **React Router v7** for routing:
  - `/cep` - main CEP listing
  - `/cep/:categorySlug` - category detail
  - `/cep/:categorySlug/:specialtySlug` - specialty detail
- **Tailwind CSS 4** for styling with Radix UI primitives (dialog, slot)
- **TanStack Query** available for data fetching
- Path alias: `@/` maps to `src/`
- UI components in `src/components/ui/` follow shadcn patterns

### Backend (`backend/`)
- **Express.js** with MVC pattern: routes → controllers → services
- **Dual-mode operation**:
  - **Local mode** (`CEP_MODE=local`): Serves files from `./files/cep/`
  - **Remote mode** (`CEP_MODE=remote`): Fetches manifest from CDN
- Data stored in `especialidades.json` (no database)

### API Endpoints
- `GET /api/cep` - list categories (supports `page`, `limit`, `q`/`search` params)
- `GET /api/cep/:categorySlug` - get category with items
- `GET /api/cep/:categorySlug/:specialtySlug` - get specific specialty
- `GET /api/areas` - specialty areas list
- `GET /api/integration` - integration data

Pagination: max 100 items per page, 1-indexed pages

## Environment Variables

### Frontend (`.env.development`, `.env.production`)
- `APP_API_URL` - Backend API base URL
- `APP_CDN_URL` - CDN for assets
- `APP_PORT` - Dev server port
- `APP_SHOW_CEP_WARNINGS` - Toggle warning display

### Backend (`.env.development`, `.env.production`)
- `PORT` - Server port
- `CEP_MODE` - `local` or `remote`
- `API_URL` - Self-reference for file URLs
- `CEP_MANIFEST_URL` - Remote manifest URL (remote mode)
- `CEP_FILES_BASE_URL` - Remote files base URL (remote mode)
- `CEP_CACHE_TTL_MS` - Cache timeout for remote mode
- `CEP_REMOTE_FALLBACK` - Fallback to `local` if remote fails

## Key Patterns

- Frontend uses `cn()` utility from `src/lib/utils.js` for Tailwind class merging
- Image paths auto-generated from PDF paths with normalization
- Search supports diacritical-insensitive text matching
- Scripts in `scripts/` for CEP thumbnail extraction and processing

# Conquis App — Backend NestJS

CEP (Conquis Especialidades Proyecto) API. Serves category and specialty data from MongoDB, with PDF/image files stored in MinIO (S3-compatible).

## Prerequisites

- Node.js >= 18
- MongoDB (Atlas or local)
- MinIO or S3-compatible storage

## Environment Variables

Copy `.env.example` and fill in production values:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/conquis` |
| `PORT` | No | Server port (default: 3000) | `3000` |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: `http://localhost:5173`) | `https://conquis.example.com` |
| `MINIO_ENDPOINT` | Seeds only | MinIO/S3 host | `minio.example.com` |
| `MINIO_PORT` | Seeds only | MinIO/S3 port (default: 9000) | `443` |
| `MINIO_USE_SSL` | Seeds only | Use HTTPS (default: false) | `true` |
| `MINIO_ACCESS_KEY` | Seeds only | MinIO/S3 access key | `myaccesskey` |
| `MINIO_SECRET_KEY` | Seeds only | MinIO/S3 secret key | `mysecretkey` |
| `MINIO_BUCKET` | Seeds only | Bucket name (default: `conquis-files`) | `conquis-files` |

> **Note:** MinIO variables are only needed for seed/upload scripts, not for the running server. The server reads data from MongoDB; the frontend fetches files directly from MinIO/CDN.

## Deploy Sequence

### 1. Install dependencies

```bash
npm install
```

### 2. Seed MongoDB (if not already done)

```bash
npm run seed:cep
```

This reads `../backend/files/cep/manifest.json` and inserts 9 categories + 477 specialties into MongoDB.

### 3. Upload files to MinIO (if not already done)

```bash
npm run upload:minio
```

Uploads all PDFs/images from `../backend/files/cep/` to the MinIO bucket with public-read policy.

### 4. Fix MinIO bucket policy (if objects return 403)

```bash
npm run fix:minio-policy
```

Standalone script that applies public-read policy without re-uploading files. Use this if the bucket was created before the policy fix was applied.

### 5. Build and start (without Docker)

```bash
npm run build
npm run start:prod
```

The server will listen on `PORT` (default 3000) and serve the CEP API.

## Docker Deploy (Production)

### Build the image

```bash
docker build -t conquis-backend-nestjs ./backend-nestjs
```

### Run the container

```bash
docker run -d \
  --name conquis-api \
  -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/conquis" \
  -e MINIO_PUBLIC_URL="https://s3.example.com" \
  -e CORS_ORIGIN="https://conquis.example.com" \
  -e PORT=3000 \
  conquis-backend-nestjs
```

### Runtime env vars

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/conquis_dev` | MongoDB connection string |
| `MINIO_PUBLIC_URL` | **Yes (prod)** | — | Public MinIO/S3 base URL (e.g. `https://s3.groowtech.com`) |
| `PORT` | No | `3000` | Server listen port |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `CEP_MODE` | No | `local` | `local` or `remote` (only matters without `MINIO_PUBLIC_URL`) |
| `CEP_FILES_BASE_URL` | No | — | Fallback files URL if `MINIO_PUBLIC_URL` is not set |
| `CDN_URL` | No | — | Second fallback files URL |
| `API_URL` | No | — | Self-reference URL for local mode |

> **Tip:** In production with MinIO/S3 already populated, you only need `MONGODB_URI`, `MINIO_PUBLIC_URL`, and `CORS_ORIGIN`. The server doesn't connect to MinIO directly — it just tells the frontend where to fetch files from.

### Health check

```bash
curl http://localhost:3000/api/cep
```

Should return the categories list from MongoDB.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/cep` | List categories (supports `page`, `limit`, `q`/`search`) |
| `GET` | `/api/cep/:categorySlug` | Get category with specialties |
| `GET` | `/api/cep/:categorySlug/:specialtySlug` | Get specific specialty |

## Scripts Reference

| Script | Description |
|---|---|
| `npm run start:dev` | Development with watch mode |
| `npm run start:prod` | Production (requires build first) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run seed:cep` | Seed MongoDB from manifest.json |
| `npm run upload:minio` | Upload CEP files to MinIO + apply policy |
| `npm run fix:minio-policy` | Apply public-read policy to MinIO bucket |
| `npm run lint` | ESLint check + fix |

## Legacy Modules (Not in Use)

The following directories exist from a prior TypeORM/PostgreSQL migration attempt and are **not loaded** by the current `AppModule`:

- `src/modules/ai-assistant/` — pgvector embeddings (TypeORM)
- `src/modules/areas/` — specialty areas (TypeORM)
- `src/modules/integration/` — integration links (TypeORM)
- `src/modules/cep/entities/` — TypeORM entity files (replaced by `schemas/`)
- `src/seeds/seed.ts` — TypeORM-based seeder (replaced by `seed-cep.ts`)
- `check-db.ts` — PostgreSQL connection checker

These can be safely removed once the migration is finalized. They are not imported by any active module.

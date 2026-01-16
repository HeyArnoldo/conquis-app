# CEP API modes

This backend can serve CEP data in two ways:

1) Local mode (manifest + PDFs stored on the same server)
2) Remote mode (manifest + PDFs on a CDN or external host)

## Local mode

Env:
- CEP_MODE=local
- API_URL=http://localhost:3000

Behavior:
- Manifest is read from backend/files/cep/manifest.json
- PDFs are served by Express at /files/cep
- filesBaseUrl returned by the API is API_URL + /files/cep (or /files/cep if API_URL is empty)

## Remote mode

Env:
- CEP_MODE=remote
- CEP_MANIFEST_URL=https://your-cdn/cep/manifest.json
- CEP_FILES_BASE_URL=https://your-cdn/cep

Optional:
- CEP_CACHE_TTL_MS=60000
- CEP_REMOTE_FALLBACK=local

Behavior:
- Manifest is fetched from CEP_MANIFEST_URL
- PDFs are served from CEP_FILES_BASE_URL
- If CEP_REMOTE_FALLBACK=local, a remote failure will fall back to the local manifest

## API endpoints

- GET /api/cep
- GET /api/cep/:categorySlug
- GET /api/cep/:categorySlug/:specialtySlug

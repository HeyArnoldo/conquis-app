// src/services/cepService.js
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.join(__dirname, '../../files/cep/manifest.json');

const mode = () => (process.env.CEP_MODE || 'local').toLowerCase();
const remoteManifestUrl = () => process.env.CEP_MANIFEST_URL || '';
const remoteFallback = () => (process.env.CEP_REMOTE_FALLBACK || '').toLowerCase() === 'local';
const cacheTtlMs = () => Number(process.env.CEP_CACHE_TTL_MS || 60000);

let cachedManifest = null;
let cachedMtimeMs = 0;
let cachedAt = 0;

async function readLocalManifest() {
  try {
    const stats = await fs.promises.stat(manifestPath);
    if (!cachedManifest || stats.mtimeMs !== cachedMtimeMs) {
      const data = await fs.promises.readFile(manifestPath, 'utf8');
      cachedManifest = JSON.parse(data);
      cachedMtimeMs = stats.mtimeMs;
    }
    return cachedManifest;
  } catch (error) {
    console.error('Error leyendo el manifest CEP local:', error);
    return null;
  }
}

async function readRemoteManifest() {
  const ttl = cacheTtlMs();
  const now = Date.now();
  if (cachedManifest && now - cachedAt < ttl) {
    return cachedManifest;
  }

  const url = remoteManifestUrl();
  if (!url) {
    console.error('CEP_MANIFEST_URL no está configurada.');
    return null;
  }

  try {
    const data = await getJson(url);
    cachedManifest = data;
    cachedAt = now;
    return cachedManifest;
  } catch (error) {
    console.error('Error leyendo el manifest CEP remoto:', error);
    if (remoteFallback()) {
      return readLocalManifest();
    }
    return null;
  }
}

async function readManifest() {
  if (mode() === 'remote') {
    return readRemoteManifest();
  }
  return readLocalManifest();
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    const request = client.get(url, response => {
      if (response.statusCode && response.statusCode >= 400) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy(new Error('Timeout'));
    });
  });
}

export async function getCepManifest() {
  return readManifest();
}

export async function getCepCategoryBySlug(categorySlug) {
  const manifest = await readManifest();
  if (!manifest || !Array.isArray(manifest.categorias)) return null;
  return manifest.categorias.find(category => category.slug === categorySlug) || null;
}

export async function getCepSpecialtyBySlugs(categorySlug, specialtySlug) {
  const category = await getCepCategoryBySlug(categorySlug);
  if (!category || !Array.isArray(category.items)) return null;
  return category.items.find(item => item.slug === specialtySlug) || null;
}

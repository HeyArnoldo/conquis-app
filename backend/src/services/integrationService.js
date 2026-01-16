import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cepManifestPath = path.join(__dirname, '../../files/cep/manifest.json');
const areasPath = path.join(__dirname, '../../especialidades.json');
const linksPath = path.join(__dirname, '../../files/integration/links.json');

const defaultLinks = () => ({ updatedAt: new Date().toISOString(), links: [] });

const cepMode = () => (process.env.CEP_MODE || 'local').toLowerCase();
const areasMode = () => (process.env.AREAS_MODE || 'local').toLowerCase();

const cepFilesBaseUrl = () => {
  if (cepMode() === 'remote') {
    return process.env.CEP_FILES_BASE_URL || process.env.CDN_URL || '';
  }
  const apiUrl = process.env.API_URL || '';
  return apiUrl ? `${apiUrl}/files/cep` : '/files/cep';
};

const areasFilesBaseUrl = () => {
  if (areasMode() === 'remote') {
    return process.env.AREAS_FILES_BASE_URL || process.env.CDN_URL || '';
  }
  const apiUrl = process.env.API_URL || '';
  return apiUrl ? `${apiUrl}/files/especialidades` : '/files/especialidades';
};

async function readJsonFile(filePath, fallback) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

async function writeJsonFile(filePath, payload) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(/\s+/g) : [];
}

function tokenScore(aTokens, bTokens) {
  if (aTokens.length === 0 || bTokens.length === 0) return 0;
  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  let matches = 0;
  aSet.forEach(token => {
    if (bSet.has(token)) matches += 1;
  });
  return matches / Math.max(aSet.size, bSet.size);
}

function scoreMatch(cepItem, specialty) {
  if (cepItem.slug && specialty.slug && cepItem.slug === specialty.slug) {
    return 0.98;
  }

  const cepName = normalizeText(cepItem.nombre);
  const specName = normalizeText(specialty.name);
  if (cepName && specName && cepName === specName) {
    return 0.92;
  }

  const cepTokens = tokenize(cepItem.nombre);
  const specTokens = tokenize(specialty.name);
  const nameScore = tokenScore(cepTokens, specTokens);

  const cepSlugTokens = tokenize(cepItem.slug);
  const specSlugTokens = tokenize(specialty.slug);
  const slugScore = tokenScore(cepSlugTokens, specSlugTokens);

  return Math.max(nameScore, slugScore);
}

function buildCepItems(manifest) {
  if (!manifest || !Array.isArray(manifest.categorias)) return [];
  const baseUrl = cepFilesBaseUrl();

  return manifest.categorias.flatMap(category => {
    const categorySlug = category.slug;
    const categoryName = category.nombre_categoria;
    const items = Array.isArray(category.items) ? category.items : [];
    return items.map(item => ({
      id: `cep:${item.codigo}`,
      codigo: item.codigo,
      nombre: item.nombre,
      slug: item.slug,
      pdf: item.pdf,
      filesBaseUrl: baseUrl,
      category: {
        slug: categorySlug,
        name: categoryName
      }
    }));
  });
}

function buildSpecialties(areas) {
  if (!Array.isArray(areas)) return [];
  const baseUrl = areasFilesBaseUrl();

  return areas.flatMap(area => {
    const areaSlug = area.slug;
    const areaName = area.name;
    const items = Array.isArray(area.items) ? area.items : [];
    return items.map(item => ({
      id: `esp:${areaSlug}:${item.slug}`,
      name: item.name,
      slug: item.slug,
      areaSlug,
      areaName,
      img: item.img,
      pdf: item.pdf,
      filesBaseUrl: baseUrl
    }));
  });
}

export async function getIntegrationLinks() {
  const data = await readJsonFile(linksPath, defaultLinks());
  if (!data.links || !Array.isArray(data.links)) {
    return defaultLinks();
  }
  return data;
}

export async function upsertIntegrationLink({ cepId, specialtyId, status, source, note }) {
  const data = await getIntegrationLinks();
  const now = new Date().toISOString();
  const normalizedCepId = String(cepId || '').trim();
  if (!normalizedCepId) {
    throw new Error('cepId requerido');
  }

  const payload = {
    cepId: normalizedCepId,
    specialtyId: specialtyId || null,
    status: status || 'confirmed',
    source: source || 'manual',
    note: note || null,
    updatedAt: now
  };

  const existingIndex = data.links.findIndex(link => link.cepId === normalizedCepId);
  if (existingIndex >= 0) {
    data.links[existingIndex] = { ...data.links[existingIndex], ...payload };
  } else {
    data.links.push(payload);
  }

  data.updatedAt = now;
  await writeJsonFile(linksPath, data);
  return payload;
}

export async function getIntegrationSuggestions({
  search = '',
  minScore = 0.6,
  page = 1,
  limit = 20
} = {}) {
  const [manifest, areas, linksData] = await Promise.all([
    readJsonFile(cepManifestPath, null),
    readJsonFile(areasPath, []),
    getIntegrationLinks()
  ]);

  const cepItems = buildCepItems(manifest);
  const specialties = buildSpecialties(areas);
  const linkMap = new Map(
    linksData.links.map(link => [link.cepId, link])
  );

  const normalizedSearch = normalizeText(search);
  const filteredCep = normalizedSearch
    ? cepItems.filter(item => {
        const name = normalizeText(item.nombre);
        const code = normalizeText(item.codigo);
        return name.includes(normalizedSearch) || code.includes(normalizedSearch);
      })
    : cepItems;

  const pendingCep = filteredCep.filter(item => !linkMap.has(item.id));
  const total = pendingCep.length;
  const startIndex = (page - 1) * limit;
  const slice = pendingCep.slice(startIndex, startIndex + limit);

  const items = slice.map(cepItem => {
    const scored = specialties
      .map(spec => ({
        score: scoreMatch(cepItem, spec),
        specialty: spec
      }))
      .filter(candidate => candidate.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      cep: cepItem,
      candidates: scored
    };
  });

  return {
    page,
    limit,
    total,
    hasMore: startIndex + limit < total,
    items
  };
}

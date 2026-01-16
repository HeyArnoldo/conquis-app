const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const cepManifestPath = path.join(rootDir, 'backend/files/cep/manifest.json');
const areasPath = path.join(rootDir, 'backend/especialidades.json');
const outputPath = path.join(rootDir, 'backend/files/integration/suggestions.json');

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const tokenize = (value) => {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(/\s+/g) : [];
};

const tokenScore = (aTokens, bTokens) => {
  if (!aTokens.length || !bTokens.length) return 0;
  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  let matches = 0;
  aSet.forEach(token => {
    if (bSet.has(token)) matches += 1;
  });
  return matches / Math.max(aSet.size, bSet.size);
};

const scoreMatch = (cepItem, specialty) => {
  if (cepItem.slug && specialty.slug && cepItem.slug === specialty.slug) {
    return 0.98;
  }

  const cepName = normalizeText(cepItem.nombre);
  const specName = normalizeText(specialty.name);
  if (cepName && specName && cepName === specName) {
    return 0.92;
  }

  const nameScore = tokenScore(tokenize(cepItem.nombre), tokenize(specialty.name));
  const slugScore = tokenScore(tokenize(cepItem.slug), tokenize(specialty.slug));
  return Math.max(nameScore, slugScore);
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const buildCepItems = (manifest) => {
  if (!manifest || !Array.isArray(manifest.categorias)) return [];
  return manifest.categorias.flatMap(category => {
    const items = Array.isArray(category.items) ? category.items : [];
    return items.map(item => ({
      id: `cep:${item.codigo}`,
      codigo: item.codigo,
      nombre: item.nombre,
      slug: item.slug,
      category: {
        slug: category.slug,
        name: category.nombre_categoria
      }
    }));
  });
};

const buildSpecialties = (areas) => {
  if (!Array.isArray(areas)) return [];
  return areas.flatMap(area => {
    const items = Array.isArray(area.items) ? area.items : [];
    return items.map(item => ({
      id: `esp:${area.slug}:${item.slug}`,
      name: item.name,
      slug: item.slug,
      areaSlug: area.slug,
      areaName: area.name
    }));
  });
};

const main = () => {
  const manifest = readJson(cepManifestPath);
  const areas = readJson(areasPath);
  const cepItems = buildCepItems(manifest);
  const specialties = buildSpecialties(areas);

  const suggestions = cepItems.map(cepItem => {
    const candidates = specialties
      .map(spec => ({
        score: scoreMatch(cepItem, spec),
        specialty: spec
      }))
      .filter(candidate => candidate.score >= 0.6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { cep: cepItem, candidates };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    total: suggestions.length,
    items: suggestions
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Sugerencias guardadas en ${outputPath}`);
};

main();

// src/services/areasService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const areasPath = path.join(__dirname, '../../especialidades.json');
let cachedAreas = null;
let cachedMtimeMs = 0;

function readAreasFile() {
  try {
    const stats = fs.statSync(areasPath);
    if (!cachedAreas || stats.mtimeMs !== cachedMtimeMs) {
      const data = fs.readFileSync(areasPath, 'utf8');
      cachedAreas = JSON.parse(data);
      cachedMtimeMs = stats.mtimeMs;
    }
    return cachedAreas;
  } catch (error) {
    console.error('Error leyendo el archivo de areas:', error);
    return [];
  }
}

export function getAllAreas() {
  return readAreasFile();
}

export function getAreaBySlug(slug) {
  const areas = readAreasFile();
  return areas.find(area => area.slug === slug);
}

export function getSpecialtyBySlugs(areaSlug, specialtySlug) {
  const areas = readAreasFile();
  const area = areas.find(a => a.slug === areaSlug);
  if (!area) return null;
  const items = Array.isArray(area.items) ? area.items : [];
  const specialty = items.find(item => item.slug === specialtySlug);
  return specialty || null;
}

// NUEVO: Funcion para obtener todas las especialidades de todas las areas
export function getAllSpecialties() {
  const areas = readAreasFile();
  let specialties = [];
  areas.forEach(area => {
    if (area.items && Array.isArray(area.items)) {
      // Se agrega el campo "areaSlug" a cada especialidad
      const enrichedSpecialties = area.items.map(item => ({
        ...item,
        area: area.name,
        areaSlug: area.slug
      }));
      specialties = specialties.concat(enrichedSpecialties);
    }
  });
  return specialties;
}

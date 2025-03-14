// src/services/areasService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const areasPath = path.join(__dirname, '../../especialidades.json');

function readAreasFile() {
  try {
    const data = fs.readFileSync(areasPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo el archivo de áreas:', error);
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
  const specialty = area.items.find(item => item.slug === specialtySlug);
  return specialty || null;
}

// NUEVO: Función para obtener todas las especialidades de todas las áreas
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

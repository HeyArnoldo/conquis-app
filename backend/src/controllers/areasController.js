// src/controllers/areasController.js
import {
  getAllAreas as getAll,
  getAreaBySlug as getBySlug,
  getSpecialtyBySlugs as getSpecialty,
  getAllSpecialties
} from '../services/areasService.js';

const mode = () => (process.env.AREAS_MODE || 'local').toLowerCase();

const filesBaseUrl = () => {
  if (mode() === 'remote') {
    return process.env.AREAS_FILES_BASE_URL || process.env.CDN_URL || '';
  }
  const apiUrl = process.env.API_URL || '';
  return apiUrl ? `${apiUrl}/files/especialidades` : '/files/especialidades';
};

// GET /api/areas
export const getAllAreas = (req, res) => {
  try {
    const areas = getAll();
    const baseUrl = filesBaseUrl();
    const summary = areas.map(area => ({
      area: area.name,
      slug: area.slug,
      img: area.img,
      specialties: Array.isArray(area.items) ? area.items.length : 0,
      filesBaseUrl: baseUrl
    }));
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/areas/:areaSlug
export const getAreaBySlug = (req, res) => {
  try {
    const { areaSlug } = req.params;
    const area = getBySlug(areaSlug);
    if (!area) {
      return res.status(404).json({ message: 'Area no encontrada' });
    }
    res.json({
      ...area,
      filesBaseUrl: filesBaseUrl()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/areas/:areaSlug/:specialtySlug
export const getSpecialtyBySlug = (req, res) => {
  try {
    const { areaSlug, specialtySlug } = req.params;
    const specialty = getSpecialty(areaSlug, specialtySlug);
    if (!specialty) {
      return res.status(404).json({ message: 'Especialidad no encontrada' });
    }
    res.json({
      ...specialty,
      filesBaseUrl: filesBaseUrl()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/areas/specialties?limit=&page=&search=
export const getAllSpecialtiesPaginated = (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);

    page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 100);

    const specialties = getAllSpecialties();
    const normalizedSearch = String(search || '').trim().toLowerCase();

    let filteredSpecialties = specialties;
    if (normalizedSearch) {
      filteredSpecialties = specialties.filter(specialty => {
        const name = String(specialty.name || '').toLowerCase();
        const area = String(specialty.area || '').toLowerCase();
        const slug = String(specialty.slug || '').toLowerCase();

        return (
          name.includes(normalizedSearch) ||
          area.includes(normalizedSearch) ||
          slug.includes(normalizedSearch)
        );
      });
    }

    const total = filteredSpecialties.length;
    const startIndex = (page - 1) * limit;
    const baseUrl = filesBaseUrl();
    const paginatedSpecialties = filteredSpecialties
      .slice(startIndex, startIndex + limit)
      .map(item => ({
        ...item,
        filesBaseUrl: baseUrl
      }));

    res.json({
      page,
      limit,
      total,
      hasMore: startIndex + limit < total,
      specialties: paginatedSpecialties
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

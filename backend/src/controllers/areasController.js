// src/controllers/areasController.js
import {
  getAllAreas as getAll,
  getAreaBySlug as getBySlug,
  getSpecialtyBySlugs as getSpecialty,
  getAllSpecialties
} from '../services/areasService.js';

// GET /api/areas
export const getAllAreas = (req, res) => {
  try {
    const areas = getAll();
    const summary = areas.map(area => ({
      area: area.name,
      slug: area.slug,
      img: area.img,
      specialties: area.items.length
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
      return res.status(404).json({ message: 'Área no encontrada' });
    }
    res.json(area);
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
    res.json(specialty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NUEVO: GET /api/areas/specialties?limit=&page=
// Ruta para obtener TODAS las especialidades de todas las áreas con paginación
export const getAllSpecialtiesPaginated = (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const specialties = getAllSpecialties();

    // Si se proporciona un término de búsqueda, filtramos las especialidades
    let filteredSpecialties = specialties;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSpecialties = specialties.filter(specialty =>
        specialty.name.toLowerCase().includes(searchLower) ||
        specialty.area.toLowerCase().includes(searchLower) ||
        specialty.slug.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredSpecialties.length;
    const startIndex = (page - 1) * limit;
    const paginatedSpecialties = filteredSpecialties.slice(startIndex, startIndex + limit);

    res.json({
      page,
      limit,
      total,
      specialties: paginatedSpecialties
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


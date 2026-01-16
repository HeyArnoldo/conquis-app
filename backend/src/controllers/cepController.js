// src/controllers/cepController.js
import {
  getCepManifest as getManifest,
  getCepCategoryBySlug as getCategory,
  getCepSpecialtyBySlugs as getSpecialty
} from '../services/cepService.js';

const mode = () => (process.env.CEP_MODE || 'local').toLowerCase();

const filesBaseUrl = () => {
  if (mode() === 'remote') {
    return process.env.CEP_FILES_BASE_URL || process.env.CDN_URL || '';
  }
  const apiUrl = process.env.API_URL || '';
  return apiUrl ? `${apiUrl}/files/cep` : '/files/cep';
};

const buildImagePath = (pdfPath = '') => {
  if (!pdfPath) return '';
  return pdfPath.replace(/\.pdf$/i, '.png');
};

const buildCategoryImagePath = (categorySlug = '') => {
  if (!categorySlug) return '';
  return `${categorySlug}/${categorySlug}.png`;
};

const withCategoryImage = (category) => {
  if (!category || typeof category !== 'object') return category;
  if (category.img) return category;
  if (!category.slug) return category;
  return {
    ...category,
    img: buildCategoryImagePath(category.slug)
  };
};

const withImages = (item) => {
  if (!item || typeof item !== 'object') return item;
  if (item.img) return item;
  if (!item.pdf) return item;
  return {
    ...item,
    img: buildImagePath(item.pdf)
  };
};

const withImagesForCategory = (category) => {
  if (!category || typeof category !== 'object') return category;
  const items = Array.isArray(category.items)
    ? category.items.map(withImages)
    : category.items;
  return {
    ...withCategoryImage(category),
    items
  };
};

const withImagesForManifest = (manifest) => {
  if (!manifest || typeof manifest !== 'object') return manifest;
  const categorias = Array.isArray(manifest.categorias)
    ? manifest.categorias.map(withImagesForCategory)
    : manifest.categorias;
  return {
    ...manifest,
    categorias
  };
};

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 12;

const parsePagination = (req) => {
  const pageParam = Number.parseInt(req.query.page, 10);
  const limitParam = Number.parseInt(req.query.limit, 10);

  if (!Number.isFinite(pageParam) && !Number.isFinite(limitParam)) {
    return null;
  }

  const limit = Number.isFinite(limitParam) && limitParam > 0
    ? Math.min(limitParam, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  return { page, limit };
};

const paginateItems = (items, { page, limit }) => {
  const total = items.length;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);

  return {
    slice,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: totalPages ? page < totalPages : false,
      hasPrevPage: totalPages ? page > 1 : false
    }
  };
};

const normalizeText = (value = '') => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const getSearchTerm = (req) => normalizeText(req.query.q || req.query.search || '');

const buildSearchItems = (manifest) => {
  if (!manifest || !Array.isArray(manifest.categorias)) return [];
  return manifest.categorias.flatMap(category => {
    const items = Array.isArray(category.items) ? category.items : [];
    return items.map(item => ({
      ...item,
      categorySlug: category.slug,
      categoryName: category.nombre_categoria,
      categoryCode: category.codigo_categoria
    }));
  });
};

const matchesSearch = (item, searchTerm, includeCategory) => {
  const name = normalizeText(item.nombre);
  const code = normalizeText(item.codigo);
  if (name.includes(searchTerm) || code.includes(searchTerm)) return true;
  if (!includeCategory) return false;
  const categoryName = normalizeText(item.categoryName);
  const categoryCode = normalizeText(item.categoryCode);
  return categoryName.includes(searchTerm) || categoryCode.includes(searchTerm);
};

// GET /api/cep
export const getCepManifest = async (req, res) => {
  try {
    const manifest = await getManifest();
    if (!manifest) {
      return res.status(404).json({ message: 'Manifest CEP no encontrado' });
    }
    const manifestWithImages = withImagesForManifest(manifest);
    const searchTerm = getSearchTerm(req);
    const pagination = parsePagination(req) || (searchTerm ? { page: 1, limit: DEFAULT_PAGE_SIZE } : null);

    if (searchTerm) {
      const items = buildSearchItems(manifestWithImages);
      const filtered = items.filter(item => matchesSearch(item, searchTerm, true));
      const { slice, pagination: meta } = paginateItems(filtered, pagination);
      return res.json({
        items: slice,
        filesBaseUrl: filesBaseUrl(),
        pagination: meta
      });
    }

    if (pagination && Array.isArray(manifestWithImages.categorias)) {
      const { slice, pagination: meta } = paginateItems(
        manifestWithImages.categorias,
        pagination
      );
      return res.json({
        ...manifestWithImages,
        categorias: slice,
        filesBaseUrl: filesBaseUrl(),
        pagination: meta
      });
    }

    return res.json({
      ...manifestWithImages,
      filesBaseUrl: filesBaseUrl()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/cep/:categorySlug
export const getCepCategoryBySlug = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = await getCategory(categorySlug);
    if (!category) {
      return res.status(404).json({ message: 'Categoria CEP no encontrada' });
    }
    const categoryWithImages = withImagesForCategory(category);
    const searchTerm = getSearchTerm(req);
    const pagination = parsePagination(req) || (searchTerm ? { page: 1, limit: DEFAULT_PAGE_SIZE } : null);
    const items = Array.isArray(categoryWithImages.items) ? categoryWithImages.items : [];
    const filteredItems = searchTerm
      ? items.filter(item => matchesSearch(item, searchTerm, false))
      : items;

    if (pagination) {
      const { slice, pagination: meta } = paginateItems(
        filteredItems,
        pagination
      );
      return res.json({
        ...categoryWithImages,
        items: slice,
        filesBaseUrl: filesBaseUrl(),
        pagination: meta
      });
    }

    return res.json({
      ...categoryWithImages,
      filesBaseUrl: filesBaseUrl()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/cep/:categorySlug/:specialtySlug
export const getCepSpecialtyBySlug = async (req, res) => {
  try {
    const { categorySlug, specialtySlug } = req.params;
    const specialty = await getSpecialty(categorySlug, specialtySlug);
    if (!specialty) {
      return res.status(404).json({ message: 'Especialidad CEP no encontrada' });
    }
    res.json({
      ...withImages(specialty),
      filesBaseUrl: filesBaseUrl()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

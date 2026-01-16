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

// GET /api/cep
export const getCepManifest = async (req, res) => {
  try {
    const manifest = await getManifest();
    if (!manifest) {
      return res.status(404).json({ message: 'Manifest CEP no encontrado' });
    }
    res.json({
      ...withImagesForManifest(manifest),
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
    res.json({
      ...withImagesForCategory(category),
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

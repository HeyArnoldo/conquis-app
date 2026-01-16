import {
  getIntegrationSuggestions,
  getIntegrationLinks,
  upsertIntegrationLink
} from '../services/integrationService.js';

export const getPendingSuggestions = async (req, res) => {
  try {
    const { search = '', minScore = 0.6, page = 1, limit = 20 } = req.query;
    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);
    const parsedScore = Number.parseFloat(minScore);

    const data = await getIntegrationSuggestions({
      search,
      minScore: Number.isNaN(parsedScore) ? 0.6 : parsedScore,
      page: Number.isNaN(parsedPage) ? 1 : parsedPage,
      limit: Number.isNaN(parsedLimit) ? 20 : Math.min(parsedLimit, 100)
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLinks = async (req, res) => {
  try {
    const data = await getIntegrationLinks();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const upsertLink = async (req, res) => {
  try {
    const { cepId, specialtyId, status, source, note } = req.body || {};
    if (!cepId) {
      return res.status(400).json({ message: 'cepId requerido' });
    }
    const link = await upsertIntegrationLink({
      cepId,
      specialtyId,
      status,
      source,
      note
    });
    res.json({ ok: true, link });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

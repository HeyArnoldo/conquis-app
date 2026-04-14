import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationLink } from './entities/integration-link.entity.js';
import { CepService } from '../cep/cep.service.js';
import { AreasService } from '../areas/areas.service.js';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectRepository(IntegrationLink)
    private linkRepository: Repository<IntegrationLink>,
    private readonly cepService: CepService,
    private readonly areasService: AreasService,
  ) {}

  async getIntegrationLinks() {
    const links = await this.linkRepository.find();
    return {
      updatedAt: new Date().toISOString(),
      links: links.map((l) => ({
        ...l,
        // Match legacy format if needed
      })),
    };
  }

  async upsertIntegrationLink(dto: {
    cepId: string;
    specialtyId?: string;
    status?: string;
    source?: string;
    note?: string;
  }) {
    if (!dto.cepId) {
      throw new BadRequestException('cepId requerido');
    }
    const normalizedCepId = dto.cepId.trim();
    if (!normalizedCepId) {
      throw new BadRequestException('cepId requerido');
    }

    let link = await this.linkRepository.findOne({
      where: { cepId: normalizedCepId },
    });
    if (!link) {
      link = this.linkRepository.create({
        cepId: normalizedCepId,
      });
    }

    if (dto.specialtyId !== undefined) link.specialtyId = dto.specialtyId;
    if (dto.status) link.status = dto.status;
    if (dto.source) link.source = dto.source;
    if (dto.note !== undefined) link.note = dto.note;

    return this.linkRepository.save(link);
  }

  async getIntegrationSuggestions({
    search = '',
    minScore = 0.6,
    page = 1,
    limit = 20,
  }) {
    const cepItems = await this.cepService.findAllSpecialtiesFlat();
    const areasItems = await this.areasService.findAllSpecialtiesFlat();
    const existingLinks = await this.linkRepository.find();
    const linkedCepIds = new Set(existingLinks.map((l) => l.cepId));

    // Normalize items for matching
    const normalizedCep = cepItems.map((item) => ({
      id: `cep:${item.code}`,
      codigo: item.code,
      nombre: item.name,
      slug: item.slug,
      original: item,
    }));

    const normalizedAreas = areasItems.map((item) => ({
      id: `esp:${item.area?.slug}:${item.slug}`,
      name: item.name,
      slug: item.slug,
      areaSlug: item.area?.slug,
      areaName: item.area?.name,
      original: item,
    }));

    // Filter CEP items not already linked
    let pendingCep = normalizedCep.filter((item) => !linkedCepIds.has(item.id));

    // Search filter
    const normalizedSearch = this.normalizeText(search);
    if (normalizedSearch) {
      pendingCep = pendingCep.filter((item) => {
        const name = this.normalizeText(item.nombre);
        const code = this.normalizeText(item.codigo);
        return (
          name.includes(normalizedSearch) || code.includes(normalizedSearch)
        );
      });
    }

    const total = pendingCep.length;
    const startIndex = (page - 1) * limit;
    const slice = pendingCep.slice(startIndex, startIndex + limit);

    const items = slice.map((cepItem) => {
      const scored = normalizedAreas
        .map((spec) => ({
          score: this.scoreMatch(cepItem, spec),
          specialty: spec,
        }))
        .filter((candidate) => candidate.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return {
        cep: {
          ...cepItem,
          category: cepItem.original.category
            ? {
                slug: cepItem.original.category.slug,
                name: cepItem.original.category.name,
              }
            : null,
        },
        candidates: scored,
      };
    });

    return {
      page,
      limit,
      total,
      hasMore: startIndex + limit < total,
      items,
    };
  }

  // --- Helpers ---

  private normalizeText(value: string) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private tokenize(value: string) {
    const normalized = this.normalizeText(value);
    return normalized ? normalized.split(/\s+/g) : [];
  }

  private tokenScore(aTokens: string[], bTokens: string[]) {
    if (aTokens.length === 0 || bTokens.length === 0) return 0;
    const aSet = new Set(aTokens);
    const bSet = new Set(bTokens);
    let matches = 0;
    aSet.forEach((token) => {
      if (bSet.has(token)) matches += 1;
    });
    return matches / Math.max(aSet.size, bSet.size);
  }

  private scoreMatch(cepItem: any, specialty: any) {
    if (cepItem.slug && specialty.slug && cepItem.slug === specialty.slug) {
      return 0.98;
    }

    const cepName = this.normalizeText(cepItem.nombre);
    const specName = this.normalizeText(specialty.name);
    if (cepName && specName && cepName === specName) {
      return 0.92;
    }

    const cepTokens = this.tokenize(cepItem.nombre);
    const specTokens = this.tokenize(specialty.name);
    const nameScore = this.tokenScore(cepTokens, specTokens);

    const cepSlugTokens = this.tokenize(cepItem.slug);
    const specSlugTokens = this.tokenize(specialty.slug);
    const slugScore = this.tokenScore(cepSlugTokens, specSlugTokens);

    return Math.max(nameScore, slugScore);
  }
}

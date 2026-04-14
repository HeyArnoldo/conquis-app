import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CepService } from './cep.service.js';
import {
  CepCategoryWithItems,
  CepSpecialtyDoc,
  CepSpecialtyWithCategory,
} from './interfaces/cep.interfaces.js';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface LegacyCategory {
  codigo_categoria: string;
  nombre_categoria: string;
  slug: string;
  pdf_origen: string | undefined;
  items: LegacySpecialty[];
  img: string;
}

interface LegacySpecialty {
  codigo: string;
  nombre: string;
  pag_inicio: number | undefined;
  pag_fin: number | undefined;
  slug: string;
  pdf: string | undefined;
  img: string;
  categorySlug?: string;
  categoryName?: string;
  categoryCode?: string;
}

@Controller('api/cep')
export class CepController {
  constructor(
    private readonly cepService: CepService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getManifest(@Query() query: Record<string, string>) {
    const searchTerm = this.getSearchTerm(query);
    const pagination =
      this.parsePagination(query) ||
      (searchTerm ? { page: 1, limit: 12 } : null);

    if (searchTerm) {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 12;

      const { items, total } = await this.cepService.searchSpecialties(
        searchTerm,
        page,
        limit,
      );
      const mappedItems = items.map((item) =>
        this.mapSpecialtyToLegacy(item, true),
      );
      const meta = this.createPaginationMeta(total, page, limit);

      return {
        items: mappedItems,
        filesBaseUrl: this.getFilesBaseUrl(),
        pagination: meta,
      };
    }

    // Default: List categories
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 100;

    const { items, total } = await this.cepService.findAllCategories(
      page,
      limit,
    );
    const mappedCategories = items.map((cat) => this.mapCategoryToLegacy(cat));

    if (pagination) {
      const meta = this.createPaginationMeta(total, page, limit);
      return {
        categorias: mappedCategories,
        filesBaseUrl: this.getFilesBaseUrl(),
        pagination: meta,
      };
    }

    return {
      categorias: mappedCategories,
      filesBaseUrl: this.getFilesBaseUrl(),
    };
  }

  @Get(':categorySlug')
  async getCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() query: Record<string, string>,
  ) {
    const category = await this.cepService.findCategoryBySlug(categorySlug);
    if (!category) {
      throw new NotFoundException('Categoria CEP no encontrada');
    }

    const searchTerm = this.getSearchTerm(query);
    const pagination =
      this.parsePagination(query) ||
      (searchTerm ? { page: 1, limit: 12 } : null);

    let specialties: CepSpecialtyDoc[] = category.specialties || [];

    if (searchTerm) {
      specialties = specialties.filter(
        (item) =>
          this.normalizeText(item.name).includes(searchTerm) ||
          this.normalizeText(item.code).includes(searchTerm),
      );
    }

    const mappedItems = specialties.map((item) =>
      this.mapSpecialtyToLegacy(item),
    );
    const mappedCategory = this.mapCategoryToLegacy(category);
    mappedCategory.items = mappedItems;

    if (pagination) {
      const total = mappedItems.length;
      const start = (pagination.page - 1) * pagination.limit;
      const slice = mappedItems.slice(start, start + pagination.limit);
      const meta = this.createPaginationMeta(
        total,
        pagination.page,
        pagination.limit,
      );

      return {
        ...mappedCategory,
        items: slice,
        filesBaseUrl: this.getFilesBaseUrl(),
        pagination: meta,
      };
    }

    return {
      ...mappedCategory,
      filesBaseUrl: this.getFilesBaseUrl(),
    };
  }

  @Get(':categorySlug/:specialtySlug')
  async getSpecialty(
    @Param('categorySlug') categorySlug: string,
    @Param('specialtySlug') specialtySlug: string,
  ) {
    const specialty = await this.cepService.findSpecialtyBySlug(
      categorySlug,
      specialtySlug,
    );
    if (!specialty) {
      throw new NotFoundException('Especialidad CEP no encontrada');
    }

    return {
      ...this.mapSpecialtyToLegacy(specialty, true),
      filesBaseUrl: this.getFilesBaseUrl(),
    };
  }

  // --- Helpers ---

  private getFilesBaseUrl(): string {
    const minioPublicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');
    if (minioPublicUrl) {
      return `${minioPublicUrl}/conquis-files/cep`;
    }

    const mode = (
      this.configService.get<string>('CEP_MODE') || 'local'
    ).toLowerCase();
    if (mode === 'remote') {
      return (
        this.configService.get<string>('CEP_FILES_BASE_URL') ||
        this.configService.get<string>('CDN_URL') ||
        ''
      );
    }
    const apiUrl = this.configService.get<string>('API_URL') || '';
    return apiUrl ? `${apiUrl}/files/cep` : '/files/cep';
  }

  private mapCategoryToLegacy(category: CepCategoryWithItems): LegacyCategory {
    const items = category.specialties
      ? category.specialties.map((s) => this.mapSpecialtyToLegacy(s))
      : [];

    return {
      codigo_categoria: category.code,
      nombre_categoria: category.name,
      slug: category.slug,
      pdf_origen: category.pdfOrigin,
      items,
      img: this.buildCategoryImagePath(category.slug),
    };
  }

  private mapSpecialtyToLegacy(
    specialty: CepSpecialtyDoc | CepSpecialtyWithCategory,
    includeCategory = false,
  ): LegacySpecialty {
    const mapped: LegacySpecialty = {
      codigo: specialty.code,
      nombre: specialty.name,
      pag_inicio: specialty.pageStart,
      pag_fin: specialty.pageEnd,
      slug: specialty.slug,
      pdf: specialty.pdfPath,
      img: this.buildImagePath(specialty.pdfPath || ''),
    };

    if (includeCategory && 'category' in specialty) {
      const cat = specialty.category;
      if (cat && typeof cat === 'object' && 'slug' in cat) {
        mapped.categorySlug = cat.slug;
        mapped.categoryName = cat.name;
        mapped.categoryCode = cat.code;
      }
    }

    return mapped;
  }

  private buildImagePath(pdfPath: string): string {
    if (!pdfPath) return '';
    return pdfPath.replace(/\.pdf$/i, '.png');
  }

  private buildCategoryImagePath(categorySlug: string): string {
    if (!categorySlug) return '';
    return `${categorySlug}/${categorySlug}.png`;
  }

  private normalizeText(value: string): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private getSearchTerm(query: Record<string, string>): string {
    return this.normalizeText(query.q || query.search || '');
  }

  private parsePagination(
    query: Record<string, string>,
  ): { page: number; limit: number } | null {
    const page = parseInt(query.page, 10);
    const limit = parseInt(query.limit, 10);

    const hasPage = Number.isFinite(page) && page > 0;
    const hasLimit = Number.isFinite(limit) && limit > 0;

    if (!hasPage && !hasLimit) return null;

    return {
      page: hasPage ? page : 1,
      limit: hasLimit ? Math.min(limit, 100) : 12,
    };
  }

  private createPaginationMeta(
    total: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: totalPages ? page < totalPages : false,
      hasPrevPage: totalPages ? page > 1 : false,
    };
  }
}

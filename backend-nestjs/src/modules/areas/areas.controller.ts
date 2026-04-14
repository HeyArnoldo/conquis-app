import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AreasService } from './areas.service.js';

@Controller('api/areas')
export class AreasController {
  constructor(
    private readonly areasService: AreasService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getAllAreas() {
    // Note: Original controller returns a custom summary object array, NOT { items: [] }
    const areas = await this.areasService.findAllAreas();
    const baseUrl = this.getFilesBaseUrl();

    // Map to summary format
    const summary = areas.map((area) => ({
      area: area.name,
      slug: area.slug,
      img: area.img,
      specialties: area.items ? area.items.length : 0,
      filesBaseUrl: baseUrl,
    }));

    return summary;
  }

  @Get('specialties') // Must be before :areaSlug to avoid conflict
  async getAllSpecialties(@Query() query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || '';

    const { items, total } =
      await this.areasService.findAllSpecialtiesPaginated(page, limit, search);
    const baseUrl = this.getFilesBaseUrl();

    // Map items to include filesBaseUrl and area info (as original controller does)
    const specialties = items.map((item) => ({
      ...item,
      area: item.area ? item.area.name : null,
      areaSlug: item.area ? item.area.slug : null,
      filesBaseUrl: baseUrl,
    }));

    return {
      page,
      limit,
      total,
      hasMore: page * limit < total,
      specialties,
    };
  }

  @Get(':areaSlug')
  async getArea(@Param('areaSlug') areaSlug: string) {
    const area = await this.areasService.findAreaBySlug(areaSlug);
    if (!area) {
      throw new NotFoundException({ message: 'Area no encontrada' });
    }

    // Original controller returns area object spread + filesBaseUrl
    // Area object has 'items' property (relations)
    return {
      ...area,
      filesBaseUrl: this.getFilesBaseUrl(),
    };
  }

  @Get(':areaSlug/:specialtySlug')
  async getSpecialty(
    @Param('areaSlug') areaSlug: string,
    @Param('specialtySlug') specialtySlug: string,
  ) {
    const specialty = await this.areasService.findSpecialtyBySlug(
      areaSlug,
      specialtySlug,
    );
    if (!specialty) {
      throw new NotFoundException({ message: 'Especialidad no encontrada' });
    }

    return {
      ...specialty,
      filesBaseUrl: this.getFilesBaseUrl(),
    };
  }

  private getFilesBaseUrl(): string {
    const mode = (
      this.configService.get<string>('AREAS_MODE') || 'local'
    ).toLowerCase();
    if (mode === 'remote') {
      return (
        this.configService.get<string>('AREAS_FILES_BASE_URL') ||
        this.configService.get<string>('CDN_URL') ||
        ''
      );
    }
    const apiUrl = this.configService.get<string>('API_URL') || '';
    return apiUrl ? `${apiUrl}/files/especialidades` : '/files/especialidades';
  }
}

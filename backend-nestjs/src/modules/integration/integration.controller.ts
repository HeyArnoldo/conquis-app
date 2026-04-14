import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { IntegrationService } from './integration.service.js';

@Controller('api/integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('suggestions')
  async getSuggestions(@Query() query: any) {
    const search = query.search || '';
    const minScore = parseFloat(query.minScore) || 0.6;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    return this.integrationService.getIntegrationSuggestions({
      search,
      minScore,
      page,
      limit,
    });
  }

  @Get('links')
  async getLinks() {
    return this.integrationService.getIntegrationLinks();
  }

  @Post('links')
  async upsertLink(@Body() body: any) {
    const link = await this.integrationService.upsertIntegrationLink(body);
    return { ok: true, link };
  }
}

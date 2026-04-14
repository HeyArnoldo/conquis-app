import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationLink } from './entities/integration-link.entity.js';
import { IntegrationController } from './integration.controller.js';
import { IntegrationService } from './integration.service.js';
import { CepModule } from '../cep/cep.module.js';
import { AreasModule } from '../areas/areas.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([IntegrationLink]),
    CepModule,
    AreasModule,
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [TypeOrmModule, IntegrationService],
})
export class IntegrationModule {}

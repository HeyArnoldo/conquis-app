import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity.js';
import { AreaSpecialty } from './entities/area-specialty.entity.js';
import { AreasController } from './areas.controller.js';
import { AreasService } from './areas.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Area, AreaSpecialty])],
  controllers: [AreasController],
  providers: [AreasService],
  exports: [TypeOrmModule, AreasService],
})
export class AreasModule {}

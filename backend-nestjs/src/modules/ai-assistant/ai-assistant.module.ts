import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialtyEmbedding } from './entities/specialty-vector.entity.js';
import { RequirementEmbedding } from './entities/requirement-vector.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpecialtyEmbedding, RequirementEmbedding]),
  ],
  exports: [TypeOrmModule],
})
export class AiAssistantModule {}

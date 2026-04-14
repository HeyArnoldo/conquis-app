import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema.js';
import { Specialty, SpecialtySchema } from './schemas/specialty.schema.js';
import { CepController } from './cep.controller.js';
import { CepService } from './cep.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Specialty.name, schema: SpecialtySchema },
    ]),
  ],
  controllers: [CepController],
  providers: [CepService],
  exports: [CepService],
})
export class CepModule {}

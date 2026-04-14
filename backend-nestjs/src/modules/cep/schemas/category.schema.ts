import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true, collection: 'cep_categories' })
export class Category {
  @Prop({ required: true, unique: true })
  code: string; // "01", "02"

  @Prop({ required: true })
  name: string; // "ADRA", "HABILIDADES MANUALES"

  @Prop({ required: true, unique: true, index: true })
  slug: string; // "01-cep-0000-01-adra"

  @Prop()
  pdfOrigin: string; // "CEP 0000 01 ADRA.pdf"
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Text index for search across name and code
CategorySchema.index({ name: 'text', code: 'text' });

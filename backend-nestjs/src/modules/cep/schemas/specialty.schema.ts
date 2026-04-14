import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SpecialtyDocument = HydratedDocument<Specialty>;

@Schema({ timestamps: true, collection: 'cep_specialties' })
export class Specialty {
  @Prop({ required: true, unique: true })
  code: string; // "AD-001", "HM-050"

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  slug: string; // "ad-001-alivio-del-hambre"

  @Prop()
  pdfPath: string; // "01-cep-0000-01-adra/ad-001-alivio-del-hambre/AD-001.pdf"

  @Prop({ type: Number })
  pageStart: number;

  @Prop({ type: Number })
  pageEnd: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category: Types.ObjectId;
}

export const SpecialtySchema = SchemaFactory.createForClass(Specialty);

// Compound index for category+slug lookups (the :categorySlug/:specialtySlug route)
SpecialtySchema.index({ category: 1, slug: 1 });

// Text index for search across name and code
SpecialtySchema.index({ name: 'text', code: 'text' });

// Index for sorted listing
SpecialtySchema.index({ code: 1 });

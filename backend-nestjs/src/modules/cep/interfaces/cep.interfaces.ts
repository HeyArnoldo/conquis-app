import { Types } from 'mongoose';

/** Lean category document from MongoDB */
export interface CepCategoryDoc {
  _id: Types.ObjectId;
  code: string;
  name: string;
  slug: string;
  pdfOrigin?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Lean specialty document from MongoDB */
export interface CepSpecialtyDoc {
  _id: Types.ObjectId;
  code: string;
  name: string;
  slug: string;
  pdfPath?: string;
  pageStart?: number;
  pageEnd?: number;
  category: Types.ObjectId | CepCategoryDoc;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Category with embedded specialties (aggregated) */
export interface CepCategoryWithItems extends CepCategoryDoc {
  specialties: CepSpecialtyDoc[];
}

/** Specialty with populated category */
export interface CepSpecialtyWithCategory extends CepSpecialtyDoc {
  category: CepCategoryDoc;
}

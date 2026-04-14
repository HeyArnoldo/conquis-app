import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema.js';
import { Specialty, SpecialtyDocument } from './schemas/specialty.schema.js';
import {
  CepCategoryDoc,
  CepCategoryWithItems,
  CepSpecialtyDoc,
  CepSpecialtyWithCategory,
} from './interfaces/cep.interfaces.js';

@Injectable()
export class CepService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Specialty.name)
    private readonly specialtyModel: Model<SpecialtyDocument>,
  ) {}

  async findAllCategories(
    page: number = 1,
    limit: number = 12,
  ): Promise<{ items: CepCategoryWithItems[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.categoryModel
        .find()
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit)
        .lean<CepCategoryDoc[]>()
        .exec(),
      this.categoryModel.countDocuments().exec(),
    ]);

    // For each category, fetch its specialties
    const categoriesWithItems: CepCategoryWithItems[] = await Promise.all(
      items.map(async (cat) => {
        const specialties = await this.specialtyModel
          .find({ category: cat._id })
          .sort({ code: 1 })
          .lean<CepSpecialtyDoc[]>()
          .exec();
        return { ...cat, specialties };
      }),
    );

    return { items: categoriesWithItems, total };
  }

  async findCategoryBySlug(slug: string): Promise<CepCategoryWithItems | null> {
    const category = await this.categoryModel
      .findOne({ slug })
      .lean<CepCategoryDoc>()
      .exec();

    if (!category) return null;

    const specialties = await this.specialtyModel
      .find({ category: category._id })
      .sort({ code: 1 })
      .lean<CepSpecialtyDoc[]>()
      .exec();

    return { ...category, specialties };
  }

  async findSpecialtyBySlug(
    categorySlug: string,
    specialtySlug: string,
  ): Promise<CepSpecialtyWithCategory | null> {
    const category = await this.categoryModel
      .findOne({ slug: categorySlug })
      .lean<CepCategoryDoc>()
      .exec();

    if (!category) return null;

    const specialty = await this.specialtyModel
      .findOne({ slug: specialtySlug, category: category._id })
      .lean<CepSpecialtyDoc>()
      .exec();

    if (!specialty) return null;

    return { ...specialty, category };
  }

  async searchSpecialties(
    query: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<{ items: CepSpecialtyWithCategory[]; total: number }> {
    const skip = (page - 1) * limit;

    // Use regex for diacritical-insensitive search (matching Express behavior)
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    const filter = {
      $or: [{ name: regex }, { code: regex }],
    };

    const [items, total] = await Promise.all([
      this.specialtyModel
        .find(filter)
        .populate('category')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean<CepSpecialtyWithCategory[]>()
        .exec(),
      this.specialtyModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }
}

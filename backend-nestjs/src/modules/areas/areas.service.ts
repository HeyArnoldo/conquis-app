import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Area } from './entities/area.entity.js';
import { AreaSpecialty } from './entities/area-specialty.entity.js';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    @InjectRepository(AreaSpecialty)
    private areaSpecialtyRepository: Repository<AreaSpecialty>,
  ) {}

  async findAllAreas() {
    return this.areaRepository.find({
      relations: ['items'],
      order: { name: 'ASC' },
    });
  }

  async findAreaBySlug(slug: string) {
    return this.areaRepository.findOne({
      where: { slug },
      relations: ['items'],
    });
  }

  async findSpecialtyBySlug(areaSlug: string, specialtySlug: string) {
    return this.areaSpecialtyRepository.findOne({
      where: {
        slug: specialtySlug,
        area: { slug: areaSlug },
      },
      relations: ['area'],
    });
  }

  async findAllSpecialtiesPaginated(
    page: number,
    limit: number,
    search: string,
  ) {
    const query = this.areaSpecialtyRepository
      .createQueryBuilder('specialty')
      .leftJoinAndSelect('specialty.area', 'area')
      .orderBy('specialty.name', 'ASC');

    if (search) {
      query.where(
        '(LOWER(specialty.name) LIKE LOWER(:search) OR LOWER(specialty.slug) LIKE LOWER(:search) OR LOWER(area.name) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    query.skip((page - 1) * limit).take(limit);

    const [items, total] = await query.getManyAndCount();

    return { items, total };
  }

  async findAllSpecialtiesFlat() {
    return this.areaSpecialtyRepository.find({
      relations: ['area'],
      order: { name: 'ASC' },
    });
  }
}

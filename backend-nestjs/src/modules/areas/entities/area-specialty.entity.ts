import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Area } from './area.entity.js';

@Entity('area_specialties')
export class AreaSpecialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  img: string;

  @Column({ nullable: true })
  pdf: string;

  @Column('uuid')
  areaId: string;

  @ManyToOne(() => Area, (area) => area.items)
  @JoinColumn({ name: 'areaId' })
  area: Area;
}

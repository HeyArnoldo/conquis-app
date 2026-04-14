import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AreaSpecialty } from './area-specialty.entity.js';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // "Industrias Agropecuarias"

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  img: string;

  @OneToMany(() => AreaSpecialty, (specialty) => specialty.area)
  items: AreaSpecialty[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

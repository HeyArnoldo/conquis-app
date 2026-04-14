import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Specialty } from './specialty.entity.js';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // "01", "02"...

  @Column()
  name: string; // "ADRA", "HABILIDADES MANUALES"

  @Column({ unique: true })
  slug: string; // "01-cep-0000-01-adra"

  @Column({ nullable: true })
  pdfOrigin: string; // "CEP 0000 01 ADRA.pdf"

  @OneToMany(() => Specialty, (specialty) => specialty.category)
  specialties: Specialty[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

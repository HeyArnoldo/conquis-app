import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity.js';
import { Requirement } from './requirement.entity.js';
import { SpecialtyEmbedding } from '../../ai-assistant/entities/specialty-vector.entity.js';

@Entity('specialties')
export class Specialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // "AD-001", "HM-050"

  @Column()
  name: string;

  @Column()
  slug: string; // "ad-001-alivio-del-hambre"

  @Column({ nullable: true })
  pdfPath: string; // "01-cep-0000-01-adra/ad-001-alivio-del-hambre/AD-001.pdf"

  @Column({ type: 'int', nullable: true })
  pageStart: number;

  @Column({ type: 'int', nullable: true })
  pageEnd: number;

  @Column({ type: 'text', nullable: true })
  rawText: string; // Texto extraído del PDF (se llena en Fase 3)

  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.specialties)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Requirement, (req) => req.specialty)
  requirements: Requirement[];

  @OneToMany(() => SpecialtyEmbedding, (emb) => emb.specialty)
  embeddings: SpecialtyEmbedding[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

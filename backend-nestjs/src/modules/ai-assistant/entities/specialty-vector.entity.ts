import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Specialty } from '../../cep/entities/specialty.entity.js';

@Entity('specialty_embeddings')
export class SpecialtyEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  specialtyId: string;

  @Column({ type: 'int' })
  chunkIndex: number;

  @Column({ type: 'text' })
  chunkText: string;

  // Vector column will be added via migration or raw SQL to avoid TypeORM sync issues initially
  // @Column({ type: 'vector', nullable: true })
  // embedding: number[];

  @ManyToOne(() => Specialty, (specialty) => specialty.embeddings)
  @JoinColumn({ name: 'specialtyId' })
  specialty: Specialty;
}

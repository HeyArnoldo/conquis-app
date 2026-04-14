import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Specialty } from './specialty.entity.js';
import { RequirementEmbedding } from '../../ai-assistant/entities/requirement-vector.entity.js';

@Entity('requirements')
export class Requirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'text' })
  text: string;

  @Column('uuid')
  specialtyId: string;

  @ManyToOne(() => Specialty, (specialty) => specialty.requirements)
  @JoinColumn({ name: 'specialtyId' })
  specialty: Specialty;

  @OneToMany(() => RequirementEmbedding, (emb) => emb.requirement)
  embeddings: RequirementEmbedding[];
}

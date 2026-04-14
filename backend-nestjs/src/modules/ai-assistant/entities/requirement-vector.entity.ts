import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Requirement } from '../../cep/entities/requirement.entity.js';

@Entity('requirement_embeddings')
export class RequirementEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  requirementId: string;

  @Column({ type: 'int' })
  chunkIndex: number;

  @Column({ type: 'text' })
  chunkText: string;

  // Vector column will be added via migration or raw SQL to avoid TypeORM sync issues
  // @Column({ type: 'vector', nullable: true })
  // embedding: number[];

  @ManyToOne(() => Requirement, (req) => req.embeddings)
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement;
}

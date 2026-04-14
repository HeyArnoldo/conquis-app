import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('integration_links')
export class IntegrationLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cepId: string; // "cep:AD-001"

  @Column()
  specialtyId: string; // "esp:industrias-agropecuarias:agricultura"

  @Column({ default: 'pending' })
  status: string; // "confirmed" | "pending"

  @Column({ default: 'manual' })
  source: string; // "manual" | "auto"

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

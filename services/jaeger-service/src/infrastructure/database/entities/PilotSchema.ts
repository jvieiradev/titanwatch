import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { JaegerSchema } from './JaegerSchema';

@Entity('pilots')
export class PilotSchema {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  rank!: string;

  @Column()
  status!: string;

  @Column({ name: 'drift_compatibility' })
  driftCompatibility!: number;

  @Column({ name: 'combat_hours', default: 0 })
  combatHours!: number;

  @Column({ name: 'kill_count', default: 0 })
  killCount!: number;

  @Column()
  nationality!: string;

  @Column({ name: 'jaeger_id', nullable: true })
  jaegerId?: string;

  @ManyToOne(() => JaegerSchema, (jaeger) => jaeger.pilots)
  @JoinColumn({ name: 'jaeger_id' })
  jaeger?: JaegerSchema;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

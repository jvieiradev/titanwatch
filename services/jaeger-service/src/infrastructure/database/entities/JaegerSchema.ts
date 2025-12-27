import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PilotSchema } from './PilotSchema';

@Entity('jaegers')
export class JaegerSchema {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  mark!: number;

  @Column()
  status!: string;

  @Column({ name: 'integrity_level' })
  integrityLevel!: number;

  @Column('decimal', { precision: 6, scale: 2 })
  height!: number;

  @Column('decimal', { precision: 8, scale: 2 })
  weight!: number;

  @Column({ name: 'power_core' })
  powerCore!: string;

  @Column('simple-array')
  weapons!: string[];

  @Column({ name: 'base_location' })
  baseLocation!: string;

  @OneToMany(() => PilotSchema, (pilot) => pilot.jaeger, { cascade: true })
  pilots!: PilotSchema[];

  @Column({ name: 'deployment_count', default: 0 })
  deploymentCount!: number;

  @Column({ name: 'kill_count', default: 0 })
  killCount!: number;

  @Column({ name: 'last_maintenance', nullable: true })
  lastMaintenance?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

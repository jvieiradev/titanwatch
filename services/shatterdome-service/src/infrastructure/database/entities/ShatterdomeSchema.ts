import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shatterdomes')
export class ShatterdomeSchema {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  city!: string;

  @Column()
  country!: string;

  @Column('decimal')
  latitude!: number;

  @Column('decimal')
  longitude!: number;

  @Column({ name: 'total_capacity' })
  totalCapacity!: number;

  @Column({ name: 'current_capacity', default: 0 })
  currentCapacity!: number;

  @Column()
  status!: string;

  @Column('simple-array', { name: 'allocated_jaegers' })
  allocatedJaegers!: string[];

  @Column({ name: 'established_date' })
  establishedDate!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

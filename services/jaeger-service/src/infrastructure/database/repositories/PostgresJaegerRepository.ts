import { Repository } from 'typeorm';
import { Jaeger } from '../../../domain/entities/Jaeger';
import { IJaegerRepository, JaegerFilters, PaginationOptions, PaginatedResult } from '../../../domain/repositories/IJaegerRepository';
import { JaegerSchema } from '../entities/JaegerSchema';
import { JaegerMapper } from '../mappers/JaegerMapper';
import { AppDataSource } from '../../config/data-source';

export class PostgresJaegerRepository implements IJaegerRepository {
  private repository: Repository<JaegerSchema>;

  constructor() {
    this.repository = AppDataSource.getRepository(JaegerSchema);
  }

  async create(jaeger: Jaeger): Promise<Jaeger> {
    const schema = JaegerMapper.toPersistence(jaeger);
    const saved = await this.repository.save(schema);
    return JaegerMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Jaeger | null> {
    const schema = await this.repository.findOne({ where: { id }, relations: ['pilots'] });
    return schema ? JaegerMapper.toDomain(schema) : null;
  }

  async findByName(name: string): Promise<Jaeger | null> {
    const schema = await this.repository.findOne({ where: { name }, relations: ['pilots'] });
    return schema ? JaegerMapper.toDomain(schema) : null;
  }

  async findAll(filters?: JaegerFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Jaeger>> {
    const queryBuilder = this.repository.createQueryBuilder('jaeger').leftJoinAndSelect('jaeger.pilots', 'pilots');

    if (filters?.status) queryBuilder.andWhere('jaeger.status = :status', { status: filters.status });
    if (filters?.mark) queryBuilder.andWhere('jaeger.mark = :mark', { mark: filters.mark });
    if (filters?.baseLocation) queryBuilder.andWhere('jaeger.baseLocation = :baseLocation', { baseLocation: filters.baseLocation });
    if (filters?.minIntegrity) queryBuilder.andWhere('jaeger.integrityLevel >= :min', { min: filters.minIntegrity });
    if (filters?.maxIntegrity) queryBuilder.andWhere('jaeger.integrityLevel <= :max', { max: filters.maxIntegrity });

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [results, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data: results.map((r) => JaegerMapper.toDomain(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(jaeger: Jaeger): Promise<Jaeger> {
    const schema = JaegerMapper.toPersistence(jaeger);
    const saved = await this.repository.save(schema);
    return JaegerMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }

  async count(filters?: JaegerFilters): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('jaeger');
    if (filters?.status) queryBuilder.andWhere('jaeger.status = :status', { status: filters.status });
    return await queryBuilder.getCount();
  }

  async findByBaseLocation(baseLocation: string): Promise<Jaeger[]> {
    const results = await this.repository.find({ where: { baseLocation }, relations: ['pilots'] });
    return results.map((r) => JaegerMapper.toDomain(r));
  }

  async findByStatus(status: string): Promise<Jaeger[]> {
    const results = await this.repository.find({ where: { status }, relations: ['pilots'] });
    return results.map((r) => JaegerMapper.toDomain(r));
  }

  async findDeployable(): Promise<Jaeger[]> {
    const results = await this.repository.find({ where: { status: 'active' }, relations: ['pilots'] });
    return results.map((r) => JaegerMapper.toDomain(r)).filter((j) => j.canDeploy());
  }

  async findNeedingMaintenance(): Promise<Jaeger[]> {
    const results = await this.repository.find({ relations: ['pilots'] });
    return results.map((r) => JaegerMapper.toDomain(r)).filter((j) => j.needsMaintenance());
  }
}

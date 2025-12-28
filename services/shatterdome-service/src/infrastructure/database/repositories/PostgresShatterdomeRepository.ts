import { Repository } from 'typeorm';
import { Shatterdome, ShatterdomeProps, ShatterdomeStatus } from '../../../domain/aggregates/Shatterdome';
import { IShatterdomeRepository, ShatterdomeFilters } from '../../../domain/repositories/IShatterdomeRepository';
import { ShatterdomeSchema } from '../entities/ShatterdomeSchema';
import { AppDataSource } from '../../config/data-source';
import { Coordinates } from '../../../domain/value-objects/Coordinates';
import { Location } from '../../../domain/value-objects/Location';
import { Capacity } from '../../../domain/value-objects/Capacity';

export class PostgresShatterdomeRepository implements IShatterdomeRepository {
  private repository: Repository<ShatterdomeSchema>;

  constructor() {
    this.repository = AppDataSource.getRepository(ShatterdomeSchema);
  }

  async create(shatterdome: Shatterdome): Promise<Shatterdome> {
    const schema = this.toPersistence(shatterdome);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Shatterdome | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByName(name: string): Promise<Shatterdome | null> {
    const schema = await this.repository.findOne({ where: { name } });
    return schema ? this.toDomain(schema) : null;
  }

  async findAll(filters?: ShatterdomeFilters): Promise<Shatterdome[]> {
    const qb = this.repository.createQueryBuilder('s');
    if (filters?.status) qb.andWhere('s.status = :status', { status: filters.status });
    if (filters?.city) qb.andWhere('s.city = :city', { city: filters.city });
    if (filters?.country) qb.andWhere('s.country = :country', { country: filters.country });
    if (filters?.hasCapacity) qb.andWhere('s.currentCapacity < s.totalCapacity');

    const results = await qb.getMany();
    return results.map(r => this.toDomain(r));
  }

  async update(shatterdome: Shatterdome): Promise<Shatterdome> {
    const schema = this.toPersistence(shatterdome);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }

  private toDomain(schema: ShatterdomeSchema): Shatterdome {
    const coordinates = Coordinates.create(Number(schema.latitude), Number(schema.longitude));
    const location = Location.create(schema.city, schema.country, coordinates);
    const capacity = Capacity.create(schema.totalCapacity, schema.currentCapacity);

    const props: ShatterdomeProps = {
      id: schema.id,
      name: schema.name,
      location,
      capacity,
      status: schema.status as ShatterdomeStatus,
      allocatedJaegers: schema.allocatedJaegers,
      establishedDate: schema.establishedDate,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };

    return Shatterdome.reconstitute(props);
  }

  private toPersistence(shatterdome: Shatterdome): ShatterdomeSchema {
    const schema = new ShatterdomeSchema();
    if (shatterdome.id) schema.id = shatterdome.id;
    schema.name = shatterdome.name;
    schema.city = shatterdome.location.city;
    schema.country = shatterdome.location.country;
    schema.latitude = shatterdome.location.coordinates.latitude;
    schema.longitude = shatterdome.location.coordinates.longitude;
    schema.totalCapacity = shatterdome.capacity.total;
    schema.currentCapacity = shatterdome.capacity.current;
    schema.status = shatterdome.status;
    schema.allocatedJaegers = shatterdome.allocatedJaegers;
    schema.establishedDate = shatterdome.establishedDate;
    return schema;
  }
}

import { Shatterdome } from '../aggregates/Shatterdome';

export interface ShatterdomeFilters {
  status?: string;
  city?: string;
  country?: string;
  hasCapacity?: boolean;
}

export interface IShatterdomeRepository {
  create(shatterdome: Shatterdome): Promise<Shatterdome>;
  findById(id: string): Promise<Shatterdome | null>;
  findByName(name: string): Promise<Shatterdome | null>;
  findAll(filters?: ShatterdomeFilters): Promise<Shatterdome[]>;
  update(shatterdome: Shatterdome): Promise<Shatterdome>;
  delete(id: string): Promise<void>;
  existsByName(name: string): Promise<boolean>;
}

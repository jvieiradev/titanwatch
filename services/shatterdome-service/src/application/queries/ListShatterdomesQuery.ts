import { Shatterdome } from '../../domain/aggregates/Shatterdome';
import { IShatterdomeRepository, ShatterdomeFilters } from '../../domain/repositories/IShatterdomeRepository';

export class ListShatterdomesQueryHandler {
  constructor(private repository: IShatterdomeRepository) {}

  async execute(filters?: ShatterdomeFilters): Promise<Shatterdome[]> {
    return await this.repository.findAll(filters);
  }
}

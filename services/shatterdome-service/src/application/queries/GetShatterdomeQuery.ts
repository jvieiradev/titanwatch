import { Shatterdome } from '../../domain/aggregates/Shatterdome';
import { IShatterdomeRepository } from '../../domain/repositories/IShatterdomeRepository';

export class GetShatterdomeQueryHandler {
  constructor(private repository: IShatterdomeRepository) {}

  async execute(id: string): Promise<Shatterdome> {
    const shatterdome = await this.repository.findById(id);
    if (!shatterdome) {
      throw new Error('Shatterdome not found');
    }
    return shatterdome;
  }
}

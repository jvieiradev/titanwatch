import { Shatterdome } from '../../domain/aggregates/Shatterdome';
import { IShatterdomeRepository } from '../../domain/repositories/IShatterdomeRepository';
import { AllocationService } from '../../domain/services/AllocationService';

export interface AllocateJaegerInput {
  shatterdomeId: string;
  jaegerId: string;
}

export class AllocateJaegerCommandHandler {
  constructor(private repository: IShatterdomeRepository) {}

  async execute(input: AllocateJaegerInput): Promise<Shatterdome> {
    const shatterdome = await this.repository.findById(input.shatterdomeId);
    if (!shatterdome) {
      throw new Error('Shatterdome not found');
    }

    const canAllocate = AllocationService.canAllocate(shatterdome, input.jaegerId);
    if (!canAllocate.can) {
      throw new Error(canAllocate.reason);
    }

    shatterdome.allocateJaeger(input.jaegerId);
    return await this.repository.update(shatterdome);
  }
}

import { Shatterdome } from '../aggregates/Shatterdome';

export class AllocationService {
  static canAllocate(shatterdome: Shatterdome, jaegerId: string): { can: boolean; reason?: string } {
    if (shatterdome.status !== 'active') {
      return { can: false, reason: 'Shatterdome is not active' };
    }

    if (shatterdome.allocatedJaegers.includes(jaegerId)) {
      return { can: false, reason: 'Jaeger already allocated' };
    }

    if (!shatterdome.capacity.hasSpace()) {
      return { can: false, reason: 'No available capacity' };
    }

    return { can: true };
  }

  static validateDeallocation(shatterdome: Shatterdome, jaegerId: string): { valid: boolean; reason?: string } {
    if (!shatterdome.allocatedJaegers.includes(jaegerId)) {
      return { valid: false, reason: 'Jaeger not allocated to this shatterdome' };
    }

    return { valid: true };
  }
}

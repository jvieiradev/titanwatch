import { Jaeger } from '../domain/entities/Jaeger';
import { IJaegerRepository } from '../domain/repositories/IJaegerRepository';
import { IntegrityLevel } from '../domain/value-objects/IntegrityLevel';

export interface UpdateIntegrityInput {
  id: string;
  integrityLevel: number;
}

export class UpdateIntegrityUseCase {
  constructor(private jaegerRepository: IJaegerRepository) {}

  async execute(input: UpdateIntegrityInput): Promise<Jaeger> {
    const jaeger = await this.jaegerRepository.findById(input.id);

    if (!jaeger) {
      throw new Error(`Jaeger with ID "${input.id}" not found`);
    }

    const newIntegrity = IntegrityLevel.create(input.integrityLevel);
    jaeger.updateIntegrity(newIntegrity);

    return await this.jaegerRepository.update(jaeger);
  }
}

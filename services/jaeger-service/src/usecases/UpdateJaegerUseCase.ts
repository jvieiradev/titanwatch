import { Jaeger } from '../domain/entities/Jaeger';
import { IJaegerRepository } from '../domain/repositories/IJaegerRepository';

export interface UpdateJaegerInput {
  id: string;
  powerCore?: string;
  weapons?: string[];
  baseLocation?: string;
}

export class UpdateJaegerUseCase {
  constructor(private jaegerRepository: IJaegerRepository) {}

  async execute(input: UpdateJaegerInput): Promise<Jaeger> {
    const jaeger = await this.jaegerRepository.findById(input.id);

    if (!jaeger) {
      throw new Error(`Jaeger with ID "${input.id}" not found`);
    }

    // Create updated props
    const updatedProps = {
      ...jaeger,
      powerCore: input.powerCore ?? jaeger.powerCore,
      weapons: input.weapons ?? jaeger.weapons,
      baseLocation: input.baseLocation ?? jaeger.baseLocation,
      updatedAt: new Date(),
    };

    const updatedJaeger = Jaeger.reconstitute(updatedProps);

    return await this.jaegerRepository.update(updatedJaeger);
  }
}

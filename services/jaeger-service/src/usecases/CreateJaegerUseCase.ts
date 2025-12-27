import { Jaeger, JaegerProps, JaegerStatus } from '../domain/entities/Jaeger';
import { IJaegerRepository } from '../domain/repositories/IJaegerRepository';
import { JaegerMark } from '../domain/value-objects/JaegerMark';
import { IntegrityLevel } from '../domain/value-objects/IntegrityLevel';
import { JaegerValidationService } from '../domain/services/JaegerValidationService';

export interface CreateJaegerInput {
  name: string;
  mark: number;
  height: number;
  weight: number;
  powerCore: string;
  weapons: string[];
  baseLocation: string;
}

export class CreateJaegerUseCase {
  constructor(private jaegerRepository: IJaegerRepository) {}

  async execute(input: CreateJaegerInput): Promise<Jaeger> {
    // Validate name
    const nameValidation = JaegerValidationService.validateJaegerName(input.name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.reason);
    }

    // Check if name already exists
    const exists = await this.jaegerRepository.existsByName(input.name);
    if (exists) {
      throw new Error(`Jaeger with name "${input.name}" already exists`);
    }

    // Validate specs
    const specsValidation = JaegerValidationService.validateJaegerSpecs(
      input.height,
      input.weight
    );
    if (!specsValidation.valid) {
      throw new Error(specsValidation.reason);
    }

    // Create value objects
    const mark = JaegerMark.create(input.mark);
    const integrityLevel = IntegrityLevel.create(100); // New Jaegers start at 100%

    // Create Jaeger entity
    const jaegerProps: JaegerProps = {
      name: input.name,
      mark,
      status: JaegerStatus.ACTIVE,
      integrityLevel,
      height: input.height,
      weight: input.weight,
      powerCore: input.powerCore,
      weapons: input.weapons,
      baseLocation: input.baseLocation,
      deploymentCount: 0,
      killCount: 0,
    };

    const jaeger = Jaeger.create(jaegerProps);

    // Persist
    return await this.jaegerRepository.create(jaeger);
  }
}

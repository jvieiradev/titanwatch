import { Jaeger } from '../domain/entities/Jaeger';
import { IJaegerRepository } from '../domain/repositories/IJaegerRepository';

export class GetJaegerUseCase {
  constructor(private jaegerRepository: IJaegerRepository) {}

  async execute(id: string): Promise<Jaeger> {
    const jaeger = await this.jaegerRepository.findById(id);

    if (!jaeger) {
      throw new Error(`Jaeger with ID "${id}" not found`);
    }

    return jaeger;
  }
}

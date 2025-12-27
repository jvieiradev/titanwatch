import { IJaegerRepository } from '../domain/repositories/IJaegerRepository';

export class DeleteJaegerUseCase {
  constructor(private jaegerRepository: IJaegerRepository) {}

  async execute(id: string): Promise<void> {
    const jaeger = await this.jaegerRepository.findById(id);

    if (!jaeger) {
      throw new Error(`Jaeger with ID "${id}" not found`);
    }

    await this.jaegerRepository.delete(id);
  }
}

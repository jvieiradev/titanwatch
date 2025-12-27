import { Jaeger } from '../domain/entities/Jaeger';
import {
  IJaegerRepository,
  JaegerFilters,
  PaginationOptions,
  PaginatedResult,
} from '../domain/repositories/IJaegerRepository';

export interface ListJaegersInput {
  filters?: JaegerFilters;
  pagination?: PaginationOptions;
}

export class ListJaegersUseCase {
  constructor(private jaegerRepository: IJaegerRepository) {}

  async execute(input: ListJaegersInput = {}): Promise<PaginatedResult<Jaeger>> {
    const { filters, pagination } = input;

    return await this.jaegerRepository.findAll(filters, pagination);
  }
}

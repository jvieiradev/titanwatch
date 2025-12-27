import { Jaeger } from '../entities/Jaeger';

export interface JaegerFilters {
  status?: string;
  mark?: number;
  baseLocation?: string;
  minIntegrity?: number;
  maxIntegrity?: number;
  canDeploy?: boolean;
  needsMaintenance?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Jaeger Repository Interface
 * Defines the contract for Jaeger data persistence
 */
export interface IJaegerRepository {
  /**
   * Create a new Jaeger
   */
  create(jaeger: Jaeger): Promise<Jaeger>;

  /**
   * Find a Jaeger by ID
   */
  findById(id: string): Promise<Jaeger | null>;

  /**
   * Find a Jaeger by name
   */
  findByName(name: string): Promise<Jaeger | null>;

  /**
   * Find all Jaegers with optional filters and pagination
   */
  findAll(
    filters?: JaegerFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Jaeger>>;

  /**
   * Update a Jaeger
   */
  update(jaeger: Jaeger): Promise<Jaeger>;

  /**
   * Delete a Jaeger
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a Jaeger exists by name
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Count Jaegers with optional filters
   */
  count(filters?: JaegerFilters): Promise<number>;

  /**
   * Find Jaegers by base location
   */
  findByBaseLocation(baseLocation: string): Promise<Jaeger[]>;

  /**
   * Find Jaegers by status
   */
  findByStatus(status: string): Promise<Jaeger[]>;

  /**
   * Find Jaegers that can be deployed
   */
  findDeployable(): Promise<Jaeger[]>;

  /**
   * Find Jaegers that need maintenance
   */
  findNeedingMaintenance(): Promise<Jaeger[]>;
}

import { Location } from '../value-objects/Location';
import { Capacity } from '../value-objects/Capacity';
import { Commander } from '../entities/Commander';
import { DomainEvent, JaegerAllocatedEvent, JaegerDeallocatedEvent, CapacityExceededEvent } from '../events/DomainEvent';

export enum ShatterdomeStatus {
  ACTIVE = 'active',
  UNDER_CONSTRUCTION = 'under_construction',
  DAMAGED = 'damaged',
  DECOMMISSIONED = 'decommissioned',
}

export interface ShatterdomeProps {
  id?: string;
  name: string;
  location: Location;
  capacity: Capacity;
  status: ShatterdomeStatus;
  commander?: Commander;
  allocatedJaegers: string[];
  establishedDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Shatterdome {
  private domainEvents: DomainEvent[] = [];

  private constructor(private props: ShatterdomeProps) {
    this.validate();
  }

  static create(props: ShatterdomeProps): Shatterdome {
    return new Shatterdome(props);
  }

  static reconstitute(props: ShatterdomeProps): Shatterdome {
    return new Shatterdome(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Shatterdome name is required');
    }
    if (this.props.allocatedJaegers.length > this.props.capacity.total) {
      throw new Error('Allocated jaegers exceed capacity');
    }
  }

  // Getters
  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get location(): Location {
    return this.props.location;
  }

  get capacity(): Capacity {
    return this.props.capacity;
  }

  get status(): ShatterdomeStatus {
    return this.props.status;
  }

  get commander(): Commander | undefined {
    return this.props.commander;
  }

  get allocatedJaegers(): string[] {
    return [...this.props.allocatedJaegers];
  }

  get establishedDate(): Date {
    return this.props.establishedDate;
  }

  // Business Methods
  allocateJaeger(jaegerId: string): void {
    if (this.props.status !== ShatterdomeStatus.ACTIVE) {
      throw new Error('Cannot allocate jaeger to inactive shatterdome');
    }

    if (this.props.allocatedJaegers.includes(jaegerId)) {
      throw new Error('Jaeger already allocated to this shatterdome');
    }

    if (!this.props.capacity.hasSpace()) {
      this.addDomainEvent(new CapacityExceededEvent(this.props.id!, jaegerId));
      throw new Error('Shatterdome capacity exceeded');
    }

    this.props.allocatedJaegers.push(jaegerId);
    this.props.capacity = this.props.capacity.increment();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new JaegerAllocatedEvent(this.props.id!, jaegerId));
  }

  deallocateJaeger(jaegerId: string): void {
    const index = this.props.allocatedJaegers.indexOf(jaegerId);
    if (index === -1) {
      throw new Error('Jaeger not allocated to this shatterdome');
    }

    this.props.allocatedJaegers.splice(index, 1);
    this.props.capacity = this.props.capacity.decrement();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new JaegerDeallocatedEvent(this.props.id!, jaegerId));
  }

  assignCommander(commander: Commander): void {
    this.props.commander = commander;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.status === ShatterdomeStatus.UNDER_CONSTRUCTION) {
      this.props.status = ShatterdomeStatus.ACTIVE;
      this.props.updatedAt = new Date();
    } else {
      throw new Error('Only shatterdomes under construction can be activated');
    }
  }

  decommission(): void {
    if (this.props.allocatedJaegers.length > 0) {
      throw new Error('Cannot decommission shatterdome with allocated jaegers');
    }
    this.props.status = ShatterdomeStatus.DECOMMISSIONED;
    this.props.updatedAt = new Date();
  }

  canAllocateJaeger(): boolean {
    return this.props.status === ShatterdomeStatus.ACTIVE && this.props.capacity.hasSpace();
  }

  // Domain Events
  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      name: this.props.name,
      location: {
        city: this.props.location.city,
        country: this.props.location.country,
        coordinates: {
          latitude: this.props.location.coordinates.latitude,
          longitude: this.props.location.coordinates.longitude,
        },
      },
      capacity: {
        total: this.props.capacity.total,
        current: this.props.capacity.current,
        available: this.props.capacity.available,
      },
      status: this.props.status,
      commander: this.props.commander,
      allocatedJaegers: this.props.allocatedJaegers,
      establishedDate: this.props.establishedDate,
      canAllocateJaeger: this.canAllocateJaeger(),
    };
  }
}

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
    this.occurredOn = new Date();
  }

  abstract eventName(): string;
}

export class JaegerAllocatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly jaegerId: string
  ) {
    super(aggregateId);
  }

  eventName(): string {
    return 'JaegerAllocated';
  }
}

export class JaegerDeallocatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly jaegerId: string
  ) {
    super(aggregateId);
  }

  eventName(): string {
    return 'JaegerDeallocated';
  }
}

export class CapacityExceededEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly attemptedJaegerId: string
  ) {
    super(aggregateId);
  }

  eventName(): string {
    return 'CapacityExceeded';
  }
}

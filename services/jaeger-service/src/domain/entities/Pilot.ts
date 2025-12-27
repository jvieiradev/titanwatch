export enum PilotRank {
  CADET = 'cadet',
  RANGER = 'ranger',
  MARSHAL = 'marshal',
}

export enum PilotStatus {
  ACTIVE = 'active',
  INJURED = 'injured',
  RETIRED = 'retired',
  KIA = 'kia', // Killed in Action
}

export interface PilotProps {
  id?: string;
  name: string;
  rank: PilotRank;
  status: PilotStatus;
  driftCompatibility: number; // 0-100
  combatHours: number;
  killCount: number;
  nationality: string;
  jaegerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Pilot Domain Entity
 * Represents a Jaeger pilot
 */
export class Pilot {
  private constructor(private props: PilotProps) {
    this.validate();
  }

  static create(props: PilotProps): Pilot {
    return new Pilot(props);
  }

  static reconstitute(props: PilotProps): Pilot {
    return new Pilot(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Pilot name is required');
    }

    if (this.props.driftCompatibility < 0 || this.props.driftCompatibility > 100) {
      throw new Error('Drift compatibility must be between 0 and 100');
    }

    if (this.props.combatHours < 0) {
      throw new Error('Combat hours cannot be negative');
    }

    if (this.props.killCount < 0) {
      throw new Error('Kill count cannot be negative');
    }

    if (!this.props.nationality || this.props.nationality.trim().length === 0) {
      throw new Error('Pilot nationality is required');
    }
  }

  // Getters
  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get rank(): PilotRank {
    return this.props.rank;
  }

  get status(): PilotStatus {
    return this.props.status;
  }

  get driftCompatibility(): number {
    return this.props.driftCompatibility;
  }

  get combatHours(): number {
    return this.props.combatHours;
  }

  get killCount(): number {
    return this.props.killCount;
  }

  get nationality(): string {
    return this.props.nationality;
  }

  get jaegerId(): string | undefined {
    return this.props.jaegerId;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Business methods
  assignToJaeger(jaegerId: string): void {
    if (this.props.status !== PilotStatus.ACTIVE) {
      throw new Error('Only active pilots can be assigned to Jaegers');
    }
    this.props.jaegerId = jaegerId;
    this.props.updatedAt = new Date();
  }

  unassignFromJaeger(): void {
    this.props.jaegerId = undefined;
    this.props.updatedAt = new Date();
  }

  recordCombatHours(hours: number): void {
    if (hours < 0) {
      throw new Error('Combat hours must be positive');
    }
    this.props.combatHours += hours;
    this.props.updatedAt = new Date();
  }

  recordKill(): void {
    this.props.killCount++;
    this.props.updatedAt = new Date();
  }

  promote(): void {
    if (this.props.rank === PilotRank.CADET && this.props.combatHours >= 100) {
      this.props.rank = PilotRank.RANGER;
    } else if (this.props.rank === PilotRank.RANGER && this.props.combatHours >= 500) {
      this.props.rank = PilotRank.MARSHAL;
    } else {
      throw new Error('Pilot does not meet promotion requirements');
    }
    this.props.updatedAt = new Date();
  }

  injure(): void {
    this.props.status = PilotStatus.INJURED;
    this.props.jaegerId = undefined;
    this.props.updatedAt = new Date();
  }

  recover(): void {
    if (this.props.status !== PilotStatus.INJURED) {
      throw new Error('Only injured pilots can recover');
    }
    this.props.status = PilotStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  retire(): void {
    this.props.status = PilotStatus.RETIRED;
    this.props.jaegerId = undefined;
    this.props.updatedAt = new Date();
  }

  markKIA(): void {
    this.props.status = PilotStatus.KIA;
    this.props.jaegerId = undefined;
    this.props.updatedAt = new Date();
  }

  isCompatibleWith(otherPilot: Pilot): boolean {
    const averageCompatibility = (this.props.driftCompatibility + otherPilot.driftCompatibility) / 2;
    return averageCompatibility >= 70;
  }

  canPilot(): boolean {
    return this.props.status === PilotStatus.ACTIVE && this.props.driftCompatibility >= 50;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      name: this.props.name,
      rank: this.props.rank,
      status: this.props.status,
      driftCompatibility: this.props.driftCompatibility,
      combatHours: this.props.combatHours,
      killCount: this.props.killCount,
      nationality: this.props.nationality,
      jaegerId: this.props.jaegerId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      canPilot: this.canPilot(),
    };
  }
}

import { Pilot } from './Pilot';
import { JaegerMark } from '../value-objects/JaegerMark';
import { IntegrityLevel } from '../value-objects/IntegrityLevel';

export enum JaegerStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  DAMAGED = 'damaged',
  DECOMMISSIONED = 'decommissioned',
}

export interface JaegerProps {
  id?: string;
  name: string;
  mark: JaegerMark;
  status: JaegerStatus;
  integrityLevel: IntegrityLevel;
  height: number; // in meters
  weight: number; // in tons
  powerCore: string;
  weapons: string[];
  baseLocation: string;
  pilots?: Pilot[];
  deploymentCount: number;
  killCount: number;
  lastMaintenance?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Jaeger Domain Entity
 * Represents a giant robot (Jaeger) in the Titan Watch system
 */
export class Jaeger {
  private constructor(private props: JaegerProps) {
    this.validate();
  }

  static create(props: JaegerProps): Jaeger {
    return new Jaeger(props);
  }

  static reconstitute(props: JaegerProps): Jaeger {
    return new Jaeger(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Jaeger name is required');
    }

    if (this.props.height <= 0) {
      throw new Error('Jaeger height must be greater than 0');
    }

    if (this.props.weight <= 0) {
      throw new Error('Jaeger weight must be greater than 0');
    }

    if (!this.props.powerCore || this.props.powerCore.trim().length === 0) {
      throw new Error('Jaeger power core is required');
    }

    if (!this.props.baseLocation || this.props.baseLocation.trim().length === 0) {
      throw new Error('Jaeger base location is required');
    }

    if (this.props.deploymentCount < 0) {
      throw new Error('Deployment count cannot be negative');
    }

    if (this.props.killCount < 0) {
      throw new Error('Kill count cannot be negative');
    }
  }

  // Getters
  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get mark(): JaegerMark {
    return this.props.mark;
  }

  get status(): JaegerStatus {
    return this.props.status;
  }

  get integrityLevel(): IntegrityLevel {
    return this.props.integrityLevel;
  }

  get height(): number {
    return this.props.height;
  }

  get weight(): number {
    return this.props.weight;
  }

  get powerCore(): string {
    return this.props.powerCore;
  }

  get weapons(): string[] {
    return [...this.props.weapons];
  }

  get baseLocation(): string {
    return this.props.baseLocation;
  }

  get pilots(): Pilot[] | undefined {
    return this.props.pilots ? [...this.props.pilots] : undefined;
  }

  get deploymentCount(): number {
    return this.props.deploymentCount;
  }

  get killCount(): number {
    return this.props.killCount;
  }

  get lastMaintenance(): Date | undefined {
    return this.props.lastMaintenance;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Business methods
  updateIntegrity(newIntegrity: IntegrityLevel): void {
    this.props.integrityLevel = newIntegrity;
    this.props.updatedAt = new Date();

    // Auto-update status based on integrity
    if (newIntegrity.value < 30) {
      this.props.status = JaegerStatus.DAMAGED;
    } else if (newIntegrity.value < 70 && this.props.status === JaegerStatus.ACTIVE) {
      this.props.status = JaegerStatus.MAINTENANCE;
    }
  }

  assignPilots(pilots: Pilot[]): void {
    if (pilots.length > 2) {
      throw new Error('A Jaeger can have maximum 2 pilots');
    }
    this.props.pilots = pilots;
    this.props.updatedAt = new Date();
  }

  recordDeployment(): void {
    this.props.deploymentCount++;
    this.props.updatedAt = new Date();
  }

  recordKill(): void {
    this.props.killCount++;
    this.props.updatedAt = new Date();
  }

  startMaintenance(): void {
    if (this.props.status === JaegerStatus.DECOMMISSIONED) {
      throw new Error('Cannot maintain a decommissioned Jaeger');
    }
    this.props.status = JaegerStatus.MAINTENANCE;
    this.props.lastMaintenance = new Date();
    this.props.updatedAt = new Date();
  }

  completeMaintenance(newIntegrity: IntegrityLevel): void {
    if (this.props.status !== JaegerStatus.MAINTENANCE) {
      throw new Error('Jaeger is not in maintenance');
    }
    this.props.integrityLevel = newIntegrity;
    this.props.status = JaegerStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  decommission(): void {
    this.props.status = JaegerStatus.DECOMMISSIONED;
    this.props.pilots = [];
    this.props.updatedAt = new Date();
  }

  canDeploy(): boolean {
    return (
      this.props.status === JaegerStatus.ACTIVE &&
      this.props.integrityLevel.value >= 70 &&
      this.props.pilots !== undefined &&
      this.props.pilots.length >= 1
    );
  }

  needsMaintenance(): boolean {
    if (!this.props.lastMaintenance) {
      return this.props.deploymentCount > 0;
    }

    const daysSinceLastMaintenance =
      (new Date().getTime() - this.props.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24);

    return (
      daysSinceLastMaintenance > 30 ||
      this.props.integrityLevel.value < 70 ||
      this.props.deploymentCount % 5 === 0
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      name: this.props.name,
      mark: this.props.mark.toString(),
      status: this.props.status,
      integrityLevel: this.props.integrityLevel.value,
      height: this.props.height,
      weight: this.props.weight,
      powerCore: this.props.powerCore,
      weapons: this.props.weapons,
      baseLocation: this.props.baseLocation,
      pilots: this.props.pilots?.map((p) => p.toJSON()),
      deploymentCount: this.props.deploymentCount,
      killCount: this.props.killCount,
      lastMaintenance: this.props.lastMaintenance,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      canDeploy: this.canDeploy(),
      needsMaintenance: this.needsMaintenance(),
    };
  }
}

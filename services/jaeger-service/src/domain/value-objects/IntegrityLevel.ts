/**
 * IntegrityLevel Value Object
 * Represents the structural integrity of a Jaeger (0-100%)
 */
export class IntegrityLevel {
  private constructor(private readonly _value: number) {
    this.validate();
  }

  static create(value: number): IntegrityLevel {
    return new IntegrityLevel(value);
  }

  private validate(): void {
    if (this._value < 0 || this._value > 100) {
      throw new Error('Integrity level must be between 0 and 100');
    }
  }

  get value(): number {
    return this._value;
  }

  get status(): 'critical' | 'damaged' | 'operational' | 'excellent' {
    if (this._value < 30) return 'critical';
    if (this._value < 70) return 'damaged';
    if (this._value < 90) return 'operational';
    return 'excellent';
  }

  get color(): string {
    if (this._value < 30) return 'red';
    if (this._value < 70) return 'yellow';
    return 'green';
  }

  equals(other: IntegrityLevel): boolean {
    return this._value === other._value;
  }

  isGreaterThan(other: IntegrityLevel): boolean {
    return this._value > other._value;
  }

  isLessThan(other: IntegrityLevel): boolean {
    return this._value < other._value;
  }

  decrease(amount: number): IntegrityLevel {
    const newValue = Math.max(0, this._value - amount);
    return new IntegrityLevel(newValue);
  }

  increase(amount: number): IntegrityLevel {
    const newValue = Math.min(100, this._value + amount);
    return new IntegrityLevel(newValue);
  }

  isCritical(): boolean {
    return this._value < 30;
  }

  canOperate(): boolean {
    return this._value >= 50;
  }

  canDeploy(): boolean {
    return this._value >= 70;
  }

  toString(): string {
    return `${this._value}%`;
  }

  toJSON(): number {
    return this._value;
  }
}

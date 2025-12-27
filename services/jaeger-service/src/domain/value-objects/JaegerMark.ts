/**
 * JaegerMark Value Object
 * Represents the generation/mark of a Jaeger (e.g., Mark-1, Mark-2, etc.)
 */
export class JaegerMark {
  private static readonly VALID_MARKS = [1, 2, 3, 4, 5, 6, 7];

  private constructor(private readonly _value: number) {
    this.validate();
  }

  static create(value: number): JaegerMark {
    return new JaegerMark(value);
  }

  static fromString(markString: string): JaegerMark {
    // Parse strings like "Mark-3", "Mark 3", "3", etc.
    const cleaned = markString.replace(/[^0-9]/g, '');
    const value = parseInt(cleaned, 10);

    if (isNaN(value)) {
      throw new Error(`Invalid Jaeger Mark format: ${markString}`);
    }

    return new JaegerMark(value);
  }

  private validate(): void {
    if (!JaegerMark.VALID_MARKS.includes(this._value)) {
      throw new Error(
        `Invalid Jaeger Mark: ${this._value}. Valid marks are: ${JaegerMark.VALID_MARKS.join(', ')}`
      );
    }
  }

  get value(): number {
    return this._value;
  }

  toString(): string {
    return `Mark-${this._value}`;
  }

  equals(other: JaegerMark): boolean {
    return this._value === other._value;
  }

  isNewerThan(other: JaegerMark): boolean {
    return this._value > other._value;
  }

  isOlderThan(other: JaegerMark): boolean {
    return this._value < other._value;
  }

  getPowerMultiplier(): number {
    // Each mark is roughly 20% more powerful than the previous
    return 1 + (this._value - 1) * 0.2;
  }

  toJSON(): string {
    return this.toString();
  }
}

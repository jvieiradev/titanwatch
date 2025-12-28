export class Capacity {
  private constructor(
    private readonly _total: number,
    private readonly _current: number
  ) {
    this.validate();
  }

  static create(total: number, current: number = 0): Capacity {
    return new Capacity(total, current);
  }

  private validate(): void {
    if (this._total <= 0) throw new Error('Total capacity must be greater than 0');
    if (this._current < 0) throw new Error('Current capacity cannot be negative');
    if (this._current > this._total) throw new Error('Current capacity cannot exceed total');
  }

  get total(): number {
    return this._total;
  }

  get current(): number {
    return this._current;
  }

  get available(): number {
    return this._total - this._current;
  }

  get utilizationPercent(): number {
    return (this._current / this._total) * 100;
  }

  isFull(): boolean {
    return this._current >= this._total;
  }

  hasSpace(): boolean {
    return this._current < this._total;
  }

  increment(): Capacity {
    return new Capacity(this._total, this._current + 1);
  }

  decrement(): Capacity {
    return new Capacity(this._total, Math.max(0, this._current - 1));
  }
}

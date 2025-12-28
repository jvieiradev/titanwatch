import { Coordinates } from './Coordinates';

export class Location {
  private constructor(
    private readonly _city: string,
    private readonly _country: string,
    private readonly _coordinates: Coordinates
  ) {
    this.validate();
  }

  static create(city: string, country: string, coordinates: Coordinates): Location {
    return new Location(city, country, coordinates);
  }

  private validate(): void {
    if (!this._city || this._city.trim().length === 0) {
      throw new Error('City is required');
    }
    if (!this._country || this._country.trim().length === 0) {
      throw new Error('Country is required');
    }
  }

  get city(): string {
    return this._city;
  }

  get country(): string {
    return this._country;
  }

  get coordinates(): Coordinates {
    return this._coordinates;
  }

  toString(): string {
    return `${this._city}, ${this._country}`;
  }
}

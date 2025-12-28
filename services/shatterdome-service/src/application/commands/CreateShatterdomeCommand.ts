import { Shatterdome, ShatterdomeProps, ShatterdomeStatus } from '../../domain/aggregates/Shatterdome';
import { Location } from '../../domain/value-objects/Location';
import { Capacity } from '../../domain/value-objects/Capacity';
import { Coordinates } from '../../domain/value-objects/Coordinates';
import { IShatterdomeRepository } from '../../domain/repositories/IShatterdomeRepository';

export interface CreateShatterdomeInput {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  totalCapacity: number;
}

export class CreateShatterdomeCommandHandler {
  constructor(private repository: IShatterdomeRepository) {}

  async execute(input: CreateShatterdomeInput): Promise<Shatterdome> {
    const exists = await this.repository.existsByName(input.name);
    if (exists) {
      throw new Error(`Shatterdome "${input.name}" already exists`);
    }

    const coordinates = Coordinates.create(input.latitude, input.longitude);
    const location = Location.create(input.city, input.country, coordinates);
    const capacity = Capacity.create(input.totalCapacity, 0);

    const props: ShatterdomeProps = {
      name: input.name,
      location,
      capacity,
      status: ShatterdomeStatus.UNDER_CONSTRUCTION,
      allocatedJaegers: [],
      establishedDate: new Date(),
    };

    const shatterdome = Shatterdome.create(props);
    return await this.repository.create(shatterdome);
  }
}

import { PostgresShatterdomeRepository } from '../../infrastructure/database/repositories/PostgresShatterdomeRepository';
import { CreateShatterdomeCommandHandler } from '../../application/commands/CreateShatterdomeCommand';
import { AllocateJaegerCommandHandler } from '../../application/commands/AllocateJaegerCommand';
import { GetShatterdomeQueryHandler } from '../../application/queries/GetShatterdomeQuery';
import { ListShatterdomesQueryHandler } from '../../application/queries/ListShatterdomesQuery';

const repository = new PostgresShatterdomeRepository();

export const resolvers = {
  Query: {
    shatterdome: async (_: unknown, { id }: { id: string }) => {
      const handler = new GetShatterdomeQueryHandler(repository);
      const result = await handler.execute(id);
      return result.toJSON();
    },
    shatterdomes: async (_: unknown, filters: any) => {
      const handler = new ListShatterdomesQueryHandler(repository);
      const results = await handler.execute(filters);
      return results.map(r => r.toJSON());
    },
  },
  Mutation: {
    createShatterdome: async (_: unknown, { input }: { input: any }) => {
      const handler = new CreateShatterdomeCommandHandler(repository);
      const result = await handler.execute(input);
      return result.toJSON();
    },
    allocateJaeger: async (_: unknown, { input }: { input: any }) => {
      const handler = new AllocateJaegerCommandHandler(repository);
      const result = await handler.execute(input);
      return result.toJSON();
    },
    deallocateJaeger: async (_: unknown, { input }: { input: any }) => {
      const shatterdome = await repository.findById(input.shatterdomeId);
      if (!shatterdome) throw new Error('Shatterdome not found');
      shatterdome.deallocateJaeger(input.jaegerId);
      const result = await repository.update(shatterdome);
      return result.toJSON();
    },
  },
};

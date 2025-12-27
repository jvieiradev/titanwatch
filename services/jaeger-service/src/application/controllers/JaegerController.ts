import { Request, Response } from 'express';
import { CreateJaegerUseCase } from '../../usecases/CreateJaegerUseCase';
import { GetJaegerUseCase } from '../../usecases/GetJaegerUseCase';
import { ListJaegersUseCase } from '../../usecases/ListJaegersUseCase';
import { UpdateJaegerUseCase } from '../../usecases/UpdateJaegerUseCase';
import { DeleteJaegerUseCase } from '../../usecases/DeleteJaegerUseCase';
import { UpdateIntegrityUseCase } from '../../usecases/UpdateIntegrityUseCase';

export class JaegerController {
  constructor(
    private createUseCase: CreateJaegerUseCase,
    private getUseCase: GetJaegerUseCase,
    private listUseCase: ListJaegersUseCase,
    private updateUseCase: UpdateJaegerUseCase,
    private deleteUseCase: DeleteJaegerUseCase,
    private updateIntegrityUseCase: UpdateIntegrityUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const jaeger = await this.createUseCase.execute(req.body);
    res.status(201).json(jaeger.toJSON());
  }

  async getById(req: Request, res: Response): Promise<void> {
    const jaeger = await this.getUseCase.execute(req.params.id);
    res.json(jaeger.toJSON());
  }

  async list(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10, status, mark, baseLocation } = req.query;
    const result = await this.listUseCase.execute({
      filters: { status: status as string, mark: mark ? Number(mark) : undefined, baseLocation: baseLocation as string },
      pagination: { page: Number(page), limit: Number(limit) },
    });
    res.json({ ...result, data: result.data.map((j) => j.toJSON()) });
  }

  async update(req: Request, res: Response): Promise<void> {
    const jaeger = await this.updateUseCase.execute({ id: req.params.id, ...req.body });
    res.json(jaeger.toJSON());
  }

  async delete(req: Request, res: Response): Promise<void> {
    await this.deleteUseCase.execute(req.params.id);
    res.status(204).send();
  }

  async updateIntegrity(req: Request, res: Response): Promise<void> {
    const jaeger = await this.updateIntegrityUseCase.execute({ id: req.params.id, integrityLevel: req.body.integrityLevel });
    res.json(jaeger.toJSON());
  }
}

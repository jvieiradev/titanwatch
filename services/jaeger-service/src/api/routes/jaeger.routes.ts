import { Router } from 'express';
import { JaegerController } from '../../application/controllers/JaegerController';
import { PostgresJaegerRepository } from '../../infrastructure/database/repositories/PostgresJaegerRepository';
import { CreateJaegerUseCase } from '../../usecases/CreateJaegerUseCase';
import { GetJaegerUseCase } from '../../usecases/GetJaegerUseCase';
import { ListJaegersUseCase } from '../../usecases/ListJaegersUseCase';
import { UpdateJaegerUseCase } from '../../usecases/UpdateJaegerUseCase';
import { DeleteJaegerUseCase } from '../../usecases/DeleteJaegerUseCase';
import { UpdateIntegrityUseCase } from '../../usecases/UpdateIntegrityUseCase';

const router = Router();
const repository = new PostgresJaegerRepository();
const controller = new JaegerController(
  new CreateJaegerUseCase(repository),
  new GetJaegerUseCase(repository),
  new ListJaegersUseCase(repository),
  new UpdateJaegerUseCase(repository),
  new DeleteJaegerUseCase(repository),
  new UpdateIntegrityUseCase(repository)
);

router.post('/', (req, res, next) => controller.create(req, res).catch(next));
router.get('/', (req, res, next) => controller.list(req, res).catch(next));
router.get('/:id', (req, res, next) => controller.getById(req, res).catch(next));
router.put('/:id', (req, res, next) => controller.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => controller.delete(req, res).catch(next));
router.patch('/:id/integrity', (req, res, next) => controller.updateIntegrity(req, res).catch(next));

export default router;

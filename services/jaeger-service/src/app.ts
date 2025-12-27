import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import jaegerRoutes from './api/routes/jaeger.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || '*' }));
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'healthy', service: 'jaeger-service' }));
app.use('/api/v1/jaegers', jaegerRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

export default app;

import 'reflect-metadata';
import 'dotenv/config';
import app from './app';
import { AppDataSource } from './infrastructure/config/data-source';

const PORT = process.env.PORT || 8002;

AppDataSource.initialize()
  .then(() => {
    console.log('✓ Database connected');
    app.listen(PORT, () => {
      console.log(`🚀 Jaeger Service listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  });

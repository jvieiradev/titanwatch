import 'reflect-metadata';
import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from './graphql/resolvers';
import { AppDataSource } from './infrastructure/config/data-source';

const PORT = process.env.PORT || 8003;
const typeDefs = readFileSync(join(__dirname, 'graphql/schema/schema.graphql'), 'utf-8');

async function startServer() {
  await AppDataSource.initialize();
  console.log('✓ Database connected');

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || '*' }));
  app.use(express.json());

  app.get('/health', (_, res) => res.json({ status: 'healthy', service: 'shatterdome-service' }));
  app.use('/graphql', expressMiddleware(server));

  app.listen(PORT, () => {
    console.log(`🚀 Shatterdome Service (GraphQL) listening on port ${PORT}`);
    console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);

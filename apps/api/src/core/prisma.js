import { PrismaClient } from '@prisma/client';
import config from '../config/index.js';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (!config.isProd) {
  globalForPrisma.prisma = prisma;
}

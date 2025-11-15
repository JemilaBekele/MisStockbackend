// eslint-disable-next-line import/no-import-module-exports
const { PrismaClient } = require('../generated/prisma');

class PrismaService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect() {
    await this.prisma.$connect();
    return this.prisma;
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  get client() {
    return this.prisma;
  }
}

module.exports = new PrismaService();

const { PrismaClient } = require('../generated/prisma');
const config = require('../config/config');

class PrismaService {
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.db.url, // Now using your centralized config
        },
      },
    });
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

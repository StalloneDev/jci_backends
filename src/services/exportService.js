const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ExportService {
  async createExport(data) {
    return prisma.export.create({
      data,
      include: {
        requester: true,
      },
    });
  }

  async getExportById(id) {
    return prisma.export.findUnique({
      where: { id },
      include: {
        requester: true,
      },
    });
  }

  async updateExport(id, data) {
    return prisma.export.update({
      where: { id },
      data,
      include: {
        requester: true,
      },
    });
  }

  async deleteExport(id) {
    return prisma.export.delete({
      where: { id },
    });
  }

  async getAllExports(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.requestedBy) {
      where.requestedBy = filters.requestedBy;
    }

    if (filters.startDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.endDate),
      };
    }

    return prisma.export.findMany({
      where,
      include: {
        requester: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserExports(userId) {
    return prisma.export.findMany({
      where: {
        requestedBy: userId,
      },
      include: {
        requester: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getExportStatistics(filters = {}) {
    const where = {};

    if (filters.startDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.endDate),
      };
    }

    const [totalExports, exportsByType, exportsByStatus] = await Promise.all([
      // Total des exports
      prisma.export.count({ where }),

      // Exports par type
      prisma.export.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),

      // Exports par statut
      prisma.export.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      totalExports,
      exportsByType,
      exportsByStatus,
    };
  }
}

module.exports = new ExportService();

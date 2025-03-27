const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommissionService {
  async createCommission(data) {
    return prisma.commission.create({
      data,
      include: {
        history: {
          include: {
            member: true,
          },
        },
      },
    });
  }

  async getCommissionById(id) {
    return prisma.commission.findUnique({
      where: { id },
      include: {
        history: {
          include: {
            member: true,
          },
        },
        meetings: {
          include: {
            reports: true,
          },
        },
      },
    });
  }

  async updateCommission(id, data) {
    return prisma.commission.update({
      where: { id },
      data,
      include: {
        history: {
          include: {
            member: true,
          },
        },
      },
    });
  }

  async deleteCommission(id) {
    return prisma.commission.delete({
      where: { id },
    });
  }

  async getAllCommissions(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.commission.findMany({
      where,
      include: {
        history: {
          include: {
            member: true,
          },
        },
        meetings: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async addMemberToCommission(commissionId, memberId, role) {
    // Vérifier si le membre n'est pas déjà dans la commission
    const existingMembership = await prisma.commissionHistory.findFirst({
      where: {
        commissionId,
        memberId,
        endDate: null,
      },
    });

    if (existingMembership) {
      throw new Error('Member is already in this commission');
    }

    return prisma.commissionHistory.create({
      data: {
        commissionId,
        memberId,
        role,
        startDate: new Date(),
      },
      include: {
        member: true,
        commission: true,
      },
    });
  }

  async removeMemberFromCommission(commissionId, memberId) {
    const membership = await prisma.commissionHistory.findFirst({
      where: {
        commissionId,
        memberId,
        endDate: null,
      },
    });

    if (!membership) {
      throw new Error('Member is not in this commission');
    }

    return prisma.commissionHistory.update({
      where: { id: membership.id },
      data: { endDate: new Date() },
      include: {
        member: true,
        commission: true,
      },
    });
  }

  async getCommissionMembers(commissionId) {
    return prisma.commissionHistory.findMany({
      where: {
        commissionId,
        endDate: null,
      },
      include: {
        member: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async getCommissionMeetings(commissionId, filters = {}) {
    const where = { commissionId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate) {
      where.date = {
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.date = {
        ...where.date,
        lte: new Date(filters.endDate),
      };
    }

    return prisma.meeting.findMany({
      where,
      include: {
        reports: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}

module.exports = new CommissionService();

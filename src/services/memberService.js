const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MemberService {
  // Créer un nouveau membre
  async createMember(memberData) {
    return prisma.member.create({
      data: memberData,
    });
  }

  // Obtenir un membre par ID avec ses relations
  async getMemberById(id) {
    return prisma.member.findUnique({
      where: { id },
      include: {
        user: true,
        roleMandates: true,
        commissionHistory: {
          include: {
            commission: true,
          },
        },
        trainings: true,
        reports: true,
      },
    });
  }

  // Mettre à jour un membre
  async updateMember(id, memberData) {
    return prisma.member.update({
      where: { id },
      data: memberData,
    });
  }

  // Supprimer un membre
  async deleteMember(id) {
    return prisma.member.delete({
      where: { id },
    });
  }

  // Rechercher des membres
  async searchMembers(filters) {
    const where = {};

    if (filters.name) {
      where.OR = [
        { firstName: { contains: filters.name, mode: 'insensitive' } },
        { lastName: { contains: filters.name, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    return prisma.member.findMany({
      where,
      include: {
        roleMandates: {
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  // Obtenir les commissions d'un membre
  async getMemberCommissions(memberId) {
    return prisma.commissionHistory.findMany({
      where: {
        memberId,
        endDate: null, // Commissions actives
      },
      include: {
        commission: true,
      },
    });
  }

  // Obtenir les formations données par un membre
  async getMemberTrainings(memberId) {
    return prisma.training.findMany({
      where: {
        trainer: memberId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}

module.exports = new MemberService();

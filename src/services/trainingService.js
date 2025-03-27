const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TrainingService {
  async createTraining(data) {
    return prisma.training.create({
      data,
      include: {
        trainerMember: true,
      },
    });
  }

  async getTrainingById(id) {
    return prisma.training.findUnique({
      where: { id },
      include: {
        trainerMember: true,
      },
    });
  }

  async updateTraining(id, data) {
    return prisma.training.update({
      where: { id },
      data,
      include: {
        trainerMember: true,
      },
    });
  }

  async deleteTraining(id) {
    return prisma.training.delete({
      where: { id },
    });
  }

  async getAllTrainings(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.trainer) {
      where.trainer = filters.trainer;
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

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.training.findMany({
      where,
      include: {
        trainerMember: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getTrainerStatistics(trainerId) {
    const [totalTrainings, upcomingTrainings, pastTrainings] = await Promise.all([
      // Total des formations
      prisma.training.count({
        where: { trainer: trainerId },
      }),

      // Formations à venir
      prisma.training.count({
        where: {
          trainer: trainerId,
          date: {
            gt: new Date(),
          },
        },
      }),

      // Formations passées
      prisma.training.count({
        where: {
          trainer: trainerId,
          date: {
            lt: new Date(),
          },
        },
      }),
    ]);

    return {
      totalTrainings,
      upcomingTrainings,
      pastTrainings,
    };
  }

  async getUpcomingTrainings() {
    return prisma.training.findMany({
      where: {
        date: {
          gt: new Date(),
        },
        status: 'ACTIVE',
      },
      include: {
        trainerMember: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async searchTrainers(search) {
    return prisma.member.findMany({
      where: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
        trainings: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            trainings: true,
          },
        },
      },
    });
  }
}

module.exports = new TrainingService();

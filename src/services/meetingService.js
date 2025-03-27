const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MeetingService {
  async createMeeting(data) {
    return prisma.meeting.create({
      data,
      include: {
        commission: true,
        reports: {
          include: {
            submitter: true,
            approver: true,
            attachments: true,
          },
        },
      },
    });
  }

  async getMeetingById(id) {
    return prisma.meeting.findUnique({
      where: { id },
      include: {
        commission: true,
        reports: {
          include: {
            submitter: true,
            approver: true,
            attachments: true,
          },
        },
      },
    });
  }

  async updateMeeting(id, data) {
    return prisma.meeting.update({
      where: { id },
      data,
      include: {
        commission: true,
        reports: true,
      },
    });
  }

  async deleteMeeting(id) {
    return prisma.meeting.delete({
      where: { id },
    });
  }

  async getAllMeetings(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.commissionId) {
      where.commissionId = filters.commissionId;
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

    return prisma.meeting.findMany({
      where,
      include: {
        commission: true,
        reports: {
          include: {
            submitter: true,
            approver: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async addReport(meetingId, reportData) {
    return prisma.report.create({
      data: {
        ...reportData,
        meetingId,
      },
      include: {
        submitter: true,
        approver: true,
        attachments: true,
      },
    });
  }

  async updateReport(reportId, reportData) {
    return prisma.report.update({
      where: { id: reportId },
      data: reportData,
      include: {
        submitter: true,
        approver: true,
        attachments: true,
      },
    });
  }

  async deleteReport(reportId) {
    return prisma.report.delete({
      where: { id: reportId },
    });
  }

  async addAttachment(reportId, attachmentData) {
    return prisma.attachment.create({
      data: {
        ...attachmentData,
        reportId,
      },
    });
  }

  async removeAttachment(attachmentId) {
    return prisma.attachment.delete({
      where: { id: attachmentId },
    });
  }

  async getMeetingStatistics(filters = {}) {
    const where = {};

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

    const [totalMeetings, meetingsByType, meetingsByCommission] = await Promise.all([
      // Total des réunions
      prisma.meeting.count({ where }),

      // Réunions par type
      prisma.meeting.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),

      // Réunions par commission
      prisma.meeting.groupBy({
        by: ['commissionId'],
        where,
        _count: true,
      }),
    ]);

    return {
      totalMeetings,
      meetingsByType,
      meetingsByCommission,
    };
  }
}

module.exports = new MeetingService();

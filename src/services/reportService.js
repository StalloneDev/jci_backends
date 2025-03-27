const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReportService {
  async createReport(data) {
    return prisma.report.create({
      data,
      include: {
        meeting: true,
        submitter: true,
        approver: true,
        attachments: true,
      },
    });
  }

  async getReportById(id) {
    return prisma.report.findUnique({
      where: { id },
      include: {
        meeting: true,
        submitter: true,
        approver: true,
        attachments: true,
      },
    });
  }

  async updateReport(id, data) {
    return prisma.report.update({
      where: { id },
      data,
      include: {
        meeting: true,
        submitter: true,
        approver: true,
        attachments: true,
      },
    });
  }

  async deleteReport(id) {
    return prisma.report.delete({
      where: { id },
    });
  }

  async getAllReports(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.submittedBy) {
      where.submittedBy = filters.submittedBy;
    }

    if (filters.approvedBy) {
      where.approvedBy = filters.approvedBy;
    }

    if (filters.meetingId) {
      where.meetingId = filters.meetingId;
    }

    if (filters.search) {
      where.content = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return prisma.report.findMany({
      where,
      include: {
        meeting: true,
        submitter: true,
        approver: true,
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approveReport(id, approverId) {
    return prisma.report.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: approverId,
      },
      include: {
        meeting: true,
        submitter: true,
        approver: true,
        attachments: true,
      },
    });
  }

  async rejectReport(id, approverId, reason) {
    return prisma.report.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: approverId,
        content: prisma.report.findUnique({
          where: { id },
          select: { content: true },
        }).then(report => report.content + `\n\nRejection reason: ${reason}`),
      },
      include: {
        meeting: true,
        submitter: true,
        approver: true,
        attachments: true,
      },
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

  async getReportStatistics(filters = {}) {
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

    const [totalReports, reportsByStatus, reportsByType] = await Promise.all([
      // Total des rapports
      prisma.report.count({ where }),

      // Rapports par statut
      prisma.report.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      // Rapports par type
      prisma.report.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
    ]);

    return {
      totalReports,
      reportsByStatus,
      reportsByType,
    };
  }
}

module.exports = new ReportService();

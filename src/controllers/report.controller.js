const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs').promises;

const prisma = new PrismaClient();

exports.createReport = async (req, res) => {
  try {
    const { title, description, type, content } = req.body;
    const files = req.files;
    const authorId = req.user.id;
    const status = 'DRAFT';

    const report = await prisma.report.create({
      data: {
        title,
        description,
        type,
        content,
        authorId,
        status
      }
    });

    if (files && files.length > 0) {
      const uploadDir = path.join(__dirname, '../../uploads/reports', report.id.toString());
      await fs.mkdir(uploadDir, { recursive: true });

      const attachments = await Promise.all(files.map(async file => {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, file.buffer);

        return prisma.attachment.create({
          data: {
            reportId: report.id,
            fileName: file.originalname,
            filePath: filePath,
            fileSize: file.size,
            mimeType: file.mimetype
          }
        });
      }));

      report.attachments = attachments;
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        attachments: true
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, content, status } = req.body;
    const files = req.files;

    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        attachments: true
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.authorId !== req.user.id && !req.user.roles.some(role => role.name === 'ADMIN')) {
      return res.status(403).json({ error: 'Unauthorized to update this report' });
    }

    await prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        type,
        content,
        status: status || report.status,
        updatedAt: new Date()
      }
    });

    if (files && files.length > 0) {
      const uploadDir = path.join(__dirname, '../../uploads/reports', report.id.toString());
      await fs.mkdir(uploadDir, { recursive: true });

      const attachments = await Promise.all(files.map(async file => {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, file.buffer);

        return prisma.attachment.create({
          data: {
            reportId: report.id,
            fileName: file.originalname,
            filePath: filePath,
            fileSize: file.size,
            mimeType: file.mimetype
          }
        });
      }));

      report.attachments = attachments;
    }

    res.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: {
        attachments: true
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.authorId !== req.user.id && !req.user.roles.some(role => role.name === 'ADMIN')) {
      return res.status(403).json({ error: 'Unauthorized to delete this report' });
    }

    // Supprimer les fichiers attachés
    const uploadDir = path.join(__dirname, '../../uploads/reports', report.id.toString());
    await fs.rm(uploadDir, { recursive: true, force: true });

    await prisma.report.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};

exports.reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const reviewerId = req.user.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status !== 'SUBMITTED') {
      return res.status(400).json({ error: 'Report must be submitted to be reviewed' });
    }

    await prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        status,
        reviewerId,
        reviewedAt: new Date(),
        reviewComments: comments
      }
    });

    res.json(report);
  } catch (error) {
    console.error('Error reviewing report:', error);
    res.status(500).json({ error: 'Failed to review report' });
  }
};

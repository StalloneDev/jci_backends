const { Export, User, Member, Training, Commission, Meeting } = require('../models');
const { ValidationError, Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const {
  generateReportPDF,
  generateMeetingMinutesPDF,
  generateReportsExcel,
  generateMeetingsExcel
} = require('../utils/exportUtils');
const PDFDocument = require('pdfkit');
const Excel = require('exceljs');

exports.createExport = async (req, res) => {
  try {
    const { type, format = 'EXCEL', filters } = req.body;

    const export_ = await Export.create({
      type,
      format,
      filters,
      userId: req.user.id,
      status: 'PENDING',
      fileName: `${type.toLowerCase()}_${Date.now()}.${format.toLowerCase()}`,
      filePath: path.join(__dirname, '../../exports', `${type.toLowerCase()}_${Date.now()}.${format.toLowerCase()}`)
    });

    // Lancer le processus d'export de manière asynchrone
    processExport(export_).catch(error => {
      console.error(`Export error for ${export_.id}:`, error);
      export_.update({
        status: 'FAILED',
        error: error.message
      });
    });

    res.status(201).json(export_);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Create export error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'export' });
  }
};

const processExport = async (export_) => {
  try {
    const filters = export_.filters || {};
    let data;
    let workbook;
    let doc;

    // Récupération des données selon le type
    switch (export_.type) {
      case 'MEMBERS':
        data = await Member.findAll({
          where: filters,
          include: [{ all: true }]
        });
        break;
      case 'TRAININGS':
        data = await Training.findAll({
          where: filters,
          include: [{ all: true }]
        });
        break;
      case 'COMMISSIONS':
        data = await Commission.findAll({
          where: filters,
          include: [{ all: true }]
        });
        break;
      case 'MEETINGS':
        data = await Meeting.findAll({
          where: filters,
          include: [{ all: true }]
        });
        break;
      default:
        throw new Error('Type d\'export non supporté');
    }

    // Création du fichier selon le format
    switch (export_.format) {
      case 'PDF':
        doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(export_.filePath));
        
        if (export_.type === 'MEETINGS') {
          await generateMeetingMinutesPDF(doc, data);
        } else {
          // TODO: Implémenter d'autres types de PDF
        }
        
        doc.end();
        break;

      case 'EXCEL':
        workbook = new Excel.Workbook();
        
        if (export_.type === 'MEETINGS') {
          await generateMeetingsExcel(workbook, data);
        } else if (export_.type === 'REPORTS') {
          await generateReportsExcel(workbook, data);
        } else {
          // Génération générique pour les autres types
          const worksheet = workbook.addWorksheet(export_.type);
          if (data.length > 0) {
            // Utiliser les clés du premier élément comme en-têtes
            const headers = Object.keys(data[0].toJSON());
            worksheet.columns = headers.map(header => ({
              header,
              key: header,
              width: 20
            }));
            
            // Ajouter les données
            data.forEach(item => {
              worksheet.addRow(item.toJSON());
            });
          }
        }
        
        await workbook.xlsx.writeFile(export_.filePath);
        break;

      case 'CSV':
        workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        
        if (data.length > 0) {
          const headers = Object.keys(data[0].toJSON());
          worksheet.columns = headers.map(header => ({
            header,
            key: header,
            width: 20
          }));
          
          data.forEach(item => {
            worksheet.addRow(item.toJSON());
          });
        }
        
        await workbook.csv.writeFile(export_.filePath);
        break;

      default:
        throw new Error('Format d\'export non supporté');
    }

    await export_.update({
      status: 'COMPLETED',
      completedAt: new Date()
    });
  } catch (error) {
    await export_.update({
      status: 'FAILED',
      error: error.message
    });
    throw error;
  }
};

exports.getExports = async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;
    const where = { userId: req.user.id };

    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const exports = await Export.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(exports);
  } catch (error) {
    console.error('Get exports error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des exports' });
  }
};

exports.getExport = async (req, res) => {
  try {
    const { id } = req.params;
    const export_ = await Export.findByPk(id);

    if (!export_) {
      return res.status(404).json({ message: 'Export non trouvé' });
    }

    if (export_.userId !== req.user.id && !req.user.roles.some(role => role.name === 'ADMIN')) {
      return res.status(403).json({ message: 'Non autorisé à accéder à cet export' });
    }

    res.json(export_);
  } catch (error) {
    console.error('Get export error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'export' });
  }
};

exports.downloadExport = async (req, res) => {
  try {
    const { id } = req.params;
    const export_ = await Export.findByPk(id);

    if (!export_) {
      return res.status(404).json({ message: 'Export non trouvé' });
    }

    if (export_.userId !== req.user.id && !req.user.roles.some(role => role.name === 'ADMIN')) {
      return res.status(403).json({ message: 'Non autorisé à télécharger cet export' });
    }

    if (export_.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'L\'export n\'est pas encore terminé' });
    }

    res.download(export_.filePath, export_.fileName);
  } catch (error) {
    console.error('Download export error:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement de l\'export' });
  }
};

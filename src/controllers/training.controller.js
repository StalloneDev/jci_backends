const { Training, Member, Commission } = require('../models/associations');
const { Op } = require('sequelize');
const createError = require('http-errors');

exports.createTraining = async (req, res, next) => {
  try {
    const training = await Training.create(req.body);
    res.status(201).json(training);
  } catch (error) {
    next(error);
  }
};

exports.getAllTrainings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      startDate,
      endDate,
      commissionId
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (commissionId) where.commissionId = commissionId;

    if (startDate && endDate) {
      where.startDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await Training.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Member,
          as: 'trainer',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Commission,
          as: 'commission',
          attributes: ['id', 'name']
        }
      ],
      order: [['startDate', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      trainings: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrainingById = async (req, res, next) => {
  try {
    const training = await Training.findByPk(req.params.id, {
      include: [
        {
          model: Member,
          as: 'trainer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Member,
          through: { attributes: [] },
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Commission,
          as: 'commission',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    if (!training) {
      throw createError(404, 'Formation non trouvée');
    }

    res.json(training);
  } catch (error) {
    next(error);
  }
};

exports.updateTraining = async (req, res, next) => {
  try {
    const training = await Training.findByPk(req.params.id);

    if (!training) {
      throw createError(404, 'Formation non trouvée');
    }

    await training.update(req.body);
    res.json(training);
  } catch (error) {
    next(error);
  }
};

exports.deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findByPk(req.params.id);

    if (!training) {
      throw createError(404, 'Formation non trouvée');
    }

    await training.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.registerParticipant = async (req, res, next) => {
  try {
    const { trainingId, memberId } = req.params;
    const training = await Training.findByPk(trainingId);
    const member = await Member.findByPk(memberId);

    if (!training || !member) {
      throw createError(404, 'Formation ou membre non trouvé');
    }

    // Vérifier si le nombre maximum de participants n'est pas atteint
    const currentParticipants = await training.countMembers();
    if (training.maxParticipants && currentParticipants >= training.maxParticipants) {
      throw createError(400, 'Le nombre maximum de participants est atteint');
    }

    await training.addMember(member);
    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    next(error);
  }
};

exports.unregisterParticipant = async (req, res, next) => {
  try {
    const { trainingId, memberId } = req.params;
    const training = await Training.findByPk(trainingId);
    const member = await Member.findByPk(memberId);

    if (!training || !member) {
      throw createError(404, 'Formation ou membre non trouvé');
    }

    await training.removeMember(member);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.getTrainingParticipants = async (req, res, next) => {
  try {
    const training = await Training.findByPk(req.params.id, {
      include: [{
        model: Member,
        through: { attributes: [] },
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!training) {
      throw createError(404, 'Formation non trouvée');
    }

    res.json(training.Members);
  } catch (error) {
    next(error);
  }
};

exports.updateTrainingMaterials = async (req, res, next) => {
  try {
    const training = await Training.findByPk(req.params.id);

    if (!training) {
      throw createError(404, 'Formation non trouvée');
    }

    if (!req.files || req.files.length === 0) {
      throw createError(400, 'Aucun fichier fourni');
    }

    const materials = req.files.map(file => `/uploads/trainings/${file.filename}`);
    await training.update({
      materials: [...(training.materials || []), ...materials]
    });

    res.json({ materials: training.materials });
  } catch (error) {
    next(error);
  }
};

const { Commission, Member, Meeting, Training, CommissionHistory } = require('../models/associations');
const { Op } = require('sequelize');
const createError = require('http-errors');

exports.createCommission = async (req, res, next) => {
  try {
    const commission = await Commission.create(req.body);
    res.status(201).json(commission);
  } catch (error) {
    next(error);
  }
};

exports.getAllCommissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows } = await Commission.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: Member,
        through: { attributes: ['role'] }
      }]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      commissions: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getCommissionById = async (req, res, next) => {
  try {
    const commission = await Commission.findByPk(req.params.id, {
      include: [
        {
          model: Member,
          through: { attributes: ['role'] }
        },
        {
          model: Meeting,
          as: 'meetings'
        },
        {
          model: Training,
          as: 'trainings'
        },
        {
          model: CommissionHistory,
          as: 'history',
          include: [{
            model: Member,
            as: 'member'
          }]
        }
      ]
    });

    if (!commission) {
      throw createError(404, 'Commission non trouvée');
    }

    res.json(commission);
  } catch (error) {
    next(error);
  }
};

exports.updateCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findByPk(req.params.id);

    if (!commission) {
      throw createError(404, 'Commission non trouvée');
    }

    await commission.update(req.body);
    res.json(commission);
  } catch (error) {
    next(error);
  }
};

exports.deleteCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findByPk(req.params.id);

    if (!commission) {
      throw createError(404, 'Commission non trouvée');
    }

    await commission.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.getCommissionMembers = async (req, res, next) => {
  try {
    const commission = await Commission.findByPk(req.params.id, {
      include: [{
        model: Member,
        through: { attributes: ['role', 'startDate'] }
      }]
    });

    if (!commission) {
      throw createError(404, 'Commission non trouvée');
    }

    res.json(commission.Members);
  } catch (error) {
    next(error);
  }
};

exports.updateMemberRole = async (req, res, next) => {
  try {
    const { commissionId, memberId } = req.params;
    const { role } = req.body;

    const commission = await Commission.findByPk(commissionId);
    const member = await Member.findByPk(memberId);

    if (!commission || !member) {
      throw createError(404, 'Commission ou membre non trouvé');
    }

    // Mettre à jour le rôle dans la table de jointure
    await commission.addMember(member, {
      through: { role }
    });

    // Créer un nouvel enregistrement dans l'historique
    await CommissionHistory.create({
      commissionId,
      memberId,
      role,
      startDate: new Date(),
      status: 'ACTIVE'
    });

    res.json({ message: 'Rôle mis à jour avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.getCommissionHistory = async (req, res, next) => {
  try {
    const history = await CommissionHistory.findAll({
      where: { commissionId: req.params.id },
      include: [{
        model: Member,
        as: 'member'
      }],
      order: [['startDate', 'DESC']]
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

const { Member, Commission, Training, Meeting } = require('../models/associations');
const { Op } = require('sequelize');
const createError = require('http-errors');

exports.createMember = async (req, res, next) => {
  try {
    const memberData = req.body;
    
    // Vérifier si l'email existe déjà
    const existingMember = await Member.findOne({
      where: { email: memberData.email }
    });

    if (existingMember) {
      throw createError(400, 'Un membre avec cet email existe déjà');
    }

    const member = await Member.create(memberData);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

exports.getAllMembers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      commissionId
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.membershipStatus = status;
    }

    const query = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: []
    };

    if (commissionId) {
      query.include.push({
        model: Commission,
        where: { id: commissionId },
        through: { attributes: [] }
      });
    }

    const { count, rows } = await Member.findAndCountAll(query);

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      members: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        {
          model: Commission,
          through: { attributes: [] }
        },
        {
          model: Training,
          as: 'trainingsGiven'
        },
        {
          model: Training,
          through: { attributes: [] }
        },
        {
          model: Meeting,
          through: { attributes: [] }
        }
      ]
    });

    if (!member) {
      throw createError(404, 'Membre non trouvé');
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      throw createError(404, 'Membre non trouvé');
    }

    // Vérifier si l'email est déjà utilisé par un autre membre
    if (req.body.email && req.body.email !== member.email) {
      const existingMember = await Member.findOne({
        where: { email: req.body.email }
      });

      if (existingMember) {
        throw createError(400, 'Un membre avec cet email existe déjà');
      }
    }

    await member.update(req.body);
    res.json(member);
  } catch (error) {
    next(error);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      throw createError(404, 'Membre non trouvé');
    }

    await member.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.addMemberToCommission = async (req, res, next) => {
  try {
    const { memberId, commissionId, role } = req.body;
    const member = await Member.findByPk(memberId);
    const commission = await Commission.findByPk(commissionId);

    if (!member || !commission) {
      throw createError(404, 'Membre ou commission non trouvé');
    }

    await member.addCommission(commission, {
      through: { role, startDate: new Date() }
    });

    res.status(201).json({ message: 'Membre ajouté à la commission avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.removeMemberFromCommission = async (req, res, next) => {
  try {
    const { memberId, commissionId } = req.params;
    const member = await Member.findByPk(memberId);
    const commission = await Commission.findByPk(commissionId);

    if (!member || !commission) {
      throw createError(404, 'Membre ou commission non trouvé');
    }

    await member.removeCommission(commission);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.getMemberCommissions = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [{
        model: Commission,
        through: { attributes: ['role', 'startDate'] }
      }]
    });

    if (!member) {
      throw createError(404, 'Membre non trouvé');
    }

    res.json(member.Commissions);
  } catch (error) {
    next(error);
  }
};

exports.updateMemberProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, 'Aucune image fournie');
    }

    const member = await Member.findByPk(req.params.id);
    if (!member) {
      throw createError(404, 'Membre non trouvé');
    }

    const profilePicture = `/uploads/members/${req.file.filename}`;
    await member.update({ profilePicture });

    res.json({ profilePicture });
  } catch (error) {
    next(error);
  }
};

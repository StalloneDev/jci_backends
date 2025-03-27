const { Meeting, Member, Commission } = require('../models/associations');
const { Op } = require('sequelize');
const createError = require('http-errors');

exports.createMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
};

exports.getAllMeetings = async (req, res, next) => {
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
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) where.status = status;
    if (type) where.meetingType = type;
    if (commissionId) where.commissionId = commissionId;

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await Meeting.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Member,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Commission,
          as: 'commission',
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC'], ['startTime', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      meetings: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [
        {
          model: Member,
          as: 'creator',
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

    if (!meeting) {
      throw createError(404, 'Réunion non trouvée');
    }

    res.json(meeting);
  } catch (error) {
    next(error);
  }
};

exports.updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      throw createError(404, 'Réunion non trouvée');
    }

    // Vérifier si l'utilisateur est le créateur ou un admin
    if (meeting.createdBy !== req.user.id && !req.user.isAdmin) {
      throw createError(403, 'Non autorisé à modifier cette réunion');
    }

    await meeting.update(req.body);
    res.json(meeting);
  } catch (error) {
    next(error);
  }
};

exports.deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      throw createError(404, 'Réunion non trouvée');
    }

    // Vérifier si l'utilisateur est le créateur ou un admin
    if (meeting.createdBy !== req.user.id && !req.user.isAdmin) {
      throw createError(403, 'Non autorisé à supprimer cette réunion');
    }

    await meeting.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.addParticipant = async (req, res, next) => {
  try {
    const { meetingId, memberId } = req.params;
    const meeting = await Meeting.findByPk(meetingId);
    const member = await Member.findByPk(memberId);

    if (!meeting || !member) {
      throw createError(404, 'Réunion ou membre non trouvé');
    }

    await meeting.addMember(member);
    res.status(201).json({ message: 'Participant ajouté avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.removeParticipant = async (req, res, next) => {
  try {
    const { meetingId, memberId } = req.params;
    const meeting = await Meeting.findByPk(meetingId);
    const member = await Member.findByPk(memberId);

    if (!meeting || !member) {
      throw createError(404, 'Réunion ou membre non trouvé');
    }

    await meeting.removeMember(member);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.getParticipants = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [{
        model: Member,
        through: { attributes: [] },
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!meeting) {
      throw createError(404, 'Réunion non trouvée');
    }

    res.json(meeting.Members);
  } catch (error) {
    next(error);
  }
};

exports.updateMinutes = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      throw createError(404, 'Réunion non trouvée');
    }

    if (!req.body.minutes) {
      throw createError(400, 'Le compte-rendu est requis');
    }

    await meeting.update({
      minutes: req.body.minutes,
      status: 'COMPLETED'
    });

    res.json(meeting);
  } catch (error) {
    next(error);
  }
};

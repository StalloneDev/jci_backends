const { RoleMandate, Member } = require('../models');
const { validateMandate } = require('../validators/mandateValidator');
const { ApiError } = require('../utils/errors');
const { sequelize } = require('../config/database');
const { clearCache } = require('../config/cache');

const mandateController = {
  async getMemberMandates(req, res, next) {
    try {
      const { id: memberId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Vérifier si le membre existe
      const member = await Member.findByPk(memberId);
      if (!member) {
        throw new ApiError(404, 'Membre non trouvé');
      }

      // Pagination et optimisation des requêtes
      const offset = (page - 1) * limit;
      const { count, rows: mandates } = await RoleMandate.findAndCountAll({
        where: { memberId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['startDate', 'DESC']],
        attributes: ['id', 'role', 'startDate', 'endDate', 'isActive'],
      });

      const result = {
        mandates,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
        },
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async addMandate(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id: memberId } = req.params;
      const mandateData = await validateMandate(req.body);

      // Vérifier les chevauchements dans une transaction
      const overlappingMandates = await RoleMandate.findAll({
        where: {
          memberId,
          role: mandateData.role,
          isActive: true,
          [sequelize.Op.or]: [
            {
              startDate: {
                [sequelize.Op.between]: [mandateData.startDate, mandateData.endDate],
              },
            },
            {
              endDate: {
                [sequelize.Op.between]: [mandateData.startDate, mandateData.endDate],
              },
            },
          ],
        },
        transaction,
      });

      if (overlappingMandates.length > 0) {
        await transaction.rollback();
        throw new ApiError(400, 'Ce mandat chevauche un mandat existant');
      }

      const mandate = await RoleMandate.create(
        {
          ...mandateData,
          memberId,
        },
        { transaction }
      );

      await transaction.commit();

      // Invalider le cache
      clearCache(`/members/${memberId}/mandates`);

      res.status(201).json({ mandate });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },

  async updateMandate(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id: memberId, mandateId } = req.params;
      const updates = req.body;

      const mandate = await RoleMandate.findOne({
        where: { id: mandateId, memberId },
        transaction,
      });

      if (!mandate) {
        await transaction.rollback();
        throw new ApiError(404, 'Mandat non trouvé');
      }

      // Vérifier les chevauchements si nécessaire
      if (updates.startDate || updates.endDate) {
        const overlappingMandates = await RoleMandate.findAll({
          where: {
            memberId,
            role: mandate.role,
            isActive: true,
            id: { [sequelize.Op.ne]: mandateId },
            [sequelize.Op.or]: [
              {
                startDate: {
                  [sequelize.Op.between]: [
                    updates.startDate || mandate.startDate,
                    updates.endDate || mandate.endDate,
                  ],
                },
              },
              {
                endDate: {
                  [sequelize.Op.between]: [
                    updates.startDate || mandate.startDate,
                    updates.endDate || mandate.endDate,
                  ],
                },
              },
            ],
          },
          transaction,
        });

        if (overlappingMandates.length > 0) {
          await transaction.rollback();
          throw new ApiError(400, 'Cette modification créerait un chevauchement');
        }
      }

      await mandate.update(updates, { transaction });
      await transaction.commit();

      // Invalider le cache
      clearCache(`/members/${memberId}/mandates`);

      res.json({ mandate });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },

  async deleteMandate(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id: memberId, mandateId } = req.params;

      const mandate = await RoleMandate.findOne({
        where: { id: mandateId, memberId },
        transaction,
      });

      if (!mandate) {
        await transaction.rollback();
        throw new ApiError(404, 'Mandat non trouvé');
      }

      await mandate.destroy({ transaction });
      await transaction.commit();

      // Invalider le cache
      clearCache(`/members/${memberId}/mandates`);

      res.status(204).end();
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },
};

module.exports = mandateController;

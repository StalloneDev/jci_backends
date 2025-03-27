const Joi = require('joi');
const { ApiError } = require('../utils/errors');

const mandateSchema = Joi.object({
  role: Joi.string()
    .valid('PRESIDENT', 'VICE_PRESIDENT_COMMISSIONS', 'SECRETARY', 'TREASURER', 'MEMBER')
    .required()
    .messages({
      'any.required': 'Le rôle est requis',
      'string.empty': 'Le rôle ne peut pas être vide',
      'any.only': 'Le rôle doit être valide',
    }),

  startDate: Joi.date()
    .required()
    .messages({
      'any.required': 'La date de début est requise',
      'date.base': 'La date de début doit être une date valide',
    }),

  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'any.required': 'La date de fin est requise',
      'date.base': 'La date de fin doit être une date valide',
      'date.min': 'La date de fin doit être après la date de début',
    }),

  isActive: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Le statut actif doit être un booléen',
    }),
});

exports.validateMandate = async (data) => {
  try {
    return await mandateSchema.validateAsync(data, { abortEarly: false });
  } catch (error) {
    throw new ApiError(400, 'Validation error', error.details);
  }
};

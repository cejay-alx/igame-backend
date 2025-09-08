import Joi from 'joi';

export const updateGame = Joi.object({
	chosen_number: Joi.number().integer().min(1).max(9).required(),
	game_id: Joi.string().uuid().required(),
}).options({ stripUnknown: true });

export const manageGame = Joi.object({
	game_id: Joi.string().uuid().required(),
});

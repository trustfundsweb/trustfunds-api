const Joi = require("joi");
const causesList = require("../campaignModel");

const campaignCreationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    title: Joi.string().required(),
    story: Joi.array().items(Joi.string()).required(),
    goal: Joi.number().required(),
    endDate: Joi.string().required(),
    image: Joi.string().uri().required(),
    causeType: Joi.string().required(),
  });
  return schema.validate(data);
};

module.exports = campaignCreationValidation;

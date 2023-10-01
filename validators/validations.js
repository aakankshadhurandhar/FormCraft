const Joi = require('joi');




module.exports.validateFormResponse = function (form, formResponse) {
  const inputSchema = {};
  form.inputs.forEach((input) => {
    const inputLabel = input.label

    if (input.type == "small-text") {
      inputSchema[inputLabel] = Joi.string()
        .min(input.minLength)
        .max(input.maxLength)
        .required()
        
    } else if (input.type == "long-text") {
      inputSchema[inputLabel] = Joi.string()
        .min(input.minLength)
        .max(input.maxLength)
        .required()

    } else if (input.type == "number") {
      inputSchema[inputLabel] = Joi.string()
        .min(input.minValue)
        .max(input.maxValue)
        .required()

    } else if (input.type == "email") {
      inputSchema[inputLabel] = Joi.string().email().required();

    } else if (input.type == "multi-select") {
      inputSchema[inputLabel] = Joi.array()
        .items(
          Joi.string().valid(...input.options.map((option) => option.value))
        )
        .required()

    } else if (input.type == "radio") {
      inputSchema[inputLabel] = Joi.string()
        .valid(...input.options.map((option) => option.value))
        .required()
        
    }
  });

  const formSchema = Joi.object(inputSchema);
  return formSchema.validate(formResponse);
}




// Define a Joi schema for the form input options
const inputOptionSchema = Joi.object({
  label: Joi.string().required(),
  value: Joi.string().required(),
});

// Define a Joi schema for the form input
const formInputSchema = Joi.object({
  type: Joi.string().valid(
    'small-text', 'long-text', 'number', 'email', 'multi-select', 'radio'
  ).required(),
  label: Joi.string().required(),
  minLength: Joi.number().when('type', { is: 'small-text', then: Joi.optional() }),
  maxLength: Joi.number().when('type', { is: Joi.any().valid('small-text', 'long-text'), then:  Joi.optional() }),
  minValue: Joi.number().when('type', { is: 'number', then: Joi.required() }),
  maxValue: Joi.number().when('type', { is: 'number', then: Joi.required() }),
  options: Joi.array().items(inputOptionSchema).when('type', { 
    is: Joi.any().valid('multi-select', 'radio'), 
    then: Joi.required() 
  }),
});

// Define a Joi schema for the form page
const formPageSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string(),
  created: Joi.date(),
  modified: Joi.date(),
  expiry: Joi.date(),
  inputs: Joi.array().items(formInputSchema),
});

module.exports = { formPageSchema };

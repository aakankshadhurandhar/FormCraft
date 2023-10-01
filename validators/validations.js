const Joi = require("joi");

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



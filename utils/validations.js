const Joi = require('joi')

/**
 * Checks if a given pattern is a valid regular expression
 * @param {string} pattern - The pattern to validate
 * @returns {boolean} - Returns true if the pattern is a valid regular expression, false otherwise
 */
function isValidRegex(pattern) {
  try {
    new RegExp(pattern)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Returns a validation function for file uploads
 * @param {number} maxFileSizeKB - The maximum file size allowed in kilobytes
 * @param {number} maxFilesAllowed - The maximum number of files allowed
 * @returns {function} - Returns a validation function that takes an array of files and returns an error if the total file size or number of files exceeds the specified limits
 */
const fileValidationHelper = (maxFileSizeKB, maxFilesAllowed) => {
  return (files, helpers) => {
    const totalSizeKB = files.reduce((total, file) => total + file.sizeInKB, 0)

    if (totalSizeKB > maxFileSizeKB) {
      return helpers.error('any.custom', {
        message: `Total file size exceeds ${maxFileSizeKB} KB`,
      })
    }
    if (maxFilesAllowed < files.length) {
      return helpers.error('any.custom', {
        message: `File Count exceeds maximum files allowed (${maxFilesAllowed}) `,
      })
    }
    return files
  }
}

/**
 * Validates a form response against a given form schema
 * @param {object} form - The form schema to validate against
 * @param {object} formResponse - The form response to validate
 * @returns {object} - Returns an object with an error property if the form response is invalid, otherwise returns the validated form response
 */
function validateFormResponse(form, formResponse) {
  const inputSchema = {}
  form.inputs.forEach((input) => {
    const inputLabel = input.label

    // Create a base schema for the input type
    let baseSchema

    switch (input.type) {
      case 'small-text':
        baseSchema = Joi.string()
          .min(input.minLength)
          .max(input.maxLength)
          .required()
        break
      case 'long-text':
        baseSchema = Joi.string()
          .min(input.minLength)
          .max(input.maxLength)
          .required()
        break
      case 'number':
        baseSchema = Joi.number()
          .min(input.minValue)
          .max(input.maxValue)
          .required()
        break
      case 'email':
        baseSchema = Joi.string().email().required()
        break
      case 'multi-select':
        baseSchema = Joi.alternatives(
          Joi.array()
            .items(
              Joi.string().valid(
                ...input.options.map((option) => option.value),
              ),
            )
            .min(1) // Require at least one selection if it's an array
            .required(),
          Joi.string()
            .valid(...input.options.map((option) => option.value))
            .required(),
        )
        break
      case 'radio':
        baseSchema = Joi.string()
          .valid(...input.options.map((option) => option.value))
          .required()
        break
      case 'file':
        const maxFileSizeKB = input.maxFileSizeinKB
        const maxFilesAllowed = input.maxFilesAllowed
        baseSchema = Joi.array()
          .items(
            Joi.object({
              filename: Joi.string().required(),
              path: Joi.string().required(),

              sizeInKB: Joi.number().required(),
            }),
          )
          .custom(fileValidationHelper(maxFileSizeKB, maxFilesAllowed))
          .required()
        break
      default:
        break
    }

    // Add custom validation for regex patterns if defined in 'rules'
    if (input.rules) {
      for (const [ruleName, rulePattern] of Object.entries(input.rules)) {
        const regexPattern = new RegExp(rulePattern)

        baseSchema = baseSchema.custom((value, helpers) => {
          if (!regexPattern.test(value)) {
            return helpers.error('any.custom', {
              message: `Value does not match the ${ruleName} pattern for ${inputLabel}`,
            })
          }
          return value
        })
      }
    }

    inputSchema[inputLabel] = baseSchema
  })

  const formSchema = Joi.object(inputSchema)
  return formSchema.validate(formResponse)
}

/**
 * Validates a form schema
 * @param {object} formBody - The form schema to validate
 * @returns {object} - Returns an object with an error property if the form schema is invalid, otherwise returns the validated form schema
 */
function validateForm(formBody) {
  const inputOptionSchema = Joi.object({
    label: Joi.string().required(),
    value: Joi.string().required(),
  })

  const formInputSchema = Joi.object({
    type: Joi.string()
      .valid(
        'small-text',
        'long-text',
        'number',
        'email',
        'multi-select',
        'radio',
        'file',
      )
      .required(),
    label: Joi.string().required(),
    minLength: Joi.number().when('type', {
      is: 'small-text',
      then: Joi.optional(),
    }),
    maxLength: Joi.number().when('type', {
      is: Joi.any().valid('small-text', 'long-text'),
      then: Joi.optional(),
    }),
    minValue: Joi.number().when('type', { is: 'number', then: Joi.optional() }),
    maxValue: Joi.number().when('type', { is: 'number', then: Joi.optional() }),
    options: Joi.array()
      .items(inputOptionSchema)
      .when('type', {
        is: Joi.any().valid('multi-select', 'radio'),
        then: Joi.required(),
      }),
    fileTypes: Joi.array().items(Joi.string()).optional(), // Validate allowed file types
    maxFileSizeinKB: Joi.number().when('type', {
      is: 'file',
      then: Joi.required(),
    }),
    maxFilesAllowed: Joi.number().when('type', {
      is: 'file',
      then: Joi.required(),
    }),
    rules: Joi.when('type', {
      is: Joi.string().valid('small-text', 'long-text', 'number', 'email'),
      then: Joi.object().custom((obj, helpers) => {
        for (const [ruleName, rulePattern] of Object.entries(obj)) {
          if (!isValidRegex(rulePattern)) {
            return helpers.error('any.custom', {
              message: `${ruleName} is not a valid regex Pattern`,
            })
          }
        }
        return obj
      }),
      otherwise: Joi.forbidden(),
    }),
  })

  // Define a Joi schema for the form page
  const formPageSchema = Joi.object({
    title: Joi.string().min(1).required(),
    description: Joi.string(),
    expiry: Joi.date(),
    inputs: Joi.array().items(formInputSchema),
  })

  return formPageSchema.validate(formBody)
}
function validateUserRegisterSchema(userBody) {
  const userRegistrationSchema = Joi.object({
    user_name: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
  })

  return userRegistrationSchema.validate(userBody)
}
function validateUserLoginSchema(userBody) {
  const userRegistrationSchema = Joi.object({
    user_name: Joi.string().min(3).max(30).optional(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().optional(),
  })

  return userRegistrationSchema.validate(userBody)
}

module.exports = {
  validateForm,
  validateFormResponse,
  validateUserRegisterSchema,
  validateUserLoginSchema,
}

const Joi = require('joi').extend(require('@joi/date'))

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
const fileValidationHelper = (maxFileSizeKB, min, max) => {
  return (files, helpers) => {
    const totalSizeKB = files.reduce((total, file) => total + file.sizeInKB, 0)

    if (totalSizeKB > maxFileSizeKB) {
      return helpers.error('any.custom', {
        message: `Total file size exceeds ${maxFileSizeKB} KB`,
      })
    }
    if (max < files.length) {
      return helpers.error('any.custom', {
        message: `File Count exceeds maximum files allowed (${maxFilesAllowed}) `,
      })
    }

    if (min > files.length) {
      return helpers.error('any.custom', {
        message: `File Count is less than minimum files allowed (${min}) `,
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
      case 'small':
        baseSchema = Joi.string().min(input?.min).max(input?.max)
        break

      case 'long':
        baseSchema = Joi.string().min(input?.min).max(input?.max)
        break

      case 'number':
        baseSchema = Joi.number().min(input?.min).max(input?.max)
        break
      case 'email':
        baseSchema = Joi.string().email().min(input?.min).max(input?.max)
        break
      case 'date':
        // Date would be recieved in YYYY-MM-DD format and will be saved like it only
        console.log(input)
        baseSchema = Joi.date()
          .format('YYYY-MM-DD')
          .utc()
          .custom((value, helpers) => {
            const minDate = input.min ? new Date(input.min) : null
            const maxDate = input.max ? new Date(input.max) : null
            if (minDate && value < minDate) {
              return helpers.error('date.min', {
                message: `Date must be greater than or equal to ${
                  minDate.toISOString().split('T')[0]
                }`,
              })
            }

            if (maxDate && value > maxDate) {
              return helpers.error('date.max', {
                message: `Date must be less than or equal to ${
                  maxDate.toISOString().split('T')[0]
                }`,
              })
            }
            return value.toISOString().split('T')[0]
          })
        break
      case 'multi':
        baseSchema = Joi.alternatives(
          Joi.array()
            .items(
              Joi.string().valid(
                ...input.options.map((option) => option.value),
              ),
            )
            .min(1),
          Joi.string().valid(...input.options.map((option) => option.value)),
        )
        break
      case 'radio':
        baseSchema = Joi.string().valid(
          ...input.options.map((option) => option.value),
        )

        break
      case 'file':
        const maxFileSizeKB = input.maxFileSizeinKB
        baseSchema = Joi.array()
          .items(
            Joi.object({
              filename: Joi.string().required(),
              path: Joi.string().required(),
              sizeInKB: Joi.number().required(),
            }),
          )
          .custom(fileValidationHelper(maxFileSizeKB, input.min, input.max))

        break
      default:
        break
    }

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

    if (input.required) {
      baseSchema = baseSchema.required()
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
    // if value is not provided, use the label as the value
    value: Joi.string().default(Joi.ref('label')),
  })

  const formInputSchema = Joi.object({
    label: Joi.string().required(),
    type: Joi.string()
      .valid(
        'small',
        'long',
        'number',
        'email',
        'multi',
        'radio',
        'file',
        'date',
      )
      .required(),
    required: Joi.boolean().default(false),
    min: Joi.when('type', {
      is: 'date',
      then: Joi.date(),
      otherwise: Joi.number(),
    }),
    max: Joi.when('type', {
      is: 'date',
      then: Joi.date(),
      otherwise: Joi.number(),
    }),
    options: Joi.array()
      .items(inputOptionSchema)
      .when('type', {
        is: Joi.any().valid('multi', 'radio'),
        then: Joi.array().required(),
      }),
    fileTypes: Joi.array().items(Joi.string()),
    //if maxFileSizeinKB is greater than 10MB, use 10MB only.
    maxFileSizeinKB: Joi.number().max(10 * 1024),
    rules: Joi.object().when('type', {
      is: Joi.string().valid('small', 'long', 'number', 'email'),
      then: Joi.object().pattern(
        Joi.string(),
        Joi.string().custom((rulePattern, helpers) => {
          if (!isValidRegex(rulePattern)) {
            return helpers.error('any.custom', {
              message: `${rulePattern} is not a valid regex pattern`,
            })
          }
          return rulePattern
        }),
      ),
      otherwise: Joi.forbidden(),
    }),
  })

  // Define a Joi schema for the form page
  const formPageSchema = Joi.object({
    title: Joi.string().min(1).required(),
    description: Joi.string(),
    published: Joi.boolean().default(false),
    expiry: Joi.date().min('now'),
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

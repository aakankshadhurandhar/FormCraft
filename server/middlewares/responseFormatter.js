/**
 * Creates a success response object with the given status code, message, and data.
 *
 * @param {number} [statusCode=200] - The status code of the response. Defaults to 200.
 * @param {string} [message='Success'] - The message of the response. Defaults to 'Success'.
 * @param {*} data - The data of the response.
 * @return {object} - The success response object.
 */
const createSuccessResponse = (statusCode = 200, message = 'Success', data) => {
  return {
    success: true,
    status: statusCode,
    message,
    data,
  }
}

/**
 * Creates an error response object.
 *
 * @param {number} [statusCode=500] - The status code of the error response.
 * @param {string} [message='Internal Server Error'] - The error message.
 * @param {error} error - The error object.
 * @return {object} The error response object.
 */
const createErrorResponse = (
  statusCode = 500,
  message = 'Internal Server Error',
  error,
) => {
  return {
    success: false,
    status: statusCode,
    message,
    error,
  }
}

/**
 * Middleware function that adds custom response methods to the response object.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @return {undefined} - This function does not return a value.
 */
const responseFormatter = (req, res, next) => {
  /**
   * Sends a response with a given message and data.
   *
   * @param {string} message - The message to be sent in the response. Default is 'Success'.
   * @param {*} data - The data to be included in the response.
   * @param {number} statusCode - The status code of the response. Default is 200.
   * @return {void}
   */
  res.sendResponse = (message = 'Success', data, statusCode = 200) => {
    res
      .status(statusCode)
      .json(createSuccessResponse(statusCode, message, data))
  }

  /**
   * Sends a successful response with the given data.
   *
   * @param {any} data - The data to be sent in the response.
   * @return {undefined} This function does not have a return value.
   */
  res.sendSuccess = (data) => {
    res.status(200).json(createSuccessResponse(200, 'Success', data))
  }

  /**
   * Sends an internal error response.
   *
   * @param {type} error - the error that occurred
   * @return {type} the HTTP response with the internal error
   */
  res.sendInternalServerError = (error) => {
    console.log(`Error: ${error}`)
    res.status(500).json(createErrorResponse())
  }

  /**
   * Sends a "Not Found" response with the given message.
   *
   * @param {string} message - The message to be included in the response. Default is 'Not Found'.
   * @return {void}
   */
  res.sendNotFound = (message = 'Not Found') => {
    res.status(404).json(createErrorResponse(404, message))
  }

  /**
   * Sends an unauthorized response.
   *
   * @param {string} message - The message to include in the response. Defaults to 'Unauthorized'.
   * @return {object} - The response object.
   */
  res.sendUnauthorized = (message = 'Unauthorized') => {
    res.status(401).json(createErrorResponse(401, message))
  }

  /**
   * Sends a bad request response.
   *
   * @param {string} message - The error message to be sent.
   * @param {Error} error - The error object, if any.
   * @return {undefined} - This function does not return a value.
   */
  res.sendBadRequest = (message = 'Bad Request', error) => {
    res.status(400).json(createErrorResponse(400, message, error))
  }

  /**
   * Sends a 403 Forbidden response with an optional message.
   *
   * @param {string} message - The optional message to include in the response. Defaults to 'Forbidden'.
   * @return {object} - The JSON response containing the error message.
   */
  res.sendForbidden = (message = 'Forbidden') => {
    res.status(403).json(createErrorResponse(403, message))
  }

  /**
   * Sends a conflict response with the specified message.
   *
   * @param {string} message - The message to include in the response. Defaults to 'Conflict'.
   * @return {object} - The response object with the status code and error response.
   */
  res.sendConflict = (message = 'Conflict') => {
    res.status(409).json(createErrorResponse(409, message))
  }

  /**
   * Sends an unsupported media response.
   *
   * @param {string} [message='Unsupported Media Type'] - The error message.
   * @param {Error} error - The error object.
   * @return {object} The response object.
   */
  res.sendUnsupportedMedia = (message = 'Unsupported Media Type', error) => {
    res.status(415).json(createErrorResponse(415, message, error))
  }

  next()
}

module.exports = responseFormatter

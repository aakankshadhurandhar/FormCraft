const {isValidObjectId} = require("mongoose");
const Models = require("../models/");

// Validate ObjectId parameters
const validateParamAsObjectId =
  (...paramNames) =>
  (req, res, next) => {
    for (const paramName of paramNames) {
      const paramValue = req.params[paramName]

      if (!isValidObjectId(paramValue)) {
        return res.status(400).json({ message: `Invalid ${paramName}` })
      }
    }
    next()
  }


const fetchFormMiddleware = async (req, res, next) => {
  const formId = req.params.formId;
  try {
    const form = await Models.FormPage.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    req.form= form;
    next(); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { validateParamAsObjectId, fetchFormMiddleware };
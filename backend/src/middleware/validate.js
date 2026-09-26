const { validationResult } = require('express-validator');

// Reusable middleware that checks for express-validator errors and formats 400 responses
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

module.exports = validate;

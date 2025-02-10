const Joi = require("joi");

const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(10).required(),
    password: Joi.string().min(4).max(100).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};
const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};

// Middleware for Patient Validation
const patientValidation = (req, res, next) => {
  const patientValidationSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name must not exceed 100 characters",
      "any.required": "Name is required",
    }),
    phone: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone must be a valid 10-digit number",
        "any.required": "Phone is required",
      }),
    gender: Joi.string().valid("Male", "Female", "Other").required().messages({
      "any.required": "Gender is required",
      "any.only": "Gender must be Male, Female, or Other",
    }),
    age: Joi.number().min(1).required().messages({
      "number.min": "Age must be at least 1",
      "any.required": "Age is required",
    }),
    dob: Joi.date().iso().required().messages({
      "date.base": "Date of Birth is required",
      "any.required": "Date of Birth is required",
    }),
    city: Joi.string().required().messages({
      "any.required": "City is required",
    }),
    address: Joi.string().required().messages({
      "any.required": "Address is required",
    }),
    pin: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "Pin must be a valid 6-digit number",
        "any.required": "Pin is required",
      }),
  });
  const { error } = patientValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      error: error.details.map((detail) => detail.message), // Return detailed error messages
    });
  }
  next(); // Proceed to the next middleware or route handler
};

module.exports = {
  signupValidation,
  loginValidation,
  patientValidation,
};

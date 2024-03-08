const Joi = require("joi");

const authRegisterSchema = Joi.object({
  name: Joi.string().min(6).required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .lowercase()
    .required(),
  role: Joi.string().required(),
  active: Joi.boolean(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
});

const LoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
});

const updatePasswordSchema = Joi.object({
  passwordCurrent: Joi.string().min(8).required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
});

module.exports = {
  authRegisterSchema,
  LoginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
};

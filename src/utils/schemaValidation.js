const AppError = require("./appError");

const schemaValidation = (routeSchema, req, next) => {
  console.log("schemaValidation");
  const { error } = routeSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
};

module.exports = schemaValidation;

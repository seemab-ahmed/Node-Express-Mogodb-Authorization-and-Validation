const bcrypt = require("bcryptjs");

const userPreSaveMiddleware = async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
};

const userPreSavePasswordChangedMiddleware = function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
};

const userPreFindMiddleware = function (next) {
  this.find({ active: { $ne: false } });
  next();
};

module.exports = {
  userPreSaveMiddleware,
  userPreSavePasswordChangedMiddleware,
  userPreFindMiddleware,
};

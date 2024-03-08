const errorMessage = (err, req, res, next) => {
  //Good
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = errorMessage;

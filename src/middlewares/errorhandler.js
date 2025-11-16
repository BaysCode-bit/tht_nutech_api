module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  return res.status(status).json({
    status: status === 200 ? 0 : status,
    message: err.message || "Internal server error",
    data: null,
  });
};

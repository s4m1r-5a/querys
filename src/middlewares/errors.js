module.exports = (error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor'
  });
};

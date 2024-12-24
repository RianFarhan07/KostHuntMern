export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Kirim hanya pesan error tanpa stack trace
  res.json({
    message: err.message || "An unknown error occurred",
  });
};

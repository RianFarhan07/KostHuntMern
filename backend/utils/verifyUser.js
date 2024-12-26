import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; // Ambil token dari cookies

  if (!token) {
    // Jika tidak ada token
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Jika token tidak valid
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }

    req.user = user; // Berhasil memverifikasi token
    next();
  });
};

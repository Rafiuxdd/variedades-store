const jwt = require("jsonwebtoken");

function getTokenFromRequest(req) {
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

function verifyToken(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "No se encontró una sesión activa"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Sesión inválida o expirada"
    });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "No se encontró información del usuario"
      });
    }

    if (req.user.role === "ADMIN") {
      return next();
    }

    const permissions = req.user.permissions || {};

    if (!permissions[permission]) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para realizar esta acción"
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requirePermission
};

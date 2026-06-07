const { allowedOrigins, isProduction } = require("../config/env");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function requireTrustedOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get("origin");

  if (!origin) {
    if (!isProduction) {
      return next();
    }

    return res.status(403).json({
      ok: false,
      message: "Origen requerido para esta solicitud"
    });
  }

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({
      ok: false,
      message: "Origen no permitido"
    });
  }

  return next();
}

module.exports = {
  requireTrustedOrigin
};

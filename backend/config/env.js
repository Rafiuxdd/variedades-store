const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean);
const WHATSAPP_OWNER_NUMBER = String(process.env.WHATSAPP_OWNER_NUMBER || "50370537289")
  .replace(/[^\d]/g, "");

const weakJwtSecrets = new Set([
  "clave_tienda_pines_2026",
  "cambia_esto_por_un_texto_largo",
  "usa_un_secreto_largo_aleatorio_de_32_caracteres_minimo"
]);

function validateEnv() {
  if (!process.env.JWT_SECRET || weakJwtSecrets.has(process.env.JWT_SECRET)) {
    throw new Error("Configura JWT_SECRET con un valor largo y aleatorio en backend/.env");
  }

  if (isProduction && process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET debe tener al menos 32 caracteres en produccion");
  }

  if (!/^\d{10,15}$/.test(WHATSAPP_OWNER_NUMBER)) {
    throw new Error("WHATSAPP_OWNER_NUMBER debe estar en formato internacional, solo numeros");
  }

  if (!isProduction) {
    return;
  }

  const requiredProductionVars = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "FRONTEND_URL"
  ];
  const missingProductionVars = requiredProductionVars.filter((name) => !process.env[name]);

  if (missingProductionVars.length > 0) {
    throw new Error(`Faltan variables de produccion: ${missingProductionVars.join(", ")}`);
  }

  if (allowedOrigins.some((origin) => origin.startsWith("http://"))) {
    throw new Error("FRONTEND_URL debe usar https en produccion");
  }
}

module.exports = {
  PORT,
  NODE_ENV,
  isProduction,
  FRONTEND_URL,
  allowedOrigins,
  WHATSAPP_OWNER_NUMBER,
  validateEnv
};

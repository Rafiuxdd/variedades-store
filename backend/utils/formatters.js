function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "").trim();
}

function cleanSelectedOptions(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return {};
  }

  const cleanOptions = {};
  const allowedKeys = new Set(["Color", "Modelo"]);

  for (const [key, value] of Object.entries(options)) {
    const cleanKey = String(key || "").trim();
    const cleanValue = String(value || "").trim();

    if (!allowedKeys.has(cleanKey) || !cleanValue) {
      continue;
    }

    cleanOptions[cleanKey] = cleanValue.slice(0, 80);
  }

  return cleanOptions;
}

function formatSelectedOptions(options = {}) {
  const entries = Object.entries(cleanSelectedOptions(options));

  if (entries.length === 0) {
    return "";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(", ");
}

module.exports = {
  normalizePhone,
  cleanSelectedOptions,
  formatSelectedOptions
};

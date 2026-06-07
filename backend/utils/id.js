const crypto = require("crypto");

function createId() {
  return crypto.randomUUID();
}

function isSafeId(value) {
  return /^[a-zA-Z0-9_-]{1,80}$/.test(String(value || ""));
}

module.exports = {
  createId,
  isSafeId
};

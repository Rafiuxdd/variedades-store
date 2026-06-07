const crypto = require("crypto");

function isValidWompiHash(rawBody, receivedHash, apiSecret) {
  const calculatedHash = crypto
    .createHmac("sha256", apiSecret)
    .update(rawBody)
    .digest("hex");

  const received = Buffer.from(String(receivedHash), "hex");
  const calculated = Buffer.from(calculatedHash, "hex");

  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
}

module.exports = {
  isValidWompiHash
};

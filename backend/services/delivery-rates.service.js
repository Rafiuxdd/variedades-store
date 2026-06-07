const { query } = require("../db");
const {
  DEFAULT_DELIVERY_RATES,
  SONSONATE_MUNICIPALITIES
} = require("../constants/delivery.constants");

async function ensureDeliveryRatesTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS delivery_rates (
      municipality VARCHAR(120) PRIMARY KEY,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_delivery_rates_price CHECK (price >= 0)
    )`
  );

  const values = SONSONATE_MUNICIPALITIES.map((municipality) => [
    municipality,
    DEFAULT_DELIVERY_RATES[municipality]
  ]);

  for (const [municipality, price] of values) {
    await query(
      `INSERT IGNORE INTO delivery_rates (municipality, price)
       VALUES (:municipality, :price)`,
      { municipality, price }
    );
  }
}

function mapDeliveryRates(rows = []) {
  const rates = { ...DEFAULT_DELIVERY_RATES };

  for (const row of rows) {
    rates[row.municipality] = Number(row.price);
  }

  return rates;
}

async function getDeliveryRatesMap() {
  await ensureDeliveryRatesTable();

  const rows = await query(
    "SELECT municipality, price FROM delivery_rates WHERE isActive = 1 ORDER BY municipality ASC"
  );

  return mapDeliveryRates(rows);
}

module.exports = {
  ensureDeliveryRatesTable,
  mapDeliveryRates,
  getDeliveryRatesMap
};

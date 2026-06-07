const { query } = require("../db");
const { mapProduct } = require("../mappers/store.mappers");

async function getProductById(id) {
  const rows = await query(
    `SELECT 
      p.*, 
      c.name AS categoryName, 
      c.createdAt AS categoryCreatedAt, 
      c.updatedAt AS categoryUpdatedAt
     FROM products p
     LEFT JOIN categories c ON c.id = p.categoryId
     WHERE p.id = :id
     LIMIT 1`,
    { id }
  );

  return rows[0] ? mapProduct(rows[0]) : null;
}

module.exports = {
  getProductById
};

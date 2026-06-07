const { query } = require("../db");
const { mapDeliveryPoint, mapOrder } = require("../mappers/store.mappers");

async function getOrderFullById(id) {
  const orderRows = await query("SELECT * FROM orders WHERE id = :id LIMIT 1", {
    id
  });

  if (!orderRows[0]) return null;

  const itemRows = await query(
    "SELECT * FROM order_items WHERE orderId = :id ORDER BY createdAt ASC",
    { id }
  );

  const items = itemRows.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    price: Number(item.price)
  }));

  let deliveryPoint = null;

  if (orderRows[0].deliveryPointId) {
    const pointRows = await query(
      "SELECT * FROM delivery_points WHERE id = :id LIMIT 1",
      { id: orderRows[0].deliveryPointId }
    );

    deliveryPoint = pointRows[0] ? mapDeliveryPoint(pointRows[0]) : null;
  }

  return mapOrder(orderRows[0], items, deliveryPoint);
}

module.exports = {
  getOrderFullById
};

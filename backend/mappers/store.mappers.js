function boolValue(value) {
  return value ? true : false;
}

function mapCategory(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapProduct(row) {
  if (!row) return null;

  const category = row.categoryId
    ? {
        id: row.categoryId,
        name: row.categoryName,
        createdAt: row.categoryCreatedAt,
        updatedAt: row.categoryUpdatedAt
      }
    : null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    stock: Number(row.stock),
    imageUrl: row.imageUrl,
    isActive: boolValue(row.isActive),
    reservedUntil: row.reservedUntil,
    categoryId: row.categoryId,
    category,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapDeliveryPoint(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    reference: row.reference,
    schedule: row.schedule,
    isActive: boolValue(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapOrder(row, items = [], deliveryPoint = null) {
  if (!row) return null;

  return {
    id: row.id,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    total: Number(row.total),
    status: row.status,
    deliveryMethod: row.deliveryMethod,
    paymentMethod: row.paymentMethod,
    deliveryAddress: row.deliveryAddress,
    deliveryNotes: row.deliveryNotes,
    deliveryPointId: row.deliveryPointId,
    deliveryPoint,
    reservedUntil: row.reservedUntil,
    whatsappMessage: row.whatsappMessage,
    items,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

module.exports = {
  mapCategory,
  mapProduct,
  mapDeliveryPoint,
  mapOrder,
  boolValue
};

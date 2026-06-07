const {
  TEMPORARILY_DISABLED_ORDER_OPTIONS,
  MAX_ORDER_ITEMS,
  MAX_ORDER_QUANTITY_PER_ITEM
} = require("../constants/order.constants");
const { normalizePhone } = require("../utils/formatters");
const { isSafeId } = require("../utils/id");

function validateOrderPayload(body) {
  const errors = [];

  const {
    customerName,
    customerPhone,
    deliveryMethod,
    paymentMethod,
    deliveryAddress,
    deliveryPointId,
    items
  } = body;

  if (!customerName || !customerName.trim()) {
    errors.push("El nombre del cliente es obligatorio.");
  }

  if (!customerPhone || !normalizePhone(customerPhone)) {
    errors.push("El telefono del cliente es obligatorio.");
  }

  if (!deliveryMethod || !["DELIVERY", "PICKUP_POINT"].includes(deliveryMethod)) {
    errors.push("Debes seleccionar un tipo de entrega valido.");
  }

  if (TEMPORARILY_DISABLED_ORDER_OPTIONS.delivery && deliveryMethod === "DELIVERY") {
    errors.push("Delivery esta temporalmente deshabilitado.");
  }

  if (!paymentMethod || !["CASH", "PAYMENT_LINK"].includes(paymentMethod)) {
    errors.push("Debes seleccionar un metodo de pago valido.");
  }

  if (TEMPORARILY_DISABLED_ORDER_OPTIONS.paymentLink && paymentMethod === "PAYMENT_LINK") {
    errors.push("El link de pago esta temporalmente deshabilitado.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Debes enviar al menos un producto en el pedido.");
  }

  if (Array.isArray(items) && items.length > MAX_ORDER_ITEMS) {
    errors.push(`No puedes enviar mas de ${MAX_ORDER_ITEMS} productos distintos por pedido.`);
  }

  if (Array.isArray(items)) {
    for (const item of items) {
      if (!isSafeId(item?.productId)) {
        errors.push("Uno de los productos enviados no es valido.");
        break;
      }

      const selectedOptions = item?.selectedOptions;

      if (
        selectedOptions &&
        (typeof selectedOptions !== "object" ||
          Array.isArray(selectedOptions) ||
          Object.keys(selectedOptions).length > 2)
      ) {
        errors.push("Las opciones seleccionadas no son validas.");
        break;
      }

      const quantity = Number(item?.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        quantity > MAX_ORDER_QUANTITY_PER_ITEM
      ) {
        errors.push(
          `La cantidad por producto debe estar entre 1 y ${MAX_ORDER_QUANTITY_PER_ITEM}.`
        );
        break;
      }
    }
  }

  if (deliveryMethod === "DELIVERY" && (!deliveryAddress || !deliveryAddress.trim())) {
    errors.push("La direccion de entrega es obligatoria para delivery.");
  }

  if (
    deliveryMethod === "PICKUP_POINT" &&
    (!deliveryPointId || !String(deliveryPointId).trim())
  ) {
    errors.push("Debes seleccionar un punto de entrega.");
  }

  if (deliveryPointId && !isSafeId(deliveryPointId)) {
    errors.push("El punto de entrega seleccionado no es valido.");
  }

  return errors;
}

module.exports = {
  validateOrderPayload
};

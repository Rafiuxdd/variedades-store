function buildWhatsAppMessage({
  customerName,
  customerPhone,
  deliveryMethod,
  paymentMethod,
  deliveryAddress,
  deliveryNotes,
  deliveryPoint,
  items,
  total
}) {
  const itemLines = items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.quantity} - $${Number(
          item.price
        ).toFixed(2)}`
    )
    .join("\n");

  const deliveryText =
    deliveryMethod === "DELIVERY"
      ? `Tipo de entrega: Delivery
Direccion: ${deliveryAddress}
Indicaciones: ${deliveryNotes || "Sin indicaciones adicionales"}`
      : `Tipo de entrega: Punto de entrega
Punto seleccionado: ${deliveryPoint?.name || "No especificado"}
Direccion del punto: ${deliveryPoint?.address || "No especificada"}
Referencia del punto: ${deliveryPoint?.reference || "Sin referencia"}
Horario: ${deliveryPoint?.schedule || "No especificado"}`;

  const paymentText =
    paymentMethod === "PAYMENT_LINK"
      ? "Metodo de pago: Link de pago"
      : "Metodo de pago: Efectivo";

  return `Hola, quiero confirmar este pedido:

Cliente: ${customerName}
Telefono: ${customerPhone}

${deliveryText}
${paymentText}

Productos:
${itemLines}

Total: $${Number(total).toFixed(2)}`;
}

module.exports = {
  buildWhatsAppMessage
};

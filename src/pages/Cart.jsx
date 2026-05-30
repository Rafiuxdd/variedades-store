import { useEffect, useMemo, useState } from "react";
import {
  createOrder,
  createWompiLink,
  getDeliveryPoints
} from "../lib/api";
import {
  DELIVERY_DEPARTMENTS,
  SONSONATE_MUNICIPALITIES
} from "../data/deliveryZones";

function Cart({
  cart = [],
  addToCart,
  removeOneFromCart,
  removeProductCompletely,
  clearCart,
  refreshStore = async () => {},
  deliveryRates = {}
}) {
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [checkoutData, setCheckoutData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryMethod: "",
    deliveryDepartment: "",
    deliveryMunicipality: "",
    deliveryAddress: "",
    deliveryNotes: "",
    deliveryPointId: "",
    paymentMethod: ""
  });

  useEffect(() => {
    loadDeliveryPoints();
  }, []);

  const total = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
  }, [cart]);

  const unsupportedDepartment =
    checkoutData.deliveryMethod === "DELIVERY" &&
    checkoutData.deliveryDepartment &&
    checkoutData.deliveryDepartment !== "Sonsonate";
  const shippingCost =
    checkoutData.deliveryMethod === "DELIVERY" &&
    checkoutData.deliveryDepartment === "Sonsonate" &&
    checkoutData.deliveryMunicipality
      ? Number(deliveryRates[checkoutData.deliveryMunicipality] || 0)
      : 0;
  const orderTotal = total + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCheckoutData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "deliveryMethod" && value === "DELIVERY"
        ? { deliveryPointId: "" }
        : {}),
      ...(name === "deliveryMethod" && value === "PICKUP_POINT"
        ? {
            deliveryDepartment: "",
            deliveryMunicipality: "",
            deliveryAddress: "",
            deliveryNotes: ""
          }
        : {}),
      ...(name === "deliveryDepartment"
        ? { deliveryMunicipality: "" }
        : {}),
      ...(name === "paymentMethod" && value !== "PAYMENT_LINK"
        ? { customerEmail: "" }
        : {})
    }));
  };

  const loadDeliveryPoints = async () => {
    try {
      setIsLoadingPoints(true);
      const response = await getDeliveryPoints(true);
      setDeliveryPoints(response.data || []);
    } catch (error) {
      console.error(error);
      setFormError("No se pudieron cargar los puntos de entrega.");
    } finally {
      setIsLoadingPoints(false);
    }
  };

  const validateForm = () => {
    if (cart.length === 0) {
      return "Tu carrito está vacío.";
    }

    if (!checkoutData.customerName.trim()) {
      return "Debes ingresar tu nombre.";
    }

    if (!checkoutData.customerPhone.trim()) {
      return "Debes ingresar tu teléfono.";
    }

    if (!checkoutData.deliveryMethod) {
      return "Debes seleccionar un tipo de entrega.";
    }

    if (checkoutData.deliveryMethod === "DELIVERY") {
      if (!checkoutData.deliveryDepartment) {
        return "Debes seleccionar tu departamento.";
      }

      if (checkoutData.deliveryDepartment !== "Sonsonate") {
        return "Por el momento solo contamos con envios en Sonsonate.";
      }

      if (!checkoutData.deliveryMunicipality) {
        return "Debes seleccionar tu municipio.";
      }
      if (!checkoutData.deliveryAddress.trim()) {
        return "Debes ingresar la dirección de entrega.";
      }
    }

    if (checkoutData.deliveryMethod === "PICKUP_POINT") {
      if (!checkoutData.deliveryPointId) {
        return "Debes seleccionar un punto de entrega.";
      }
    }

    if (!checkoutData.paymentMethod) {
      return "Debes seleccionar un método de pago.";
    }

    if (
      checkoutData.paymentMethod === "PAYMENT_LINK" &&
      !checkoutData.customerEmail.trim()
    ) {
      return "Debes ingresar un correo para el link de pago.";
    }

    return "";
  };

  const buildOrderPayload = () => {
    return {
      customerName: checkoutData.customerName.trim(),
      customerPhone: checkoutData.customerPhone.trim(),
      deliveryMethod: checkoutData.deliveryMethod,
      paymentMethod: checkoutData.paymentMethod,
      deliveryDepartment:
        checkoutData.deliveryMethod === "DELIVERY"
          ? checkoutData.deliveryDepartment
          : null,
      deliveryMunicipality:
        checkoutData.deliveryMethod === "DELIVERY"
          ? checkoutData.deliveryMunicipality
          : null,
      deliveryAddress:
        checkoutData.deliveryMethod === "DELIVERY"
          ? `${checkoutData.deliveryDepartment}, ${checkoutData.deliveryMunicipality}. ${checkoutData.deliveryAddress.trim()}`
          : null,
      deliveryNotes:
        checkoutData.deliveryMethod === "DELIVERY"
          ? checkoutData.deliveryNotes.trim()
          : null,
      deliveryPointId:
        checkoutData.deliveryMethod === "PICKUP_POINT"
          ? checkoutData.deliveryPointId
          : null,
      deliveryPrice: shippingCost,
      items: cart.map((item) => ({
        productId: item.id,
        quantity: Number(item.quantity)
      }))
    };
  };

  const handleSubmitOrder = async () => {
    setFormError("");
    setFormSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSubmittingOrder(true);

      const orderPayload = buildOrderPayload();
      const orderResponse = await createOrder(orderPayload);

      const orderData = orderResponse.data || {};
      const createdOrderId = orderData.id || orderResponse.orderId;

      if (checkoutData.paymentMethod === "PAYMENT_LINK") {
        const wompiResponse = await createWompiLink({
          orderId: createdOrderId,
          customerEmail: checkoutData.customerEmail.trim()
        });

        const paymentUrl =
          wompiResponse?.data?.urlEnlace ||
          wompiResponse?.data?.url ||
          wompiResponse?.data?.enlacePago ||
          wompiResponse?.data?.linkPago ||
          wompiResponse?.data?.resultado?.urlEnlace ||
          wompiResponse?.data?.resultado?.url;

        if (!paymentUrl) {
          throw new Error("Wompi no devolvió una URL de pago válida.");
        }

        setFormSuccess("Redirigiendo a Wompi...");

        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 500);

        return;
      }

      await refreshStore();

      setCheckoutData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        deliveryMethod: "",
        deliveryDepartment: "",
        deliveryMunicipality: "",
        deliveryAddress: "",
        deliveryNotes: "",
        deliveryPointId: "",
        paymentMethod: ""
      });

      clearCart?.();

      setFormSuccess("Pedido creado correctamente. Abriendo WhatsApp...");

      if (orderResponse.whatsappUrl) {
        window.open(orderResponse.whatsappUrl, "_blank");
      }
    } catch (error) {
      console.error(error);
      setFormError(error.message || "No se pudo crear el pedido.");

      try {
        await refreshStore();
      } catch (refreshError) {
        console.error(refreshError);
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page">
        <section className="section-title">
          <h2>Tu carrito</h2>
          <p>No has agregado productos todavía.</p>
        </section>

        <div className="empty-cart">
          <h3>Carrito vacío</h3>
          <p>Agrega productos para comenzar tu pedido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="section-title">
        <h2>Tu carrito</h2>
        <p>Revisa tus productos y completa tu pedido.</p>
      </section>

      <section className="cart-layout">
        <div className="cart-list">
          {cart.map((item) => (
            <article key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />

              <div className="cart-item-info">
                <div className="cart-item-header">
                  <h3>{item.name}</h3>
                  <button
                    type="button"
                    className="cart-remove-icon"
                    onClick={() => removeProductCompletely?.(item.id)}
                    aria-label="Eliminar producto"
                  >
                    ×
                  </button>
                </div>
                <p>{item.description}</p>
                <span className="cart-item-category">{item.category}</span>
                <strong>${Number(item.price).toFixed(2)}</strong>
              </div>

              <div className="cart-item-actions">
                <div className="cart-qty-controls">
                  <button
                    type="button"
                    className="cart-qty-btn"
                    onClick={() => removeOneFromCart?.(item.id)}
                  >
                    –
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    className="cart-qty-btn"
                    onClick={() => addToCart?.(item.id)}
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="checkout-card checkout-card-fixed">
          <h3>Resumen del pedido</h3>

          <div className="checkout-summary-block">
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            {checkoutData.deliveryMethod === "DELIVERY" && (
              <div className="checkout-summary-row">
                <span>Delivery</span>
                <strong>${shippingCost.toFixed(2)}</strong>
              </div>
            )}
            <div className="checkout-summary-row checkout-summary-total">
              <span>Total</span>
              <strong>${orderTotal.toFixed(2)}</strong>
            </div>
          </div>

          <div className="checkout-form checkout-form-fixed">
            <label>
              Nombre completo
              <input
                type="text"
                name="customerName"
                value={checkoutData.customerName}
                onChange={handleChange}
                placeholder="Escribe tu nombre"
              />
            </label>

            <label>
              Teléfono
              <input
                type="text"
                name="customerPhone"
                value={checkoutData.customerPhone}
                onChange={handleChange}
                placeholder="Ejemplo: 77778888"
              />
            </label>

            <label>
              Tipo de entrega
              <select
                name="deliveryMethod"
                value={checkoutData.deliveryMethod}
                onChange={handleChange}
              >
                <option value="">Selecciona una opción</option>
                <option value="DELIVERY">Delivery</option>
                <option value="PICKUP_POINT">Punto de entrega</option>
              </select>
            </label>

            <div className="checkout-dynamic-zone">
              {checkoutData.deliveryMethod === "DELIVERY" && (
                <div className="checkout-option-panel">
                  <label>
                    Departamento
                    <select
                      name="deliveryDepartment"
                      value={checkoutData.deliveryDepartment}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona tu departamento</option>
                      {DELIVERY_DEPARTMENTS.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                      <option value="Otro">Otro departamento</option>
                    </select>
                  </label>

                  {unsupportedDepartment && (
                    <div className="form-error">
                      Por el momento no contamos con envios a ese departamento.
                    </div>
                  )}

                  {checkoutData.deliveryDepartment === "Sonsonate" && (
                    <label>
                      Municipio
                      <select
                        name="deliveryMunicipality"
                        value={checkoutData.deliveryMunicipality}
                        onChange={handleChange}
                      >
                        <option value="">Selecciona tu municipio</option>
                        {SONSONATE_MUNICIPALITIES.map((municipality) => (
                          <option key={municipality} value={municipality}>
                            {municipality}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {checkoutData.deliveryMunicipality && (
                    <div className="checkout-help-box">
                      <strong>Delivery a {checkoutData.deliveryMunicipality}</strong>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <label>
                    Dirección de entrega
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={checkoutData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Escribe tu dirección"
                    />
                  </label>

                  <label>
                    Indicaciones adicionales
                    <textarea
                      name="deliveryNotes"
                      value={checkoutData.deliveryNotes}
                      onChange={handleChange}
                      placeholder="Referencia, color de casa, colonia, etc."
                      rows="3"
                    />
                  </label>
                </div>
              )}

              {checkoutData.deliveryMethod === "PICKUP_POINT" && (
                <div className="checkout-option-panel">
                  <label>
                    Punto de entrega
                    <select
                      name="deliveryPointId"
                      value={checkoutData.deliveryPointId}
                      onChange={handleChange}
                      disabled={isLoadingPoints}
                    >
                      <option value="">
                        {isLoadingPoints
                          ? "Cargando puntos..."
                          : "Selecciona un punto de entrega"}
                      </option>
                      {deliveryPoints.map((point) => (
                        <option key={point.id} value={point.id}>
                          {point.name} - {point.address}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="checkout-help-box">
                    <strong>Recuerda:</strong>
                    <span>
                      Escoge el punto donde preferís retirar tu pedido.
                    </span>
                  </div>
                </div>
              )}

              {!checkoutData.deliveryMethod && (
                <div className="checkout-option-panel checkout-placeholder-panel">
                  <p>Selecciona un tipo de entrega para continuar.</p>
                </div>
              )}
            </div>

            <label>
              Método de pago
              <select
                name="paymentMethod"
                value={checkoutData.paymentMethod}
                onChange={handleChange}
              >
                <option value="">Selecciona una opción</option>
                <option value="CASH">Efectivo</option>
                <option value="PAYMENT_LINK">Link de pago</option>
              </select>
            </label>

            <div className="checkout-payment-zone">
              {checkoutData.paymentMethod === "PAYMENT_LINK" ? (
                <label>
                  Correo para el pago
                  <input
                    type="email"
                    name="customerEmail"
                    value={checkoutData.customerEmail}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                  />
                </label>
              ) : (
                <div className="checkout-payment-placeholder">
                  <p>
                    {checkoutData.paymentMethod === "CASH"
                      ? "El pago se coordinará al confirmar el pedido."
                      : "Selecciona un método de pago para continuar."}
                  </p>
                </div>
              )}
            </div>

            <div className="checkout-message-slot">
              {formError && <div className="form-error">{formError}</div>}
              {formSuccess && <div className="form-success">{formSuccess}</div>}
            </div>

            <button
              type="button"
              className="checkout-submit"
              onClick={handleSubmitOrder}
              disabled={isSubmittingOrder}
            >
              {isSubmittingOrder
                ? "Procesando pedido..."
                : checkoutData.paymentMethod === "PAYMENT_LINK"
                ? "Ir a pagar con Wompi"
                : "Proceder al pedido"}
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Cart;

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

function AdminOrders({ orders = [], confirmOrder, cancelOrder }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [actionMessage, setActionMessage] = useState("");
  const [loadingOrderId, setLoadingOrderId] = useState("");

  const currentFilter = searchParams.get("status") || "ALL";

  const filteredOrders = useMemo(() => {
    if (currentFilter === "ALL") return orders;
    return orders.filter((order) => order.status === currentFilter);
  }, [orders, currentFilter]);

  const counters = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING_WHATSAPP: orders.filter((o) => o.status === "PENDING_WHATSAPP").length,
      CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
      CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
      EXPIRED: orders.filter((o) => o.status === "EXPIRED").length
    };
  }, [orders]);

  const changeFilter = (status) => {
    if (status === "ALL") {
      setSearchParams({});
      return;
    }

    setSearchParams({ status });
  };

  const handleConfirm = async (orderId) => {
    try {
      setLoadingOrderId(orderId);
      setActionMessage("");
      await confirmOrder(orderId);
      setActionMessage("Pedido confirmado correctamente.");
    } catch (error) {
      console.error(error);
      setActionMessage(error.message || "No se pudo confirmar el pedido.");
    } finally {
      setLoadingOrderId("");
    }
  };

  const handleCancel = async (orderId) => {
    try {
      setLoadingOrderId(orderId);
      setActionMessage("");
      await cancelOrder(orderId);
      setActionMessage("Pedido cancelado correctamente y stock liberado.");
    } catch (error) {
      console.error(error);
      setActionMessage(error.message || "No se pudo cancelar el pedido.");
    } finally {
      setLoadingOrderId("");
    }
  };

  return (
    <div className="page">
      <section className="section-title">
        <h2>Pedidos</h2>
        <p>
          Aquí puedes revisar todos los pedidos creados, filtrarlos por estado y
          cambiar su situación cuando ya se haya vendido o cancelado.
        </p>
      </section>

      <section className="admin-dashboard-grid">
        <OrderFilterCard
          title="Todos"
          value={counters.ALL}
          active={currentFilter === "ALL"}
          onClick={() => changeFilter("ALL")}
        />
        <OrderFilterCard
          title="Pendientes"
          value={counters.PENDING_WHATSAPP}
          active={currentFilter === "PENDING_WHATSAPP"}
          onClick={() => changeFilter("PENDING_WHATSAPP")}
        />
        <OrderFilterCard
          title="Confirmados"
          value={counters.CONFIRMED}
          active={currentFilter === "CONFIRMED"}
          onClick={() => changeFilter("CONFIRMED")}
        />
        <OrderFilterCard
          title="Cancelados"
          value={counters.CANCELLED}
          active={currentFilter === "CANCELLED"}
          onClick={() => changeFilter("CANCELLED")}
        />
      </section>

      {actionMessage ? (
        <div className="form-success" style={{ marginBottom: "18px" }}>
          {actionMessage}
        </div>
      ) : null}

      <section className="admin-panel-card">
        <div className="admin-panel-card-header">
          <div>
            <h3>Listado de pedidos</h3>
            <p>
              Estado actual:{" "}
              <strong>
                {currentFilter === "ALL" ? "Todos" : formatStatus(currentFilter)}
              </strong>
            </p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-cart">
            <h3>No hay pedidos en esta vista</h3>
            <p>Cuando entren nuevos pedidos o cambies el filtro, aparecerán aquí.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="admin-panel-card"
                style={{ marginBottom: "18px" }}
              >
                <div className="admin-panel-card-header">
                  <div>
                    <h3>Pedido #{String(order.id).slice(-6).toUpperCase()}</h3>
                    <p>
                      Cliente: <strong>{order.customerName}</strong> · Teléfono:{" "}
                      <strong>{order.customerPhone}</strong>
                    </p>
                  </div>

                  <div>
                    <span className={`order-status-pill ${getOrderStatusClass(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>

                <div className="dashboard-summary-list" style={{ marginBottom: "16px" }}>
                  <div className="summary-row">
                    <span>Total</span>
                    <strong>${Number(order.total || 0).toFixed(2)}</strong>
                  </div>

                  <div className="summary-row">
                    <span>Entrega</span>
                    <strong>
                      {order.deliveryMethod === "DELIVERY"
                        ? "Delivery"
                        : "Punto de entrega"}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>Pago</span>
                    <strong>
                      {order.paymentMethod === "PAYMENT_LINK"
                        ? "Link de pago"
                        : "Efectivo"}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>Creado</span>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </div>
                </div>

                {order.deliveryMethod === "DELIVERY" ? (
                  <div className="summary-row" style={{ marginBottom: "16px" }}>
                    <span>Dirección</span>
                    <strong style={{ textAlign: "right" }}>
                      {order.deliveryAddress || "No especificada"}
                    </strong>
                  </div>
                ) : (
                  <div className="summary-row" style={{ marginBottom: "16px" }}>
                    <span>Punto</span>
                    <strong style={{ textAlign: "right" }}>
                      {order.deliveryPoint?.name || "No especificado"}
                    </strong>
                  </div>
                )}

                <div className="users-table-wrap" style={{ marginBottom: "16px" }}>
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>${Number(item.price).toFixed(2)}</td>
                          <td>
                            ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="user-actions">
                  {order.status === "PENDING_WHATSAPP" ? (
                    <>
                      <button
                        type="button"
                        className="user-edit-btn"
                        disabled={loadingOrderId === order.id}
                        onClick={() => handleConfirm(order.id)}
                      >
                        {loadingOrderId === order.id
                          ? "Procesando..."
                          : "Marcar como vendido"}
                      </button>

                      <button
                        type="button"
                        className="user-delete-btn"
                        disabled={loadingOrderId === order.id}
                        onClick={() => handleCancel(order.id)}
                      >
                        {loadingOrderId === order.id
                          ? "Procesando..."
                          : "Cancelar pedido"}
                      </button>
                    </>
                  ) : null}

                  {order.status === "CONFIRMED" ? (
                    <span className="order-status-pill status-confirmed">
                      Pedido ya confirmado
                    </span>
                  ) : null}

                  {order.status === "CANCELLED" ? (
                    <span className="order-status-pill status-cancelled">
                      Pedido cancelado
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OrderFilterCard({ title, value, active, onClick }) {
  return (
    <button
      type="button"
      className="dashboard-card"
      onClick={onClick}
      style={{
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        outline: active ? "2px solid rgba(255,255,255,0.28)" : "none"
      }}
    >
      <span className="dashboard-label">{title}</span>
      <strong>{value}</strong>
      <small>{active ? "Filtro activo" : "Haz clic para ver"}</small>
    </button>
  );
}

function formatStatus(status) {
  if (status === "PENDING_WHATSAPP") return "Pendiente por WhatsApp";
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "CANCELLED") return "Cancelado";
  if (status === "EXPIRED") return "Expirado";
  return status;
}

function formatDate(date) {
  if (!date) return "Sin fecha";
  return new Date(date).toLocaleString();
}

function getOrderStatusClass(status) {
  if (status === "CONFIRMED") return "status-confirmed";
  if (status === "CANCELLED") return "status-cancelled";
  if (status === "PENDING_WHATSAPP") return "status-pending";
  if (status === "EXPIRED") return "status-expired";
  return "";
}

export default AdminOrders;

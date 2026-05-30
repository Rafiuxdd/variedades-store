import { useEffect, useMemo, useState } from "react";
import { SONSONATE_MUNICIPALITIES } from "../data/deliveryZones";

const initialForm = {
  name: "",
  address: "",
  reference: "",
  schedule: "",
  isActive: true
};

function AdminDeliveryPoints({
  deliveryPoints,
  addDeliveryPoint,
  updateDeliveryPoint,
  deleteDeliveryPoint,
  deliveryRates,
  saveDeliveryRates,
  currentUser
}) {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [localMessage, setLocalMessage] = useState("");
  const [rateInputs, setRateInputs] = useState({});

  useEffect(() => {
    setRateInputs(
      SONSONATE_MUNICIPALITIES.reduce((acc, municipality) => {
        acc[municipality] = Number(deliveryRates?.[municipality] || 0).toFixed(2);
        return acc;
      }, {})
    );
  }, [deliveryRates]);

  const canDeliveryPoints = currentUser?.permissions?.deliveryPoints;

  const activeCount = useMemo(
    () => deliveryPoints.filter((point) => point.isActive).length,
    [deliveryPoints]
  );

  const inactiveCount = deliveryPoints.length - activeCount;

  if (!canDeliveryPoints) {
    return (
      <div className="page">
        <div className="admin-panel-card">
          <div className="admin-panel-card-header">
            <div>
              <h3>No tienes acceso</h3>
              <p>No cuentas con permisos para gestionar puntos de entrega.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleDeliveryRatesSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage("");

    const nextRates = {};

    for (const municipality of SONSONATE_MUNICIPALITIES) {
      const parsed = Number(rateInputs[municipality]);

      if (Number.isNaN(parsed) || parsed < 0) {
        setLocalMessage(`Ingresa un precio valido para ${municipality}.`);
        return;
      }

      nextRates[municipality] = parsed;
    }

    try {
      await saveDeliveryRates(nextRates);
      setLocalMessage("Precios de delivery actualizados correctamente.");
    } catch (error) {
      console.error(error);
      setLocalMessage(error.message || "No se pudieron guardar las tarifas.");
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage("");

    if (!form.name.trim()) {
      setLocalMessage("Debes ingresar el nombre del punto de entrega.");
      return;
    }

    if (!form.address.trim()) {
      setLocalMessage("Debes ingresar la direccion del punto de entrega.");
      return;
    }

    try {
      if (editingId) {
        await updateDeliveryPoint(editingId, form);
        setLocalMessage("Punto de entrega actualizado correctamente.");
      } else {
        await addDeliveryPoint(form);
        setLocalMessage("Punto de entrega agregado correctamente.");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      setLocalMessage(error.message || "No se pudo guardar el punto de entrega.");
    }
  };

  const handleEdit = (point) => {
    setEditingId(point.id);
    setForm({
      name: point.name || "",
      address: point.address || "",
      reference: point.reference || "",
      schedule: point.schedule || "",
      isActive: Boolean(point.isActive)
    });
    setLocalMessage("");
  };

  const handleDelete = async (id) => {
    try {
      await deleteDeliveryPoint(id);
      setLocalMessage("Punto de entrega eliminado correctamente.");

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      setLocalMessage(error.message || "No se pudo eliminar el punto de entrega.");
    }
  };

  return (
    <div className="page">
      <section className="section-title">
        <h2>Gestion de entregas</h2>
        <p>
          Administra puntos de entrega y precios de delivery por municipio en
          Sonsonate.
        </p>
      </section>

      <section className="admin-dashboard-grid">
        <article className="dashboard-card">
          <span className="dashboard-label">Total de puntos</span>
          <strong>{deliveryPoints.length}</strong>
          <small>Puntos registrados en el sistema</small>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-label">Activos</span>
          <strong>{activeCount}</strong>
          <small>Disponibles para seleccionar</small>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-label">Inactivos</span>
          <strong>{inactiveCount}</strong>
          <small>Ocultos para el cliente</small>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-label">Cobertura delivery</span>
          <strong>Sonsonate</strong>
          <small>Por ahora solo se permiten municipios de Sonsonate.</small>
        </article>
      </section>

      <section className="admin-panel-card">
        <div className="admin-panel-card-header">
          <div>
            <h3>Precios de delivery por municipio</h3>
            <p>
              Ajusta el costo segun la distancia. Estos precios aparecen en el
              carrito cuando el cliente escoge delivery.
            </p>
          </div>
        </div>

        <form className="delivery-rates-grid" onSubmit={handleDeliveryRatesSubmit}>
          {SONSONATE_MUNICIPALITIES.map((municipality) => (
            <label key={municipality}>
              {municipality}
              <input
                type="number"
                min="0"
                step="0.01"
                value={rateInputs[municipality] || "0.00"}
                onChange={(e) =>
                  setRateInputs((prev) => ({
                    ...prev,
                    [municipality]: e.target.value
                  }))
                }
              />
            </label>
          ))}

          <div className="admin-actions-row delivery-rates-actions">
            <button type="submit" className="admin-primary-btn">
              Guardar tarifas
            </button>
          </div>
        </form>
      </section>

      {localMessage && <div className="form-success">{localMessage}</div>}

      <section className="admin-users-layout">
        <article className="admin-panel-card">
          <div className="admin-panel-card-header">
            <div>
              <h3>{editingId ? "Editar punto de entrega" : "Nuevo punto de entrega"}</h3>
              <p>Completa la informacion que vera el cliente al elegir punto de entrega.</p>
            </div>
          </div>

          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label>
              Nombre del punto
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ejemplo: Metrocentro Sonsonate"
              />
            </label>

            <label>
              Direccion
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Escribe la direccion"
              />
            </label>

            <label>
              Referencia
              <input
                type="text"
                name="reference"
                value={form.reference}
                onChange={handleChange}
                placeholder="Ejemplo: Entrada principal"
              />
            </label>

            <label>
              Horario
              <input
                type="text"
                name="schedule"
                value={form.schedule}
                onChange={handleChange}
                placeholder="Ejemplo: Lunes a sabado, 2:00 PM - 5:00 PM"
              />
            </label>

            <label className="permissions-box">
              <span className="permissions-title">Estado del punto</span>
              <div className="permission-row">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <span>Activo y visible para el cliente</span>
              </div>
            </label>

            <div className="admin-actions-row">
              <button type="submit" className="admin-primary-btn">
                {editingId ? "Guardar cambios" : "Agregar punto"}
              </button>

              {editingId && (
                <button type="button" className="admin-secondary-btn" onClick={resetForm}>
                  Cancelar edicion
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="admin-panel-card">
          <div className="admin-panel-card-header">
            <div>
              <h3>Puntos registrados</h3>
              <p>Administra los puntos disponibles para el retiro del pedido.</p>
            </div>
          </div>

          {deliveryPoints.length === 0 ? (
            <div className="empty-cart">
              <h3>No hay puntos de entrega</h3>
              <p>Agrega el primero para comenzar.</p>
            </div>
          ) : (
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Direccion</th>
                    <th>Referencia</th>
                    <th>Horario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryPoints.map((point) => (
                    <tr key={point.id}>
                      <td>{point.name}</td>
                      <td>{point.address}</td>
                      <td>{point.reference || "Sin referencia"}</td>
                      <td>{point.schedule || "No especificado"}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            point.isActive ? "status-active" : "status-inactive"
                          }`}
                        >
                          {point.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            className="user-edit-btn"
                            onClick={() => handleEdit(point)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="user-delete-btn"
                            onClick={() => handleDelete(point.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default AdminDeliveryPoints;

import { Link, useNavigate } from "react-router-dom";

function AdminMenu({
  currentUser,
  products = [],
  users = [],
  orders = [],
  deliveryPoints = [],
  uncategorizedCount = 0,
  pendingOrdersCount = 0,
  activeDeliveryPoints = 0
}) {
  const navigate = useNavigate();
  const permissions = currentUser?.permissions || {};

  const totalRevenue = orders
    .filter(
      (order) =>
        order.status === "CONFIRMED" || order.status === "PENDING_WHATSAPP"
    )
    .reduce((acc, order) => acc + Number(order.total || 0), 0);

  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalOrders = orders.length;

  const chartValues = [
    Math.max(90, totalRevenue * 0.45),
    Math.max(140, totalProducts * 28),
    Math.max(210, totalOrders * 65),
    Math.max(290, pendingOrdersCount * 90 + totalRevenue),
    Math.max(360, totalRevenue + activeDeliveryPoints * 75)
  ];

  const chartMax = Math.max(...chartValues, 600);

  const goTo = (path, permissionName) => {
    if (permissionName && !permissions[permissionName]) return;
    navigate(path);
  };

  return (
    <div className="dashboard-reference-page admin-home-reference-page">
      <aside className="dashboard-reference-sidebar">
        {permissions.dashboard && (
          <button
            type="button"
            className="dashboard-side-item active"
            onClick={() => goTo("/admin/dashboard", "dashboard")}
          >
            <span className="side-icon">▦</span>
            Overview
          </button>
        )}

        {permissions.products && (
          <button
            type="button"
            className="dashboard-side-item"
            onClick={() => goTo("/admin/products", "products")}
          >
            <span className="side-icon">◇</span>
            Productos
          </button>
        )}

        {permissions.users && (
          <button
            type="button"
            className="dashboard-side-item"
            onClick={() => goTo("/admin/users", "users")}
          >
            <span className="side-icon">♙</span>
            Usuarios
          </button>
        )}

        {permissions.orders && (
          <button
            type="button"
            className="dashboard-side-item"
            onClick={() => goTo("/admin/orders", "orders")}
          >
            <span className="side-icon">▣</span>
            Pedidos
          </button>
        )}

        {permissions.deliveryPoints && (
          <button
            type="button"
            className="dashboard-side-item"
            onClick={() => goTo("/admin/delivery-points", "deliveryPoints")}
          >
            <span className="side-icon">⌖</span>
            Direcciones
          </button>
        )}
      </aside>

      <main className="dashboard-reference-main">
        <section className="dashboard-reference-heading">
          <h2>Dashboard Overview</h2>
          <p>
            Bienvenido{currentUser?.username ? `, ${currentUser.username}` : ""} al panel de administración
          </p>
        </section>

        <section className="dashboard-reference-stats">
          <AdminHomeCard
            icon="↗"
            label="Ingresos Totales"
            value={`$${totalRevenue.toFixed(2)}`}
            variant="pink"
            enabled={permissions.orders}
            onClick={() => goTo("/admin/orders", "orders")}
          />

          <AdminHomeCard
            icon="⬡"
            label="Total Productos"
            value={totalProducts}
            variant="blue"
            enabled={permissions.products}
            onClick={() => goTo("/admin/products", "products")}
          />

          <AdminHomeCard
            icon="♙"
            label="Total Usuarios"
            value={totalUsers}
            variant="cyan"
            enabled={permissions.users}
            onClick={() => goTo("/admin/users", "users")}
          />

          <AdminHomeCard
            icon="▣"
            label="Total Pedidos"
            value={totalOrders}
            variant="purple"
            enabled={permissions.orders}
            onClick={() => goTo("/admin/orders", "orders")}
          />
        </section>

        <section className="dashboard-chart-card admin-home-chart-card">
          <h3>Ventas Mensuales</h3>
          <div className="dashboard-chart-area" aria-label="Gráfico de ventas mensuales">
            <div className="chart-grid-line line-1">600</div>
            <div className="chart-grid-line line-2">450</div>
            <div className="chart-grid-line line-3">300</div>
            <div className="chart-grid-line line-4">150</div>
            <div className="chart-axis-zero">0</div>

            <div className="chart-bars">
              {chartValues.map((value, index) => (
                <div className="chart-column" key={index}>
                  <div
                    className="chart-bar"
                    style={{ height: `${Math.min(100, (value / chartMax) * 100)}%` }}
                  />
                  <span>{["Ene", "Feb", "Mar", "Abr", "May"][index]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-reference-bottom admin-home-shortcuts">
          {permissions.dashboard && (
            <Link to="/admin/dashboard" className="dashboard-mini-card">
              <span>Resumen</span>
              <strong>Ver</strong>
            </Link>
          )}

          {permissions.orders && (
            <Link to="/admin/orders" className="dashboard-mini-card">
              <span>Pedidos pendientes</span>
              <strong>{pendingOrdersCount}</strong>
            </Link>
          )}

          {permissions.products && (
            <Link to="/admin/products" className="dashboard-mini-card">
              <span>Sin categoría</span>
              <strong>{uncategorizedCount}</strong>
            </Link>
          )}

          {permissions.deliveryPoints && (
            <Link to="/admin/delivery-points" className="dashboard-mini-card">
              <span>Puntos activos</span>
              <strong>{activeDeliveryPoints}</strong>
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}

function AdminHomeCard({ icon, label, value, variant, enabled, onClick }) {
  const Tag = enabled ? "button" : "article";

  return (
    <Tag
      type={enabled ? "button" : undefined}
      className={enabled ? "dashboard-reference-card" : "dashboard-reference-card disabled"}
      onClick={enabled ? onClick : undefined}
    >
      <span className={`dashboard-reference-icon ${variant}`}>{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </Tag>
  );
}

export default AdminMenu;

import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard({
  products = [],
  cart = [],
  users = [],
  orders = [],
  deliveryPoints = [],
  currentUser = null,
  uncategorizedCount = 0
}) {
  const navigate = useNavigate();
  const permissions = currentUser?.permissions || {};

  const dashboardMetrics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((product) => product.isActive !== false).length;
    const outOfStock = products.filter((product) => Number(product.stock) === 0).length;
    const lowStock = products.filter(
      (product) => Number(product.stock) > 0 && Number(product.stock) <= 2
    ).length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status === "PENDING_WHATSAPP").length;
    const confirmedOrders = orders.filter((order) => order.status === "CONFIRMED").length;
    const cancelledOrders = orders.filter((order) => order.status === "CANCELLED").length;

    const totalRevenue = orders
      .filter((order) => order.status === "CONFIRMED" || order.status === "PENDING_WHATSAPP")
      .reduce((acc, order) => acc + Number(order.total || 0), 0);

    const deliveryOrders = orders.filter((order) => order.deliveryMethod === "DELIVERY").length;
    const pickupOrders = orders.filter((order) => order.deliveryMethod === "PICKUP_POINT").length;
    const activeDeliveryPoints = deliveryPoints.filter((point) => point.isActive).length;

    const productSalesMap = {};

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!productSalesMap[item.name]) productSalesMap[item.name] = 0;
        productSalesMap[item.name] += Number(item.quantity || 0);
      });
    });

    const topProducts = Object.entries(productSalesMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      totalRevenue,
      deliveryOrders,
      pickupOrders,
      activeDeliveryPoints,
      topProducts
    };
  }, [products, orders, deliveryPoints]);

  const chartValues = [
    Math.max(80, dashboardMetrics.totalRevenue * 0.45),
    Math.max(120, dashboardMetrics.totalProducts * 28),
    Math.max(210, dashboardMetrics.totalOrders * 65),
    Math.max(260, dashboardMetrics.pendingOrders * 90 + dashboardMetrics.totalRevenue),
    Math.max(340, dashboardMetrics.totalRevenue + dashboardMetrics.activeDeliveryPoints * 75)
  ];

  const chartMax = Math.max(...chartValues, 600);

  const goTo = (path, permissionName) => {
    if (permissionName && !permissions[permissionName]) return;
    navigate(path);
  };

  return (
    <div className="page admin-overview-page">
      <section className="dashboard-reference-heading">
        <h2>Dashboard Overview</h2>
        <p>
          Bienvenido{currentUser?.username ? `, ${currentUser.username}` : ""} al panel de administración.
        </p>
      </section>

      <section className="dashboard-reference-stats">
        <DashboardMetricCard
          icon="↗"
          label="Ingresos Totales"
          value={`$${dashboardMetrics.totalRevenue.toFixed(2)}`}
          variant="pink"
          enabled={permissions.orders}
          onClick={() => goTo("/admin/orders", "orders")}
        />
        <DashboardMetricCard
          icon="⬡"
          label="Total Productos"
          value={dashboardMetrics.totalProducts}
          variant="blue"
          enabled={permissions.products}
          onClick={() => goTo("/admin/products", "products")}
        />
        <DashboardMetricCard
          icon="♙"
          label="Total Usuarios"
          value={users.length}
          variant="cyan"
          enabled={permissions.users}
          onClick={() => goTo("/admin/users", "users")}
        />
        <DashboardMetricCard
          icon="▣"
          label="Total Pedidos"
          value={dashboardMetrics.totalOrders}
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

      <section className="dashboard-reference-bottom">
        {permissions.products && (
          <Link to="/admin/products" className="dashboard-mini-card">
            <span>Productos activos</span>
            <strong>{dashboardMetrics.activeProducts}</strong>
          </Link>
        )}
        {permissions.products && (
          <Link to="/admin/products" className="dashboard-mini-card">
            <span>Sin stock</span>
            <strong>{dashboardMetrics.outOfStock}</strong>
          </Link>
        )}
        {permissions.products && (
          <Link to="/admin/products" className="dashboard-mini-card">
            <span>Stock bajo</span>
            <strong>{dashboardMetrics.lowStock}</strong>
          </Link>
        )}
        {permissions.deliveryPoints && (
          <Link to="/admin/delivery-points" className="dashboard-mini-card">
            <span>Puntos activos</span>
            <strong>{dashboardMetrics.activeDeliveryPoints}</strong>
          </Link>
        )}
      </section>

      <section className="admin-overview-lower-grid">
        <article className="admin-panel-card glass-panel-clean">
          <div className="admin-panel-card-header">
            <div>
              <h3>Resumen operativo</h3>
              <p>Estado general de pedidos, productos y entregas.</p>
            </div>
          </div>

          <div className="dashboard-summary-list">
            <InfoRow label="Pedidos confirmados" value={dashboardMetrics.confirmedOrders} />
            <InfoRow label="Pedidos pendientes" value={dashboardMetrics.pendingOrders} />
            <InfoRow label="Pedidos cancelados" value={dashboardMetrics.cancelledOrders} />
            <InfoRow label="Pedidos delivery" value={dashboardMetrics.deliveryOrders} />
            <InfoRow label="Pedidos en punto" value={dashboardMetrics.pickupOrders} />
            <InfoRow label="Sin categoría" value={uncategorizedCount} />
          </div>
        </article>

        <article className="admin-panel-card glass-panel-clean">
          <div className="admin-panel-card-header">
            <div>
              <h3>Productos más pedidos</h3>
              <p>Los productos con mas movimiento en los pedidos registrados.</p>
            </div>
          </div>

          {dashboardMetrics.topProducts.length === 0 ? (
            <div className="empty-cart dashboard-empty-box">
              <h3>Aún no hay datos de ventas</h3>
              <p>Cuando entren pedidos, aquí verás los productos destacados.</p>
            </div>
          ) : (
            <div className="dashboard-summary-list">
              {dashboardMetrics.topProducts.map((product, index) => (
                <InfoRow
                  key={product.name}
                  label={`#${index + 1} ${product.name}`}
                  value={`${product.quantity} uds.`}
                />
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

function DashboardMetricCard({ icon, label, value, variant, enabled, onClick }) {
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

function InfoRow({ label, value }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default AdminDashboard;

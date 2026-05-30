import { NavLink, useLocation } from "react-router-dom";

const ADMIN_LINKS = [
  {
    path: "/admin",
    label: "Overview",
    permission: "dashboard",
    icon: "▦",
    match: (pathname) => pathname === "/admin" || pathname === "/admin/dashboard"
  },
  {
    path: "/admin/products",
    label: "Productos",
    permission: "products",
    icon: "◇"
  },
  {
    path: "/admin/users",
    label: "Usuarios",
    permission: "users",
    icon: "♙"
  },
  {
    path: "/admin/orders",
    label: "Pedidos",
    permission: "orders",
    icon: "▣"
  },
  {
    path: "/admin/delivery-points",
    label: "Direcciones",
    permission: "deliveryPoints",
    icon: "⌖"
  }
];

function AdminLayout({
  children,
  currentUser,
  pendingOrdersCount = 0,
  uncategorizedCount = 0,
  activeDeliveryPoints = 0,
  totalProducts = 0,
  totalOrders = 0,
  totalUsers = 0
}) {
  const permissions = currentUser?.permissions || {};
  const location = useLocation();

  const getBadge = (permission) => {
    if (permission === "products" && uncategorizedCount > 0) return uncategorizedCount;
    if (permission === "orders" && pendingOrdersCount > 0) return pendingOrdersCount;
    if (permission === "deliveryPoints" && activeDeliveryPoints > 0) return activeDeliveryPoints;
    return null;
  };

  return (
    <div className="admin-shell-layout">
      <aside className="admin-sidebar-glass" aria-label="Menú del panel administrativo">
        <div className="admin-sidebar-user">
          <span className="admin-sidebar-avatar">
            {(currentUser?.username || currentUser?.name || "A").charAt(0).toUpperCase()}
          </span>
          <div>
            <strong>{currentUser?.username || currentUser?.name || "Admin"}</strong>
            <small>{currentUser?.role === "ADMIN" ? "Administrador" : "Usuario del panel"}</small>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {ADMIN_LINKS.map((item) => {
            const allowed = Boolean(permissions[item.permission]);
            const badge = getBadge(item.permission);

            if (!allowed) {
              return (
                <div key={item.path} className="admin-sidebar-link locked" title="No tienes permiso para esta sección">
                  <span className="admin-side-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  <em>Bloqueado</em>
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  item.match
                    ? item.match(location.pathname)
                      ? "admin-sidebar-link active"
                      : "admin-sidebar-link"
                    : isActive
                      ? "admin-sidebar-link active"
                      : "admin-sidebar-link"
                }
              >
                <span className="admin-side-icon">{item.icon}</span>
                <span>{item.label}</span>
                {badge ? <strong className="admin-side-badge">{badge}</strong> : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-mini-stats">
          <div>
            <span>Productos</span>
            <strong>{totalProducts}</strong>
          </div>
          <div>
            <span>Pedidos</span>
            <strong>{totalOrders}</strong>
          </div>
          <div>
            <span>Usuarios</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>
      </aside>

      <section className="admin-shell-content">
        {children}
      </section>
    </div>
  );
}

export default AdminLayout;

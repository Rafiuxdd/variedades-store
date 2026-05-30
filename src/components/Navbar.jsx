import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = React.memo(function Navbar({ cartCount, isLoggedIn, currentUser, logout }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  const isActive = (path) => location.pathname === path;

  if (isAdminPage && isLoggedIn) {
    return (
      <header className="modern-header admin-topbar">
        <div className="modern-header-inner admin-topbar-inner">
          <Link to="/admin/dashboard" className="modern-brand admin-brand-text">
            <div>
              <h1>Dashboard Admin</h1>
            </div>
          </Link>

          <nav className="modern-nav admin-topbar-actions">
            <Link className="admin-back-store" to="/">
              Volver a la tienda
            </Link>

            {currentUser?.username && (
              <span className="modern-user-text admin-user-pill">{currentUser.username}</span>
            )}

            <button type="button" className="modern-logout-btn admin-exit-btn" onClick={logout}>
              Salir
            </button>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="modern-header">
      <div className="modern-header-inner">
        <Link to="/" className="modern-brand">
          <div>
            <h1>Variedades Store</h1>
            <span>Belleza, hogar, tecnologia, moda y mascotas</span>
          </div>
        </Link>

        <nav className="modern-nav">
          <Link className={isActive("/") ? "modern-nav-link active" : "modern-nav-link"} to="/">
            Inicio
          </Link>

          {!isLoggedIn ? (
            <Link
              className={isActive("/panel") ? "modern-nav-link active" : "modern-nav-link"}
              to="/panel"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className={location.pathname.startsWith("/admin") ? "modern-nav-link active" : "modern-nav-link"}
              to="/admin"
            >
              Dashboard
            </Link>
          )}

          <Link
            className={isActive("/cart") ? "modern-nav-link modern-cart-link active" : "modern-nav-link modern-cart-link"}
            to="/cart"
            aria-label="Ver carrito"
          >
            Carrito
            <span className="modern-cart-badge">{cartCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
});

export default Navbar;

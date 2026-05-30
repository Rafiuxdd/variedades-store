import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <section className="footer-brand-block">
          <Link to="/" className="footer-brand">
            Variedades Store
          </Link>
          <p>
            Productos de belleza, tecnologia, hogar, moda, mascotas y regalos
            para comprar facil y coordinar por WhatsApp.
          </p>
        </section>

        <nav className="footer-links" aria-label="Informacion de la tienda">
          <div>
            <h3>Tienda</h3>
            <Link to="/">Inicio</Link>
            <Link to="/cart">Carrito</Link>
            <Link to="/como-comprar">Como comprar</Link>
          </div>

          <div>
            <h3>Ayuda</h3>
            <Link to="/contacto">Contacto</Link>
            <Link to="/terminos">Terminos y condiciones</Link>
            <Link to="/quienes-somos">Quienes somos</Link>
          </div>

          <div>
            <h3>Pedidos</h3>
            <p>Entrega por puntos acordados o delivery segun disponibilidad.</p>
            <p>Pagos en efectivo o por link de pago cuando este disponible.</p>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Variedades Store.</span>
        <span>Compra facil, pedido claro y atencion directa.</span>
      </div>
    </footer>
  );
}

export default Footer;

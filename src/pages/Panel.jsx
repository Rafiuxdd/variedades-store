import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Panel({ login }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      const result = await login(formData.email, formData.password);

      if (result.ok) {
        navigate("/admin");
        return;
      }

      setError(result.message || "Correo o contrasena incorrectos.");
    } catch (error) {
      setError(error.message || "No se pudo iniciar sesion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page panel-page">
      <section className="panel-auth-layout">
        <div className="panel-auth-card">
          <div className="panel-auth-header">
            <span>Panel administrativo</span>
            <h1>Variedades Store</h1>
            <p>
              Ingresa con tu usuario autorizado para gestionar productos,
              pedidos y puntos de entrega.
            </p>
          </div>

          <form className="panel-form-modern panel-auth-form" onSubmit={handleSubmit}>
            <label className="panel-auth-field">
              <span>Correo</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@tienda.com"
                autoComplete="username"
              />
            </label>

            <label className="panel-auth-field">
              <span>Contrasena</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contrasena"
                autoComplete="current-password"
              />
            </label>

            <p className={`error-text panel-error-slot ${error ? "visible" : ""}`}>
              {error || " "}
            </p>

            <button type="submit" className="panel-auth-submit" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Entrar"}
            </button>
          </form>
        </div>

        <aside className="panel-auth-info">
          <span>Administracion</span>
          <h2>Control claro para la operacion diaria.</h2>
          <div className="panel-auth-list">
            <p>Productos e inventario</p>
            <p>Pedidos por WhatsApp</p>
            <p>Usuarios y permisos</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Panel;

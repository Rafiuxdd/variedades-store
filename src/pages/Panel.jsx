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

      setError(result.message || "Correo o contraseña incorrectos.");
    } catch (error) {
      setError(error.message || "No se pudo iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page panel-page panel-fashion-page">
      <div className="panel-fashion-layout balanced-layout">
        <section className="panel-fashion-card panel-login-card balanced-card balanced-main-card">
          <div className="panel-login-top">
            <span className="panel-overline">Admin access</span>
            <button type="button" className="panel-ghost-btn">
              Sign in
            </button>
          </div>

          <div className="panel-login-main">
            <h2>Log in</h2>

            <form className="panel-form-modern" onSubmit={handleSubmit}>
              <div className="panel-input-wrap">
                <span className="panel-input-icon">@</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo"
                  autoComplete="username"
                />
              </div>

              <div className="panel-input-wrap">
                <span className="panel-input-icon">⌁</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="password"
                  autoComplete="current-password"
                />
              </div>

              <p className={`error-text panel-error-slot ${error ? "visible" : ""}`}>
                {error || " "}
              </p>

              <div className="panel-form-bottom">
                <p>Accede al panel administrativo de la tienda.</p>

                <button type="submit" className="panel-arrow-btn" disabled={isLoading}>
                  {isLoading ? "..." : "→"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="panel-fashion-card panel-date-card balanced-card">
          <div className="panel-date-content">
            <h3>Admin</h3>
            <div className="panel-year">Panel</div>

            <div className="panel-date-meta">
              <p>Variedades Store</p>
              <p>Gestión de productos</p>
              <p>Pedidos y puntos de entrega</p>
            </div>
          </div>

          <div className="panel-date-glow" />
        </section>

        <section className="panel-fashion-card panel-reference-card instagram-card balanced-card">
          <div>
            <h3>Instagram</h3>
            <p>@variedades_store</p>
          </div>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="panel-dark-action instagram-action"
          >
            Ver perfil
          </a>
        </section>
      </div>
    </div>
  );
}

export default Panel;

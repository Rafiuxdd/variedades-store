import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";

function Home({ products, addToCart, isLoadingStore = false }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    return ["Todas", ...uniqueCategories];
  }, [products]);

  const categoryStats = useMemo(() => {
    const stats = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const featuredProducts = useMemo(() => {
    return products.slice(0, 3);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = search.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(text) ||
        product.description.toLowerCase().includes(text) ||
        product.category.toLowerCase().includes(text);

      const matchesCategory =
        category === "Todas" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const handleExplore = () => {
    const section = document.getElementById("products-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="page store-home-page">
      <section className="commerce-hero">
        <div className="commerce-hero-copy">
          <span className="commerce-eyebrow">Tienda de variedades</span>
          <h2>Compra productos utiles con atencion directa por WhatsApp</h2>
          <p>
            Un catalogo organizado para encontrar rapido articulos de belleza,
            tecnologia, hogar, moda, mascotas y regalos. Arma tu pedido y
            mandalo listo para confirmar.
          </p>

          <div className="commerce-actions">
            <button
              className="hero-button"
              type="button"
              onClick={handleExplore}
            >
              Ver catalogo
            </button>
            <a className="secondary-hero-link" href="/como-comprar">
              Como comprar
            </a>
          </div>
        </div>

        <div className="commerce-hero-panel" aria-label="Resumen de tienda">
          <div className="commerce-panel-top">
            <span>Pedido rapido</span>
            <strong>WhatsApp</strong>
          </div>

          <div className="commerce-metrics">
            <div>
              <strong>{products.length}</strong>
              <span>Productos</span>
            </div>
            <div>
              <strong>{Math.max(categories.length - 1, 0)}</strong>
              <span>Categorias</span>
            </div>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="hero-feature-list">
              {featuredProducts.map((product) => (
                <article key={product.id} className="hero-feature-item">
                  <img src={product.image} alt={product.name} />
                  <div>
                    <span>{product.category}</span>
                    <strong>{product.name}</strong>
                  </div>
                  <em>${Number(product.price).toFixed(2)}</em>
                </article>
              ))}
            </div>
          ) : (
            <div className="hero-service-list">
              <div>
                <strong>Catalogo por categorias</strong>
                <span>Productos ordenados para comprar sin vueltas.</span>
              </div>
              <div>
                <strong>Pedido listo para enviar</strong>
                <span>El carrito prepara el mensaje para WhatsApp.</span>
              </div>
              <div>
                <strong>Panel administrativo</strong>
                <span>Inventario, pedidos, usuarios y entregas en un solo lugar.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="category-strip" aria-label="Categorias destacadas">
        {categoryStats.slice(0, 6).map((item) => (
          <button
            key={item.name}
            type="button"
            className={category === item.name ? "category-tile active" : "category-tile"}
            onClick={() => setCategory(item.name)}
          >
            <span>{item.name}</span>
            <strong>{item.count} productos</strong>
          </button>
        ))}
      </section>

      <section id="products-section" className="catalog-shell">
        <aside className="catalog-sidebar">
          <div className="catalog-sidebar-header">
            <span>Catalogo</span>
            <strong>{filteredProducts.length}</strong>
          </div>

          <label className="catalog-field">
            Buscar
            <input
              type="text"
              placeholder="Nombre, categoria o descripcion"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
            />
          </label>

          <div className="catalog-categories">
            <span>Categoria</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={category === cat ? "catalog-category active" : "catalog-category"}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <div className="catalog-main">
          <div className="catalog-heading">
            <div>
              <span>Productos disponibles</span>
              <h2>{category === "Todas" ? "Catalogo completo" : category}</h2>
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
              aria-label="Seleccionar categoria"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {isLoadingStore ? (
            <div className="empty-cart">
              <h3>Cargando productos...</h3>
              <p>Estamos trayendo el catalogo desde la base de datos.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-cart">
              <h3>No se encontraron productos</h3>
              <p>Prueba con otro nombre o selecciona otra categoria.</p>
            </div>
          ) : (
            <section className="products-grid catalog-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                />
              ))}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;

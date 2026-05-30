import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../lib/api";
import { mapProductFromApi } from "../lib/mapper";

function splitProductInfo(description = "") {
  const lines = String(description)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  const summary = [];

  for (const line of lines) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex > 0 && separatorIndex < 28) {
      sections.push({
        label: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim()
      });
    } else {
      summary.push(line);
    }
  }

  return {
    summary: summary.join(" ") || description,
    sections
  };
}

function ProductDetail({ products = [], addToCart }) {
  const { id } = useParams();
  const [remoteProduct, setRemoteProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const localProduct = useMemo(
    () => products.find((product) => String(product.id) === String(id)),
    [products, id]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getProduct(id);
        const product = mapProductFromApi(response.data);

        if (isMounted) {
          setRemoteProduct(product);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || "No se pudo cargar el producto.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const product = remoteProduct || localProduct;
  const productInfo = splitProductInfo(product?.description || "");
  const isOutOfStock = Number(product?.stock || 0) <= 0;

  if (isLoading && !product) {
    return (
      <div className="page">
        <div className="empty-cart">
          <h3>Cargando producto...</h3>
          <p>Estamos preparando la ficha completa.</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="empty-cart">
          <h3>Producto no encontrado</h3>
          <p>{error || "Este producto no esta disponible en el catalogo."}</p>
          <Link className="secondary-hero-link" to="/">
            Volver al catalogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page product-detail-page">
      <section className="product-detail-layout">
        <div className="product-detail-media">
          <img
            src={product.image}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.src = "/product-images/no-image.svg";
            }}
          />
        </div>

        <article className="product-detail-info">
          <Link className="product-back-link" to="/">
            Volver al catalogo
          </Link>

          <span className="product-card-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-detail-summary">{productInfo.summary}</p>

          <div className="product-detail-purchase">
            <strong>${Number(product.price).toFixed(2)}</strong>
            <span className={isOutOfStock ? "stock-text out" : "stock-text"}>
              {isOutOfStock ? "Agotado" : `${Number(product.stock)} disponibles`}
            </span>
          </div>

          {productInfo.sections.length > 0 && (
            <div className="product-detail-specs">
              {productInfo.sections.map((section) => (
                <div key={`${section.label}-${section.value}`}>
                  <span>{section.label}</span>
                  <p>{section.value}</p>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`checkout-submit ${isOutOfStock ? "disabled-btn" : ""}`}
            disabled={isOutOfStock}
            onClick={() => addToCart(product.id)}
          >
            {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
          </button>
        </article>
      </section>
    </div>
  );
}

export default ProductDetail;

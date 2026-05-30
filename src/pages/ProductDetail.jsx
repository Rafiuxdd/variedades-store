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

const COLOR_HEX = {
  amarillo: "#f7d84a",
  azul: "#2f80ed",
  blanco: "#ffffff",
  marron: "#8b5e3c",
  morado: "#8e44ad",
  multicolor: "linear-gradient(135deg, #ef4444, #f59e0b, #22c55e, #3b82f6)",
  naranja: "#f97316",
  negro: "#111827",
  nude: "#d8a48f",
  rojo: "#dc2626",
  rosado: "#f472b6",
  rosa: "#fb7185",
  terracota: "#b75c38",
  transparente: "linear-gradient(135deg, #ffffff, #dbeafe)",
  verde: "#22c55e",
  vino: "#7f1d1d"
};

function normalizeOptionLabel(value = "") {
  return String(value)
    .replace(/\.$/, "")
    .trim();
}

function extractListFromSection(value = "") {
  return value
    .replace(/segun disponibilidad/gi, "")
    .replace(/luego se retiran[\s\S]*$/i, "")
    .split(/,|\sy\s/)
    .map(normalizeOptionLabel)
    .filter((item) => item && item.length > 1);
}

function buildProductOptions(sections = []) {
  const options = {};

  for (const section of sections) {
    const label = section.label.toLowerCase();

    if (label.includes("colores")) {
      const values = extractListFromSection(section.value)
        .map((value) => value.replace(/^\d+\s+/, "").trim())
        .filter((value) => !value.toLowerCase().includes("confirmar tonos"));

      if (values.length > 0) {
        options.Color = [...new Set(values)];
      }
    }

    if (label.includes("modelos iphone")) {
      const values = extractListFromSection(section.value);

      if (values.length > 0) {
        options.Modelo = [...new Set(values)];
      }
    }
  }

  return options;
}

function ProductDetail({ products = [], addToCart }) {
  const { id } = useParams();
  const [remoteProduct, setRemoteProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});

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
  const productInfo = useMemo(
    () => splitProductInfo(product?.description || ""),
    [product?.description]
  );
  const visibleSections = productInfo.sections.filter((section) => {
    const label = section.label.toLowerCase();
    return !label.includes("colores") && !label.includes("modelos iphone");
  });
  const optionGroups = useMemo(
    () => buildProductOptions(productInfo.sections),
    [productInfo.sections]
  );
  const isOutOfStock = Number(product?.stock || 0) <= 0;

  useEffect(() => {
    const defaults = {};

    for (const [name, values] of Object.entries(optionGroups)) {
      defaults[name] = values[0] || "";
    }

    setSelectedOptions(defaults);
  }, [optionGroups]);

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

          {visibleSections.length > 0 && (
            <div className="product-detail-specs">
              {visibleSections.map((section) => (
                <div key={`${section.label}-${section.value}`}>
                  <span>{section.label}</span>
                  <p>{section.value}</p>
                </div>
              ))}
            </div>
          )}

          {Object.keys(optionGroups).length > 0 && (
            <div className="product-option-groups">
              {Object.entries(optionGroups).map(([groupName, values]) => (
                <fieldset key={groupName} className="product-option-group">
                  <legend>{groupName}</legend>

                  <div
                    className={
                      groupName === "Color"
                        ? "product-swatch-list"
                        : "product-model-list"
                    }
                  >
                    {values.map((value) => {
                      const colorKey = value.toLowerCase();
                      const swatch = COLOR_HEX[colorKey] || "#e5e7eb";
                      const isSelected = selectedOptions[groupName] === value;

                      return (
                        <label
                          key={`${groupName}-${value}`}
                          className={isSelected ? "option-choice active" : "option-choice"}
                          title={value}
                        >
                          <input
                            type="radio"
                            name={groupName}
                            value={value}
                            checked={isSelected}
                            onChange={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [groupName]: value
                              }))
                            }
                          />

                          {groupName === "Color" ? (
                            <span
                              className="color-swatch"
                              style={{ background: swatch }}
                              aria-hidden="true"
                            />
                          ) : null}

                          <span>{value}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`checkout-submit ${isOutOfStock ? "disabled-btn" : ""}`}
            disabled={isOutOfStock}
            onClick={() => addToCart(product.id, selectedOptions)}
          >
            {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
          </button>
        </article>
      </section>
    </div>
  );
}

export default ProductDetail;

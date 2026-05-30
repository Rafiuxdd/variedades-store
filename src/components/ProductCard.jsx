import React from "react";

const ProductCard = React.memo(function ProductCard({ product, addToCart }) {
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = "/product-images/no-image.svg";
          }}
        />

        <div className="product-badges">
          <span className="product-category-badge">{product.category}</span>

          {isOutOfStock ? (
            <span className="product-status-badge out">Sin stock</span>
          ) : (
            <span className="product-status-badge in">Disponible</span>
          )}
        </div>
      </div>

      <div className="product-content">
        <span className="product-card-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <div className="product-purchase-row">
          <p className="price">${Number(product.price).toFixed(2)}</p>
          <span className={isOutOfStock ? "stock-text out" : "stock-text"}>
            {isOutOfStock ? "Agotado" : `${Number(product.stock)} disponibles`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product.id)}
          disabled={isOutOfStock}
          className={`product-button ${isOutOfStock ? "disabled-btn" : ""}`}
        >
          {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
});

export default ProductCard;

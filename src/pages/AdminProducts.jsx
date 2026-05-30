import { useMemo, useState } from "react";
import { uploadImageToCloudinary } from "../lib/cloudinary";

function AdminProducts({
  products = [],
  categories = [],
  addCategory,
  deleteCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  currentUser
}) {
  const emptyForm = {
    id: null,
    name: "",
    price: "",
    image: "",
    description: "",
    stock: "",
    category: categories[0] || "Sin categoría"
  };

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  const canProducts = currentUser?.permissions?.products;

  const filteredProducts = useMemo(() => {
    const text = search.toLowerCase().trim();

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(text) ||
        product.category.toLowerCase().includes(text) ||
        product.description.toLowerCase().includes(text)
      );
    });
  }, [products, search]);

  if (!canProducts) {
    return (
      <div className="page admin-soft-page">
        <div className="admin-soft-card dark-card compact-dashboard-card">
          <h3>No tienes acceso</h3>
          <p>No cuentas con permisos para gestionar productos.</p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      price: "",
      image: "",
      description: "",
      stock: "",
      category: categories[0] || "Sin categoría"
    });
    setIsEditing(false);
    setFormError("");
    setIsUploadingImage(false);
    setLocalPreview("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "image") {
      setLocalPreview("");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError("");

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    try {
      setIsUploadingImage(true);

      const imageUrl = await uploadImageToCloudinary(file);

      setForm((prev) => ({
        ...prev,
        image: imageUrl
      }));

      setFormError("");
    } catch (error) {
      console.error(error);
      setFormError(error.message || "No se pudo subir la imagen.");
      setForm((prev) => ({
        ...prev,
        image: ""
      }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();

    if (!newCategory.trim()) return;

    addCategory(newCategory);
    setNewCategory("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isUploadingImage) {
      setFormError("Espera a que la imagen termine de subirse.");
      return;
    }

    if (form.name.trim().length < 3) {
      setFormError("El nombre del producto debe tener al menos 3 caracteres.");
      return;
    }

    if (Number(form.price) <= 0) {
      setFormError("El precio debe ser mayor que 0.");
      return;
    }

    if (Number(form.stock) < 0) {
      setFormError("El stock no puede ser negativo.");
      return;
    }

    if (!form.image.trim()) {
      setFormError("Debes seleccionar una imagen o colocar una URL.");
      return;
    }

    if (form.description.trim().length < 8) {
      setFormError("La descripción es demasiado corta.");
      return;
    }

    if (!form.category.trim()) {
      setFormError("Debes seleccionar una categoría.");
      return;
    }

    const cleanProduct = {
      ...form,
      name: form.name.trim(),
      image: form.image.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category.trim()
    };

    if (isEditing) {
      updateProduct(cleanProduct);
    } else {
      addProduct(cleanProduct);
    }

    resetForm();
  };

  const handleEdit = (product) => {
    setForm({
      ...product,
      price: String(product.price),
      stock: String(product.stock)
    });

    setLocalPreview("");
    setIsEditing(true);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previewImage = localPreview || form.image;

  return (
    <div className="page admin-soft-page">
      <section className="admin-soft-header">
        <div>
          <span className="admin-soft-overline">Productos</span>
          <h2>Gestión de productos</h2>
          <p>Administra inventario, imágenes y categorías.</p>
        </div>

        <div className="admin-soft-user-pill">
          Total: {products.length}
        </div>
      </section>

      <div className="admin-soft-admin-layout">
        <section className="admin-soft-card light-card admin-soft-form-card">
          <div className="admin-soft-card-top">
            <span className="admin-soft-index">01</span>
            <span className="admin-soft-plus">{isEditing ? "✎" : "+"}</span>
          </div>

          <h3>{isEditing ? "Editar producto" : "Nuevo producto"}</h3>

          <form className="admin-soft-form" onSubmit={handleSubmit}>
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Cable Tipo C MTMAX"
            />

            <label>Precio</label>
            <input
              type="number"
              name="price"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="Ej: 4.99"
            />

            <label>Stock</label>
            <input
              type="number"
              name="stock"
              step="1"
              value={form.stock}
              onChange={handleChange}
              placeholder="Ej: 8"
            />

            <label>Categoría</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="admin-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label>Subir imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploadingImage}
            />

            {isUploadingImage ? (
              <p className="form-success">Subiendo imagen a Cloudinary...</p>
            ) : null}

            <label>O pegar URL</label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
            />

            {previewImage ? (
              <div className="image-preview-box admin-soft-preview">
                <img
                  src={previewImage}
                  alt="Vista previa"
                  className="image-preview"
                  onError={(e) => {
                    e.target.src = "/product-images/no-image.svg";
                  }}
                />
              </div>
            ) : null}

            <label>Descripción</label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe el producto"
            />

            {formError ? <p className="error-text">{formError}</p> : null}

            <div className="admin-soft-form-actions">
              <button type="submit" disabled={isUploadingImage}>
                {isUploadingImage
                  ? "Subiendo imagen..."
                  : isEditing
                  ? "Guardar cambios"
                  : "Agregar producto"}
              </button>

              {isEditing ? (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <div className="admin-soft-category-box">
            <h4>Categorías</h4>

            <form onSubmit={handleAddCategory} className="admin-soft-category-form">
              <input
                type="text"
                placeholder="Nueva categoría"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button type="submit">Agregar</button>
            </form>

            <div className="category-chip-list">
              {categories.map((category) => (
                <div key={category} className="category-chip">
                  <span>{category}</span>

                  {category !== "Sin categoría" ? (
                    <button
                      type="button"
                      className="chip-delete-btn"
                      onClick={() => deleteCategory(category)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <span className="protected-chip">Protegida</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-soft-card dark-card admin-soft-list-card">
          <div className="admin-soft-card-top">
            <span className="admin-soft-index">02</span>
            <span className="admin-soft-plus">⌕</span>
          </div>

          <h3>Productos creados</h3>

          <div className="admin-soft-search">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-soft-list">
            {filteredProducts.map((product) => (
              <article key={product.id} className="admin-soft-list-item product-row-soft">
                <img
                  src={product.image}
                  alt={product.name}
                  className="admin-product-thumb"
                  onError={(e) => {
                    e.target.src = "/product-images/no-image.svg";
                  }}
                />

                <div className="admin-soft-list-info">
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
                  <small>
                    ${Number(product.price).toFixed(2)} · Stock: {product.stock} · {product.category}
                  </small>
                </div>

                <div className="admin-soft-list-actions">
                  <button type="button" onClick={() => handleEdit(product)}>
                    Editar
                  </button>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}

            {filteredProducts.length === 0 ? (
              <div className="admin-soft-empty-state">
                <p>No se encontraron productos.</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminProducts;

export function mapProductFromApi(product) {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image: product.imageUrl || "/product-images/no-image.svg",
    description: product.description || "Sin descripcion disponible.",
    stock: Number(product.stock || 0),
    category: product.category?.name || "Sin categoría",
    isActive: product.isActive
  };
}

export function mapUserFromApi(user) {
  const role = user?.role || "EMPLOYEE";

  const defaultPermissions =
    role === "ADMIN"
      ? {
          dashboard: true,
          orders: true,
          users: true,
          products: true,
          deliveryPoints: true
        }
      : {
          dashboard: true,
          orders: false,
          users: false,
          products: true,
          deliveryPoints: false
        };

  const permissions = {
    ...defaultPermissions,
    ...(user?.permissions || {})
  };

  return {
    id: user.id,
    name: user.name || user.username || "",
    username: user.name || user.username || "",
    email: user.email || "",
    role,
    isActive: user.isActive !== false,
    permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

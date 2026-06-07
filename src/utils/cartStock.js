export function getCartQuantityForProduct(cart = [], productId) {
  return cart
    .filter((item) => (item.productId || item.id) === productId)
    .reduce((total, item) => total + Number(item.quantity || 0), 0);
}

export function applyCartStock(products = [], cart = []) {
  return products.map((product) => {
    const quantityInCart = getCartQuantityForProduct(cart, product.id);
    const availableStock = Math.max(0, Number(product.stock) - quantityInCart);

    return {
      ...product,
      stock: availableStock
    };
  });
}

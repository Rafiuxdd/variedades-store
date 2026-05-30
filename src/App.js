import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Panel from "./pages/Panel";
import InfoPage from "./pages/InfoPage";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminDeliveryPoints from "./pages/AdminDeliveryPoints";
import AdminOrders from "./pages/AdminOrders";

import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { useStoreData } from "./hooks/useStoreData";
import { DEFAULT_DELIVERY_RATES } from "./data/deliveryZones";

import {
  createCategory,
  deleteCategoryById,
  createProduct,
  updateProductById,
  deleteProductById,
  createDeliveryPoint,
  updateDeliveryPointById,
  deleteDeliveryPointById,
  getDeliveryRates,
  updateDeliveryRates,
  getOrders,
  confirmOrderById,
  cancelOrderById,
  createUser,
  updateUserById,
  deleteUserById,
  saveSession
} from "./lib/api";
import { mapProductFromApi, mapUserFromApi } from "./lib/mapper";

import "./App.css";

function App() {
  const {
    isLoggedIn,
    currentUser,
    setCurrentUser,
    users,
    setUsers,
    orders,
    setOrders,
    login,
    logout
  } = useAuth();

  const {
    cart,
    cartCount,
    addItemToCart,
    decreaseItemQuantity,
    removeCartItem,
    clearCart,
    setCart
  } = useCart();

  const {
    categories,
    categoryRecords,
    products,
    deliveryPoints,
    isLoadingStore,
    loadData,
    setCategoryRecords,
    setCategories,
    setProducts,
    setDeliveryPoints
  } = useStoreData();

  const [storeMessage, setStoreMessage] = useState("");
  const [deliveryRates, setDeliveryRates] = useState(() => {
    try {
      const saved = localStorage.getItem("deliveryRates");
      return saved
        ? { ...DEFAULT_DELIVERY_RATES, ...JSON.parse(saved) }
        : DEFAULT_DELIVERY_RATES;
    } catch (error) {
      console.error("Error reading delivery rates:", error);
      return DEFAULT_DELIVERY_RATES;
    }
  });

  useEffect(() => {
    async function loadDeliveryRates() {
      try {
        const response = await getDeliveryRates();
        setDeliveryRates({
          ...DEFAULT_DELIVERY_RATES,
          ...(response.data || {})
        });
      } catch (error) {
        console.error("Error loading delivery rates:", error);
      }
    }

    loadDeliveryRates();
  }, []);

  useEffect(() => {
    if (!storeMessage) return;
    const timer = setTimeout(() => setStoreMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [storeMessage]);

  useEffect(() => {
    localStorage.setItem("deliveryRates", JSON.stringify(deliveryRates));
  }, [deliveryRates]);

  const uncategorizedCount = useMemo(
    () => products.filter((product) => product.category === "Sin categoría").length,
    [products]
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === "PENDING_WHATSAPP").length,
    [orders]
  );

  const activeDeliveryPoints = useMemo(
    () => deliveryPoints.filter((point) => point.isActive).length,
    [deliveryPoints]
  );


  const productsForHome = useMemo(() => {
    return products.map((product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      const quantityInCart = cartItem ? Number(cartItem.quantity) : 0;
      const availableStock = Math.max(0, Number(product.stock) - quantityInCart);

      return {
        ...product,
        stock: availableStock
      };
    });
  }, [products, cart]);

  const addToCart = useCallback(
    (productId) => {
      const product = products.find((p) => p.id === productId);

      if (!product) {
        setStoreMessage("El producto no existe.");
        return;
      }

      const cartItem = cart.find((item) => item.id === productId);
      const quantityInCart = cartItem ? Number(cartItem.quantity) : 0;
      const availableStock = Number(product.stock) - quantityInCart;

      if (availableStock <= 0) {
        setStoreMessage(`"${product.name}" está agotado.`);
        return;
      }

      addItemToCart(product);
      setStoreMessage(`Agregaste "${product.name}" al carrito.`);
    },
    [products, cart, addItemToCart]
  );

  const removeOneFromCart = useCallback(
    (productId) => {
      const item = cart.find((product) => product.id === productId);
      if (!item) return;

      decreaseItemQuantity(productId);

      setStoreMessage(`Quitaste una unidad de "${item.name}".`);
    },
    [cart, decreaseItemQuantity]
  );

  const removeProductCompletely = useCallback(
    (productId) => {
      const item = cart.find((product) => product.id === productId);
      if (!item) return;

      removeCartItem(productId);

      setStoreMessage(`Eliminaste "${item.name}" del carrito.`);
    },
    [cart, removeCartItem]
  );

  const addUser = useCallback(async (newUser) => {
    const response = await createUser({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      isActive: newUser.isActive,
      permissions: newUser.permissions
    });

    const createdUser = mapUserFromApi(response.user || response.data);

    setUsers((prev) => [createdUser, ...prev]);
    setStoreMessage(`Usuario "${createdUser.name}" creado correctamente.`);
  }, [setUsers]);

  const updateUser = useCallback(
    async (updatedUser) => {
      const response = await updateUserById(updatedUser.id, {
        name: updatedUser.name,
        email: updatedUser.email,
        password: updatedUser.password || undefined,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        permissions: updatedUser.permissions
      });

      const savedUser = mapUserFromApi(response.user || response.data);

      setUsers((prev) =>
        prev.map((user) => (user.id === savedUser.id ? savedUser : user))
      );

      if (currentUser && currentUser.id === savedUser.id) {
        setCurrentUser(savedUser);
        saveSession(savedUser);
      }

      setStoreMessage(`Usuario "${savedUser.name}" actualizado correctamente.`);
    },
    [currentUser, setCurrentUser, setUsers]
  );

  const deleteUser = useCallback(
    async (id) => {
      if (currentUser && currentUser.id === id) return;

      const confirmed = window.confirm("¿Seguro que deseas eliminar este usuario?");
      if (!confirmed) return;

      await deleteUserById(id);

      setUsers((prev) => prev.filter((user) => user.id !== id));
      setStoreMessage("Usuario eliminado correctamente.");
    },
    [currentUser, setUsers]
  );

  const addCategory = useCallback(
    async (newCategory) => {
      const cleanCategory = newCategory.trim();
      if (!cleanCategory) return;

      try {
        const response = await createCategory({ name: cleanCategory });
        const createdCategory = response.data;

        const nextRecords = sortCategoriesByDate([createdCategory, ...categoryRecords]);
        setCategoryRecords(nextRecords);
        setCategories(buildCategoryNames(nextRecords));

        setStoreMessage(`Categoría "${cleanCategory}" agregada correctamente.`);
      } catch (error) {
        console.error(error);
        setStoreMessage(error.message || "No se pudo agregar la categoría.");
      }
    },
    [categoryRecords, setCategories, setCategoryRecords]
  );

  const deleteCategory = useCallback(
    async (categoryToDelete) => {
      if (categoryToDelete === "Sin categoría") {
        setStoreMessage('No puedes eliminar la categoría "Sin categoría".');
        return;
      }

      const confirmed = window.confirm(
        `¿Eliminar la categoría "${categoryToDelete}"? Los productos asignados pasarán a "Sin categoría".`
      );
      if (!confirmed) return;

      try {
        const categoryFound = categoryRecords.find(
          (category) => category.name === categoryToDelete
        );

        if (!categoryFound) {
          setStoreMessage("No se encontró la categoría a eliminar.");
          return;
        }

        await deleteCategoryById(categoryFound.id);
        await loadData();

        setCart((prev) =>
          prev.map((item) =>
            item.category === categoryToDelete
              ? { ...item, category: "Sin categoría" }
              : item
          )
        );

        setStoreMessage(`Categoría "${categoryToDelete}" eliminada correctamente.`);
      } catch (error) {
        console.error(error);
        setStoreMessage(error.message || "No se pudo eliminar la categoría.");
      }
    },
    [categoryRecords, loadData, setCart]
  );

  const addProduct = useCallback(
    async (newProduct) => {
      try {
        const categoryId = findCategoryIdByName(newProduct.category, categoryRecords);

        const payload = {
          name: newProduct.name,
          description: newProduct.description,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          imageUrl: newProduct.image,
          categoryId: categoryId || null
        };

        const response = await createProduct(payload);
        const createdProduct = mapProductFromApi(response.data);

        setProducts((prev) => [createdProduct, ...prev]);
        setStoreMessage(`Producto "${createdProduct.name}" agregado correctamente.`);
      } catch (error) {
        console.error(error);
        setStoreMessage(error.message || "No se pudo agregar el producto.");
      }
    },
    [categoryRecords, setProducts]
  );

  const updateProduct = useCallback(
    async (updatedProduct) => {
      try {
        const categoryId = findCategoryIdByName(updatedProduct.category, categoryRecords);

        const payload = {
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: Number(updatedProduct.price),
          stock: Number(updatedProduct.stock),
          imageUrl: updatedProduct.image,
          categoryId: categoryId || null
        };

        const response = await updateProductById(updatedProduct.id, payload);
        const mappedUpdatedProduct = mapProductFromApi(response.data);
        const newStock = mappedUpdatedProduct.stock;

        setProducts((prev) =>
          prev.map((product) =>
            product.id === mappedUpdatedProduct.id ? mappedUpdatedProduct : product
          )
        );

        setCart((prevCart) => {
          return prevCart.map((item) => {
            if (item.id === mappedUpdatedProduct.id) {
              const updatedItem = {
                ...item,
                name: mappedUpdatedProduct.name,
                price: mappedUpdatedProduct.price,
                image: mappedUpdatedProduct.image,
                description: mappedUpdatedProduct.description,
                category: mappedUpdatedProduct.category
              };

              // Si la cantidad en el carrito es mayor al nuevo stock, ajustar a stock disponible
              if (item.quantity > newStock) {
                updatedItem.quantity = Math.max(0, newStock);
              }

              return updatedItem;
            }
            return item;
          });
        });

        setStoreMessage(`Producto "${mappedUpdatedProduct.name}" actualizado.`);
      } catch (error) {
        console.error(error);
        setStoreMessage(error.message || "No se pudo actualizar el producto.");
      }
    },
    [categoryRecords, setCart, setProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      const isInCart = cart.some((item) => item.id === id);

      if (isInCart) {
        setStoreMessage(
          "No puedes eliminar un producto que todavía está dentro del carrito."
        );
        return;
      }

      const confirmed = window.confirm("¿Seguro que deseas eliminar este producto?");
      if (!confirmed) return;

      try {
        await deleteProductById(id);
        setProducts((prev) => prev.filter((product) => product.id !== id));
        setStoreMessage("Producto eliminado correctamente.");
      } catch (error) {
        console.error(error);
        setStoreMessage(error.message || "No se pudo eliminar el producto.");
      }
    },
    [cart, setProducts]
  );

  const addDeliveryPoint = useCallback(async (payload) => {
    const response = await createDeliveryPoint(payload);
    setDeliveryPoints((prev) => [response.data, ...prev]);
  }, [setDeliveryPoints]);

  const updateDeliveryPoint = useCallback(async (id, payload) => {
    const response = await updateDeliveryPointById(id, payload);
    setDeliveryPoints((prev) =>
      prev.map((point) => (point.id === id ? response.data : point))
    );
  }, [setDeliveryPoints]);

  const deleteDeliveryPoint = useCallback(async (id) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este punto de entrega?");
    if (!confirmed) return;

    await deleteDeliveryPointById(id);
    setDeliveryPoints((prev) => prev.filter((point) => point.id !== id));
  }, [setDeliveryPoints]);

  const saveDeliveryRates = useCallback(async (nextRates) => {
    const response = await updateDeliveryRates({ rates: nextRates });
    const savedRates = {
      ...DEFAULT_DELIVERY_RATES,
      ...(response.data || nextRates)
    };

    setDeliveryRates(savedRates);
    localStorage.setItem("deliveryRates", JSON.stringify(savedRates));
  }, []);

  const confirmOrder = useCallback(async (id) => {
    await confirmOrderById(id);
    const ordersResponse = await getOrders();
    setOrders(ordersResponse.data || []);
    await loadData();
    setStoreMessage("Pedido confirmado correctamente.");
  }, [loadData, setOrders]);

  const cancelOrder = useCallback(async (id) => {
    await cancelOrderById(id);
    const ordersResponse = await getOrders();
    setOrders(ordersResponse.data || []);
    await loadData();
    setStoreMessage("Pedido cancelado y stock liberado.");
  }, [loadData, setOrders]);

  function ProtectedRoute({ children, permission }) {
    if (!isLoggedIn) {
      return <Navigate to="/panel" replace />;
    }

    if (permission && !currentUser?.permissions?.[permission]) {
      return <Navigate to="/admin" replace />;
    }

    return children;
  }

  const renderAdminPage = (children) => (
    <AdminLayout
      currentUser={currentUser}
      pendingOrdersCount={pendingOrdersCount}
      uncategorizedCount={uncategorizedCount}
      activeDeliveryPoints={activeDeliveryPoints}
      totalProducts={products.length}
      totalOrders={orders.length}
      totalUsers={users.length}
    >
      {children}
    </AdminLayout>
  );

  return (
    <div className="app-shell">
      <BrowserRouter>
        <Navbar
          cartCount={cartCount}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          logout={logout}
        />

        {storeMessage && <div className="store-message">{storeMessage}</div>}

        <main className="app-content">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  products={productsForHome}
                  addToCart={addToCart}
                  isLoadingStore={isLoadingStore}
                />
              }
            />

            <Route
              path="/cart"
              element={
                <Cart
                  cart={cart}
                  addToCart={addToCart}
                  removeOneFromCart={removeOneFromCart}
                  removeProductCompletely={removeProductCompletely}
                  clearCart={clearCart}
                  refreshStore={loadData}
                  deliveryRates={deliveryRates}
                />
              }
            />

            <Route path="/panel" element={<Panel login={login} />} />
            <Route path="/terminos" element={<InfoPage type="terms" />} />
            <Route path="/como-comprar" element={<InfoPage type="howToBuy" />} />
            <Route path="/contacto" element={<InfoPage type="contact" />} />
            <Route path="/quienes-somos" element={<InfoPage type="about" />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  {renderAdminPage(
                    <AdminDashboard
                      products={products}
                      cart={cart}
                      users={users}
                      orders={orders}
                      deliveryPoints={deliveryPoints}
                      currentUser={currentUser}
                      uncategorizedCount={uncategorizedCount}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute permission="dashboard">
                  {renderAdminPage(
                    <AdminDashboard
                      products={products}
                      cart={cart}
                      users={users}
                      orders={orders}
                      deliveryPoints={deliveryPoints}
                      currentUser={currentUser}
                      uncategorizedCount={uncategorizedCount}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute permission="orders">
                  {renderAdminPage(
                    <AdminOrders
                      orders={orders}
                      confirmOrder={confirmOrder}
                      cancelOrder={cancelOrder}
                      currentUser={currentUser}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute permission="users">
                  {renderAdminPage(
                    <AdminUsers
                      users={users}
                      addUser={addUser}
                      updateUser={updateUser}
                      deleteUser={deleteUser}
                      currentUser={currentUser}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedRoute permission="products">
                  {renderAdminPage(
                    <AdminProducts
                      products={products}
                      categories={categories}
                      addCategory={addCategory}
                      deleteCategory={deleteCategory}
                      addProduct={addProduct}
                      updateProduct={updateProduct}
                      deleteProduct={deleteProduct}
                      currentUser={currentUser}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/delivery-points"
              element={
                <ProtectedRoute permission="deliveryPoints">
                  {renderAdminPage(
                    <AdminDeliveryPoints
                      deliveryPoints={deliveryPoints}
                      addDeliveryPoint={addDeliveryPoint}
                      updateDeliveryPoint={updateDeliveryPoint}
                      deleteDeliveryPoint={deleteDeliveryPoint}
                      deliveryRates={deliveryRates}
                      saveDeliveryRates={saveDeliveryRates}
                      currentUser={currentUser}
                    />
                  )}
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

function buildCategoryNames(categoryData = []) {
  const names = categoryData.map((category) => category.name);

  if (!names.includes("Sin categoría")) {
    return ["Sin categoría", ...names];
  }

  return names;
}

function sortCategoriesByDate(categoryData = []) {
  return [...categoryData].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

function findCategoryIdByName(categoryName, categoryRecords = []) {
  if (!categoryName || categoryName === "Sin categoría") {
    const uncategorized = categoryRecords.find(
      (category) => category.name === "Sin categoría"
    );
    return uncategorized?.id || null;
  }

  const found = categoryRecords.find((category) => category.name === categoryName);
  return found?.id || null;
}

export default App;

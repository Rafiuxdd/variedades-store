const API_URL = (
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:4000/api")
).replace(/\/$/, "");

const USER_STORAGE_KEY = "variedades_store_user";

export function saveSession(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem("variedades_store_users");
}

export function getSavedUser() {
  try {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error reading saved user:", error);
    return null;
  }
}

async function parseResponseBody(response) {
  const text = await response.text().catch(() => "");
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function request(endpoint, { method = "GET", body, headers = {} } = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    body,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });

  const data = await parseResponseBody(response);

  if (response.status === 401) {
    clearSession();
  }

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || response.statusText || "Ocurrió un error en la petición.");
  }

  return data;
}

export async function loginRequest(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function logoutRequest() {
  return request("/auth/logout", {
    method: "POST"
  });
}

export async function getCurrentUser() {
  return request("/auth/me");
}

export async function getUsers() {
  return request("/auth/users");
}

export async function createUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateUserById(id, payload) {
  return request(`/auth/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteUserById(id) {
  return request(`/auth/users/${id}`, {
    method: "DELETE"
  });
}

export async function getCategories() {
  return request("/categories");
}

export async function createCategory(payload) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function deleteCategoryById(categoryId) {
  return request(`/categories/${categoryId}`, {
    method: "DELETE"
  });
}

export async function getProducts() {
  return request("/products");
}

export async function getProduct(productId) {
  return request(`/products/${productId}`);
}

export async function createProduct(payload) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateProductById(productId, payload) {
  return request(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteProductById(productId) {
  return request(`/products/${productId}`, {
    method: "DELETE"
  });
}

export async function getDeliveryPoints(activeOnly = true) {
  return request(`/delivery-points${activeOnly ? "?active=true" : ""}`);
}

export async function createDeliveryPoint(payload) {
  return request("/delivery-points", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateDeliveryPointById(id, payload) {
  return request(`/delivery-points/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteDeliveryPointById(id) {
  return request(`/delivery-points/${id}`, {
    method: "DELETE"
  });
}

export async function getDeliveryRates() {
  return request("/delivery-rates");
}

export async function updateDeliveryRates(payload) {
  return request("/delivery-rates", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function getOrders() {
  return request("/orders");
}

export async function createOrder(payload) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function confirmOrderById(id) {
  return request(`/orders/${id}/confirm`, {
    method: "PATCH"
  });
}

export async function cancelOrderById(id) {
  return request(`/orders/${id}/cancel`, {
    method: "PATCH"
  });
}

export async function createWompiLink(payload) {
  return request("/wompi/create-link", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

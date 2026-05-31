import { API_BASE_URL } from "@/config/appSettings";

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error en la petición');
  }
  return res.json();
};

export const getMyCart = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/carts/my-cart`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(res); // retorna { success, data: { cart_id, items, total } }
};

export const addItemToCart = async (product_id, quantity, token) => {
  const res = await fetch(`${API_BASE_URL}/api/carts/add-item`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ product_id, quantity })
  });
  return handleResponse(res);
};

export const updateCartItem = async (product_id, quantity, token) => {
  const res = await fetch(`${API_BASE_URL}/api/carts/update-item`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify({ product_id, quantity })
  });
  return handleResponse(res);
};

export const removeCartItem = async (product_id, token) => {
  const res = await fetch(`${API_BASE_URL}/api/carts/remove-item/${product_id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse(res);
};

export const clearCart = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/carts/clear`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse(res);
};

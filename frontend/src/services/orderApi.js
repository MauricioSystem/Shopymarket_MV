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

export const createOrder = async (orderInfo, token) => {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(orderInfo)
  });
  return handleResponse(res);
};

export const getMyOrders = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return handleResponse(res);
};

export const getOrderById = async (id, token) => {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return handleResponse(res);
};

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

/**
 * Calculate shipping cost based on store and customer locations
 * @param {object} locations - {storeLocation: {latitude, longitude}, customerLocation: {latitude, longitude}}
 * @param {string} token
 * @returns {object} - {distance, shippingCost}
 */
export const calculateShippingCost = async (locations, token) => {
  const res = await fetch(`${API_BASE_URL}/api/shipping/calculate`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(locations)
  });
  return handleResponse(res);
};

/**
 * Get default shipping cost when location is not available
 * @param {string} token
 * @returns {object} - {defaultShippingCost}
 */
export const getDefaultShippingCost = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/shipping/default`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return handleResponse(res);
};

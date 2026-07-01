import { API_BASE_URL } from '@/config/appSettings';

const getAuthHeaders = (token) => {
    return token ? { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
};

export const getSubscriptionPlans = async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};

export const getMySubscription = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/me`, {
        method: 'GET',
        headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};

export const getMySubscriptionHistory = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/history`, {
        method: 'GET',
        headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};

export const subscribeToPlan = async (planId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/subscribe`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ plan_id: planId })
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};

export const cancelSubscription = async (subscriptionId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/cancel/${subscriptionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};

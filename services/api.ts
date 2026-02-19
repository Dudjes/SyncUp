import { getAuthHeaders } from "./authService";

// Example of making a protected API call
export const getProtectedData = async () => {
  const headers = await getAuthHeaders();
  
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/protected`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch protected data");
  }

  return await res.json();
};

// Generic helper for authenticated requests
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const headers = await getAuthHeaders();
  
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return await res.json();
};

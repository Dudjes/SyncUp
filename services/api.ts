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
  options: RequestInit = {},
) => {
  const headers = await getAuthHeaders();

  console.log(
    `Making request to: ${process.env.EXPO_PUBLIC_API_URL}${endpoint}`,
    {
      method: options.method || "GET",
      hasBody: !!options.body,
    },
  );

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  console.log(`Response status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
      console.log("Server error response:", error);
    } catch (parseError) {
      console.log("Could not parse error response:", parseError);
      try {
        const text = await res.clone().text();
        console.log("Raw error response:", text);
      } catch (textError) {
        console.log("Could not read error response as text");
      }
    }
    throw new Error(errorMessage);
  }

  return await res.json();
};

import { tokenService } from "./tokenService";

interface RegisterPayload {
  fullName: string;
  userName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    userId: string;
    fullName: string;
    userName: string;
    email: string;
    image: string;
    friendcode: number;
  };
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    userId: string;
    fullName: string;
    userName: string;
    email: string;
    image: string;
    friendcode: number;
    role: string;
  };
}

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), //get register form output
  });

  const contentType = res.headers.get("content-type") || "";
  const data: AuthResponse = contentType.includes("application/json")
    ? await res.json()
    : { message: await res.text(), token: "", user: {} as any };

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }

  // Store token and user data
  await tokenService.saveToken(data.token);
  await tokenService.saveUser(data.user);

  return data;
};

export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") || "";
  const data: LoginResponse = contentType.includes("application/json")
    ? await res.json()
    : { message: await res.text(), token: "", user: {} as any };

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  // Store token and user data
  await tokenService.saveToken(data.token);
  await tokenService.saveUser(data.user);

  return data;
};

export const logoutUser = async (): Promise<void> => {
  await tokenService.clearAll();
};

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await tokenService.getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getCurrentUser = async () => {
  return await tokenService.getUser();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await tokenService.getToken();
  return !!token;
};

interface RegisterPayload {
  fullName: string;
  userName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
}

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") || "";
  const data: AuthResponse = contentType.includes("application/json")
    ? await res.json()
    : { message: await res.text() };

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

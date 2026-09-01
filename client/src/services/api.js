const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(endpoint, options = {}, token = null) {
  const headers = {
    ...(options.headers || {}),
  };

  // Only set JSON Content-Type when the body is NOT FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

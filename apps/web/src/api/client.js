let accessToken =
  typeof window !== "undefined" && window.sessionStorage
    ? window.sessionStorage.getItem("borrownet_access_token")
    : null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (typeof window !== "undefined" && window.sessionStorage) {
    if (token) {
      window.sessionStorage.setItem("borrownet_access_token", token);
    } else {
      window.sessionStorage.removeItem("borrownet_access_token");
    }
  }
};

export const getAccessToken = () => {
  return accessToken;
};

export async function apiClient(endpoint, options = {}) {
  const url = `/api/v1${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    let response = await fetch(url, config);

    // If 401 Unauthorized occurs, attempt silent token refresh (unless already calling /auth/refresh)
    if (response.status === 401 && endpoint !== "/auth/refresh") {
      try {
        const refreshRes = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const freshToken = refreshData.data?.accessToken;
          if (freshToken) {
            setAccessToken(freshToken);

            // Retry original request with fresh token
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${freshToken}`,
            };
            response = await fetch(url, { ...config, headers: retryHeaders });
          }
        } else {
          setAccessToken(null);
        }
      } catch {
        setAccessToken(null);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const rawMessage = errorData.error?.message;
      const friendlyMessage =
        response.status === 401
          ? "Your login session has expired or is invalid. Please log in again."
          : rawMessage || "An error occurred";

      throw {
        status: response.status,
        message: friendlyMessage,
        code: errorData.error?.code,
        details: errorData.error?.details,
      };
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

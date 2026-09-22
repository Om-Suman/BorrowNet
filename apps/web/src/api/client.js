let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
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

    if (response.status === 401 && accessToken) {
      // Attempt silent refresh
      try {
        const refreshRes = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setAccessToken(refreshData.data.accessToken);

          // Retry original request with fresh token
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${refreshData.data.accessToken}`,
          };
          response = await fetch(url, { ...config, headers: retryHeaders });
        } else {
          setAccessToken(null);
          throw new Error("Session expired. Please log in again.");
        }
      } catch (e) {
        setAccessToken(null);
        throw e;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.error?.message || "An error occurred",
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

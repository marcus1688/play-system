import { getCompanyApiUrl, getPublicApiUrl } from "~/utils/companies";
export const useApiEndpoint = () => {
  const getApiUrl = () => {
    const companyId = localStorage.getItem("companyId");
    return getCompanyApiUrl(companyId);
  };

  const getPublicApi = () => {
    const companyId = localStorage.getItem("companyId");
    return getPublicApiUrl(companyId);
  };

  const refreshAccessToken = async () => {
    try {
      const apiUrl = getApiUrl();
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;
      const response = await fetch(`${apiUrl}refresh-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem("token", token);
        return token;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  const callApi = async (
    endpoint,
    method = "GET",
    body = null,
    customHeaders = {},
    usePublic = false
  ) => {
    try {
      const apiUrl = usePublic ? getPublicApi() : getApiUrl();
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("companyId");
      const route = useRoute();
      const currentRoute = route.path;
      const requestConfig = {
        method,
        credentials: "include",
        headers: {
          ...customHeaders,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "X-Current-Route": currentRoute,
          "X-Company-ID": companyId,
        },
      };

      if (body && method !== "GET") {
        if (body instanceof FormData) {
          requestConfig.body = body;
        } else {
          requestConfig.headers["Content-Type"] = "application/json";
          requestConfig.body = JSON.stringify(body);
        }
      }

      let response = await fetch(`${apiUrl}${endpoint}`, requestConfig);
      const data = await response.json();

      if (data.demouser) {
        await Swal.fire({
          icon: "info",
          title: "Demo User",
          text: data.message,
          confirmButtonText: "OK",
        });
        return { data: null, error: data };
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          endpoint: endpoint,
        };
      }

      if (data.authorized === false) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          requestConfig.headers["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(`${apiUrl}${endpoint}`, requestConfig);
          const newData = await response.json();
          if (response.ok && newData.authorized !== false) {
            return { data: newData };
          }
        }
        localStorage.removeItem("companyId");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        await Swal.fire({
          title: "Please log in again",
          text: "Your session has expired. Please log in again.",
          icon: "warning",
          confirmButtonText: "Confirm",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          window.location.href = "/login";
        });
        return { data: null, error: new Error("Authentication required") };
      }
      return { data };
    } catch (error) {
      console.error("API Error:", error);
      // Swal.fire({
      //   title: "Network Error",
      //   text: `Error occurred while calling ${endpoint}. Please try again later.`,
      //   icon: "error",
      // });
      return { data: null, error };
    }
  };

  return {
    callApi,
    refreshAccessToken,
    get: (endpoint, headers) => callApi(endpoint, "GET", null, headers),
    post: (endpoint, body, headers) => callApi(endpoint, "POST", body, headers),
    put: (endpoint, body, headers) => callApi(endpoint, "PUT", body, headers),
    delete: (endpoint, body, headers) =>
      callApi(endpoint, "DELETE", body, headers),
    patch: (endpoint, body, headers) =>
      callApi(endpoint, "PATCH", body, headers),

    publicGet: (endpoint, headers) =>
      callApi(endpoint, "GET", null, headers, true),
    publicPost: (endpoint, body, headers) =>
      callApi(endpoint, "POST", body, headers, true),
    publicPut: (endpoint, body, headers) =>
      callApi(endpoint, "PUT", body, headers, true),
    publicDelete: (endpoint, body, headers) =>
      callApi(endpoint, "DELETE", body, headers, true),
    publicPatch: (endpoint, body, headers) =>
      callApi(endpoint, "PATCH", body, headers, true),
  };
};

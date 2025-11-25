import { useApiEndpoint } from "~/composables/useApiEndpoint";
import { findPermissionByPath } from "~/utils/menuItems";

export default defineNuxtRouteMiddleware(async (to) => {
  const publicPages = ["/login"];
  if (!process.client) {
    return;
  }
  const adminUserData = useState("adminUserData", () => null);
  const refreshToken = localStorage.getItem("refreshToken");
  const companyId = localStorage.getItem("companyId");
  if (!refreshToken || !companyId) {
    adminUserData.value = null;
    localStorage.removeItem("companyId");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    if (!publicPages.includes(to.path)) {
      return navigateTo("/login");
    }
    return;
  }
  if (companyId) {
    try {
      const { get } = useApiEndpoint();
      const { data } = await get("auth/check");
      adminUserData.value = data.adminuser;
      if (data?.authorized) {
        if (to.path === "/login") {
          return navigateTo("/");
        }
        if (!publicPages.includes(to.path)) {
          if (adminUserData.value.role === "superadmin") {
            return;
          }
          const requiredPermission = findPermissionByPath(to.path);
          if (requiredPermission) {
            const [module, action] = requiredPermission.split(".");
            const hasPermission = adminUserData.value.permissions?.some(
              (p) => p.module === module && p.actions.includes(action)
            );
            if (!hasPermission) {
              console.log("Permission denied, redirecting to 403");
              return navigateTo("/403");
            }
          }
        }
        return;
      } else {
        adminUserData.value = null;
        localStorage.removeItem("companyId");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (!publicPages.includes(to.path)) {
          return navigateTo("/login");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      adminUserData.value = null;
      localStorage.removeItem("companyId");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      if (!publicPages.includes(to.path)) {
        return navigateTo("/login");
      }
    }
  }
});

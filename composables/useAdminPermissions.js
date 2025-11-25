export const useAdminPermission = () => {
  const config = useState("permissions-config", () => ({
    roles: [],
    modulePermissions: {},
  }));
  const { get } = useApiEndpoint();
  const companyId = useState("companyId");

  const fetchConfig = async () => {
    try {
      const { data } = await get("permissions-config");
      if (data.success) {
        const filteredModulePermissions = {};
        Object.entries(data.data.modulePermissions).forEach(([key, value]) => {
          const hasFeatureResult = hasFeature(companyId.value, key);
          if (hasFeatureResult) {
            filteredModulePermissions[key] = value;
          }
        });
        config.value = {
          roles: data.data.roles,
          modulePermissions: filteredModulePermissions,
        };
      }
    } catch (error) {
      console.error("Failed to fetch permissions config:", error);
    }
  };

  return {
    config,
    fetchConfig,
  };
};

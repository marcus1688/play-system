<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <PageLoading v-if="isPageLoading" />
      <div
        class="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ initialData ? $t("edit") : $t("create")
              }}{{ $t("admin_user") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <!-- Basic Information -->
            <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                  >{{ $t("username") }}</label
                >
                <input
                  v-model="formData.username"
                  type="text"
                  required
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                  >{{ $t("full_name") }}</label
                >
                <input
                  v-model="formData.fullname"
                  type="text"
                  required
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                  >{{ $t("password") }}</label
                >
                <input
                  v-model="formData.password"
                  type="password"
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                  >{{ $t("role") }}</label
                >
                <CustomSelect
                  v-model="formData.role"
                  required
                  @change="handleRoleChange"
                >
                  <option value="">{{ $t("select_role") }}</option>
                  <option
                    v-for="role in availableRoles"
                    :key="role.value"
                    :value="role.value"
                  >
                    {{ role.label }}
                  </option>
                </CustomSelect>
              </div>

              <div
                v-if="
                  !initialData &&
                  formData.role &&
                  formData.role !== 'superadmin'
                "
                class="max-md:col-span-1"
              >
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                >
                  {{ $t("copy_permissions_from") }}
                </label>
                <CustomSelect
                  v-model="copyFromUser"
                  @change="handleCopyPermissions"
                >
                  <option value="">{{ $t("select_user_to_copy") }}</option>
                  <option
                    v-for="user in availableUsersForCopy"
                    :key="user._id"
                    :value="user._id"
                  >
                    {{ user.username }} ({{ user.role }})
                  </option>
                </CustomSelect>
              </div>
            </div>

            <!-- Permissions Section -->
            <div
              v-if="
                formData.role &&
                formData.role !== 'superadmin' &&
                availableModulePermissions
              "
              class="border rounded-lg p-4 max-md:p-3"
            >
              <h3
                class="text-lg font-semibold mb-4 max-md:text-base max-md:mb-3"
              >
                {{ $t("permissions") }}
              </h3>

              <div class="space-y-4 max-md:space-y-3">
                <div
                  v-for="(module, moduleKey) in availableModulePermissions"
                  :key="moduleKey"
                  class="border-b pb-4 max-md:pb-3"
                >
                  <div class="flex items-center gap-2 mb-2 max-md:mb-1.5">
                    <input
                      type="checkbox"
                      :checked="isModuleSelected(moduleKey)"
                      @change="toggleModule(moduleKey)"
                      class="rounded border-gray-300 max-md:w-4 max-md:h-4"
                    />
                    <span class="font-medium max-md:text-sm">{{
                      module.label
                    }}</span>
                  </div>

                  <div
                    class="ml-6 grid grid-cols-2 gap-2 max-md:ml-4 max-md:grid-cols-1 max-md:gap-1.5"
                  >
                    <label
                      v-for="perm in module.permissions"
                      :key="perm.value"
                      class="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        v-model="selectedPermissions[moduleKey][perm.value]"
                        class="rounded border-gray-300 max-md:w-4 max-md:h-4"
                      />
                      <span class="max-md:text-sm">{{ perm.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            type="button"
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ initialData ? $t("save") : $t("create") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>
<script setup>
const { config, fetchConfig } = useAdminPermission();

const props = defineProps({
  show: Boolean,
  initialData: {
    type: Object,
    default: null,
  },
  users: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isPageLoading = ref(true);
const { post, patch } = useApiEndpoint();
const isLoading = ref(false);
const adminUserData = useState("adminUserData");
const copyFromUser = ref("");

const availableRoles = computed(() => {
  if (adminUserData.value?.role !== "superadmin") {
    return config.value.roles.filter(
      (role) => role.value !== "admin" && role.value !== "superadmin"
    );
  }
  return config.value.roles;
});

const availableModulePermissions = computed(() => {
  if (adminUserData.value?.role === "superadmin") {
    return config.value.modulePermissions;
  }
  const result = {};
  if (!adminUserData.value?.permissions) {
    return result;
  }
  adminUserData.value.permissions.forEach(({ module, actions }) => {
    if (
      config.value.modulePermissions &&
      config.value.modulePermissions[module]
    ) {
      result[module] = {
        label: config.value.modulePermissions[module].label,
        permissions: [],
      };
      config.value.modulePermissions[module].permissions.forEach((perm) => {
        if (actions.includes(perm.value)) {
          result[module].permissions.push(perm);
        }
      });
      if (result[module].permissions.length === 0) {
        delete result[module];
      }
    }
  });

  return result;
});

const availableUsersForCopy = computed(() => {
  return props.users.filter(
    (user) =>
      user.role !== "superadmin" &&
      user.permissions &&
      user.permissions.length > 0
  );
});

const handleCopyPermissions = () => {
  Object.keys(selectedPermissions.value).forEach((moduleKey) => {
    Object.keys(selectedPermissions.value[moduleKey]).forEach((permKey) => {
      selectedPermissions.value[moduleKey][permKey] = false;
    });
  });
  if (!copyFromUser.value) return;
  const selectedUser = props.users.find(
    (user) => user._id === copyFromUser.value
  );
  if (!selectedUser || !selectedUser.permissions) return;
  selectedUser.permissions.forEach(({ module, actions }) => {
    if (selectedPermissions.value[module]) {
      actions.forEach((action) => {
        if (selectedPermissions.value[module][action] !== undefined) {
          selectedPermissions.value[module][action] = true;
        }
      });
    }
  });
};

const formData = ref({
  username: "",
  fullname: "",
  password: "",
  role: "",
  status: true,
});

const selectedPermissions = ref({});

watch(
  () => availableModulePermissions.value,
  (newModulePermissions) => {
    if (newModulePermissions) {
      Object.keys(newModulePermissions).forEach((moduleKey) => {
        if (!selectedPermissions.value[moduleKey]) {
          selectedPermissions.value[moduleKey] = {};
        }

        newModulePermissions[moduleKey].permissions.forEach((perm) => {
          selectedPermissions.value[moduleKey][perm.value] = false;
        });
      });
      Object.keys(selectedPermissions.value).forEach((moduleKey) => {
        if (!newModulePermissions[moduleKey]) {
          delete selectedPermissions.value[moduleKey];
        } else {
          Object.keys(selectedPermissions.value[moduleKey]).forEach(
            (permKey) => {
              const permExists = newModulePermissions[
                moduleKey
              ].permissions.some((p) => p.value === permKey);
              if (!permExists) {
                delete selectedPermissions.value[moduleKey][permKey];
              }
            }
          );
        }
      });
    }
  },
  { immediate: true }
);

const isModuleSelected = (moduleKey) => {
  return Object.values(selectedPermissions.value[moduleKey]).every((v) => v);
};

const toggleModule = (moduleKey) => {
  const isSelected = !isModuleSelected(moduleKey);
  Object.keys(selectedPermissions.value[moduleKey]).forEach((permKey) => {
    selectedPermissions.value[moduleKey][permKey] = isSelected;
  });
};

const handleRoleChange = () => {
  if (formData.value.role === "superadmin") {
    Object.keys(selectedPermissions.value).forEach((moduleKey) => {
      Object.keys(selectedPermissions.value[moduleKey]).forEach((permKey) => {
        selectedPermissions.value[moduleKey][permKey] = false;
      });
    });
  }
};

const formatPermissionsForApi = () => {
  const permissions = [];
  Object.entries(selectedPermissions.value).forEach(([moduleKey, perms]) => {
    const selectedPerms = Object.entries(perms)
      .filter(([_, isSelected]) => isSelected)
      .map(([permKey]) => permKey);

    if (selectedPerms.length > 0) {
      permissions.push({
        module: moduleKey,
        actions: selectedPerms,
      });
    }
  });
  return permissions;
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;

    if (!formData.value.username.trim()) {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: $t("username_required"),
      });
      isLoading.value = false;
      return;
    }

    if (!formData.value.fullname.trim()) {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: $t("fullname_required"),
      });
      isLoading.value = false;
      return;
    }

    if (!props.initialData && !formData.value.password) {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: $t("password_required"),
      });
      isLoading.value = false;
      return;
    }

    if (adminUserData.value?.role !== "superadmin") {
      if (
        props.initialData &&
        (props.initialData.role === "admin" ||
          props.initialData.role === "superadmin")
      ) {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: $t("no_permission"),
        });
        isLoading.value = false;
        return;
      }
    }

    const submitData = {
      ...formData.value,
    };

    if (formData.value.role !== "superadmin") {
      submitData.permissions = formatPermissionsForApi();
    }

    const { data } = props.initialData
      ? await patch(`updateadminuser/${props.initialData._id}`, submitData)
      : await post("createadminuser", submitData);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("success");
      emit("update:show", false);
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.initialData,
  (newData) => {
    copyFromUser.value = "";
    if (newData) {
      formData.value = {
        username: newData.username || "",
        fullname: newData.fullname || "",
        role: newData.role || "",
        status: newData.status ?? true,
      };
      Object.keys(selectedPermissions.value).forEach((moduleKey) => {
        Object.keys(selectedPermissions.value[moduleKey]).forEach((permKey) => {
          selectedPermissions.value[moduleKey][permKey] = false;
        });
      });
      if (newData.permissions) {
        newData.permissions.forEach(({ module, actions }) => {
          if (availableModulePermissions.value[module]) {
            actions.forEach((action) => {
              const permExists = availableModulePermissions.value[
                module
              ].permissions.some((p) => p.value === action);

              if (permExists && selectedPermissions.value[module]) {
                selectedPermissions.value[module][action] = true;
              }
            });
          }
        });
      }
    } else {
      formData.value = {
        username: "",
        fullname: "",
        password: "",
        role: "",
        status: true,
      };
      Object.keys(selectedPermissions.value).forEach((moduleKey) => {
        Object.keys(selectedPermissions.value[moduleKey]).forEach((permKey) => {
          selectedPermissions.value[moduleKey][permKey] = false;
        });
      });
    }
  },
  { immediate: true }
);
onMounted(async () => {
  await fetchConfig();
  isPageLoading.value = false;
});
</script>

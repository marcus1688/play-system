<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("admin_list") }}
          </h1>
        </div>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Filter Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div class="grid grid-cols-2 gap-6 max-sm:grid-cols-1 max-md:gap-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >{{ $t("username") }}:</label
          >
          <CustomSelect v-model="filters.username">
            <option value="">{{ $t("all") }}</option>
            <option
              v-for="user in users"
              :key="user._id"
              :value="user.username"
            >
              {{ user.username }}
            </option>
          </CustomSelect>
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >{{ $t("role") }}:</label
          >
          <CustomSelect v-model="filters.role">
            <option value="">{{ $t("all") }}</option>
            <option
              v-for="role in availableRoles"
              :key="role.value"
              :value="role.value"
            >
              {{ role.label }}
            </option>
          </CustomSelect>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 max-md:mt-4">
        <BaseResetButton @click="handleReset" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Search username..."
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
              >
                <div class="flex items-center justify-center gap-1">
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                  <div v-if="header.sortable">
                    <Icon
                      :icon="
                        sortConfig.key === header.key
                          ? sortConfig.direction === 'asc'
                            ? 'material-symbols:arrow-upward'
                            : 'material-symbols:arrow-downward'
                          : 'material-symbols:unfold-more'
                      "
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="user in paginatedUsers"
              :key="user._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.username }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.fullname }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 uppercase max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.role }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <BaseToggleSwitch
                    v-model="user.status"
                    @update:modelValue="toggleActive(user)"
                  />
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <button
                  @click="
                    user.onlineStatus ? handleForceLogoutAdmin(user._id) : null
                  "
                  :disabled="!user.onlineStatus"
                  class="px-3 py-1 rounded-full text-sm font-medium uppercase max-md:px-2 max-md:py-2 max-md:text-xs"
                  :class="{
                    'bg-blue-100 text-blue-800': user.onlineStatus == true,
                    'bg-gray-100 text-gray-800': user.onlineStatus == false,
                  }"
                >
                  {{ user.onlineStatus ? $t("online") : $t("offline") }}
                </button>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.lastLogin ? formatDate(user.lastLogin) : "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.lastLoginIp ? user.lastLoginIp : "-" }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="editUser(user)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[user._id]"
                    @click="deleteUser(user)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedUsers.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="9"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_users_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        v-if="paginatedUsers.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- User Modal -->
    <AdminUserModal
      v-model:show="showAdminUserModal"
      :initial-data="editingUser"
      :users="users"
      @success="fetchUsers"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const socketIO = useSocketIO();
const isButtonLoading = ref({});
const isPageLoading = ref(true);
const { config, fetchConfig } = useAdminPermission();
const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号" },
  { key: "username", label: "Username", labelCN: "用户名", sortable: false },
  { key: "fullname", label: "Full Name", labelCN: "全名", sortable: false },
  { key: "role", label: "Role", labelCN: "角色", sortable: false },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "onlineStatus", label: "Online Status", labelCN: "在线状态" },
  {
    key: "lastLogin",
    label: "Last Login",
    labelCN: "最后登录",
    sortable: true,
  },
  {
    key: "lastLoginIp",
    label: "Last Login IP",
    labelCN: "最后登录IP",
    sortable: true,
  },
  { key: "actions", label: "Actions", labelCN: "操作" },
];
const adminUserData = useState("adminUserData");
const users = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showAdminUserModal = ref(false);
const editingUser = ref(null);
const { get, patch, delete: del } = useApiEndpoint();

const sortConfig = ref({
  key: "username",
  direction: "asc",
});

const filters = ref({
  username: "",
  role: "",
});

const handleSort = (key) => {
  if (!tableHeaders.find((h) => h.key === key).sortable) return;

  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  filters.value = {
    username: "",
    role: "",
  };
  searchQuery.value = "";
  currentPage.value = 1;
};

const fetchUsers = async () => {
  try {
    const { data } = await get("adminusers");
    if (data.success) {
      users.value = data.data.filter(
        (user) => user._id !== adminUserData.value?._id
      );
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load users",
    });
  }
};

const handleCreate = () => {
  editingUser.value = null;
  showAdminUserModal.value = true;
};

const canEditOrDeleteUser = (user) => {
  if (adminUserData.value?.role === "superadmin") return true;
  if (user.role === "admin" || user.role === "superadmin") return false;
  return true;
};

const editUser = (user) => {
  if (!canEditOrDeleteUser(user)) {
    Swal.fire({
      icon: "info",
      title: $t("info"),
      text: $t("no_permission"),
    });
    return;
  }

  editingUser.value = user;
  showAdminUserModal.value = true;
};

const toggleActive = async (user) => {
  if (!canEditOrDeleteUser(user)) {
    Swal.fire({
      icon: "info",
      title: $t("info"),
      text: $t("no_permission"),
    });
    return;
  }
  try {
    const { data } = await patch("updateadminuserstatus", {
      id: user._id,
      status: user.status,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchUsers();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    user.status = !user.status;
    console.error("Error toggling status:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const deleteUser = async (user) => {
  if (!canEditOrDeleteUser(user)) {
    Swal.fire({
      icon: "info",
      title: $t("info"),
      text: $t("no_permission"),
    });
    return;
  }

  isButtonLoading.value[user._id] = true;
  const result = await Swal.fire({
    title: $t("delete_confirmation"),
    text: $t("delete_warning"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: $t("confirm_delete"),
    cancelButtonText: $t("cancel"),
  });

  if (result.isConfirmed) {
    try {
      const { data } = await del(`deleteadminuser/${user._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchUsers();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          error.response?.data?.message?.[$locale.value] ||
          error.response?.data?.message?.en ||
          $t("network_error"),
      });
    }
  }
  isButtonLoading.value[user._id] = false;
};

const filteredUsers = computed(() => {
  let filtered = [...users.value];
  if (filters.value.username) {
    filtered = filtered.filter(
      (user) => user.username === filters.value.username
    );
  }
  if (filters.value.role) {
    filtered = filtered.filter((user) => user.role === filters.value.role);
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((user) =>
      user.username.toLowerCase().includes(query)
    );
  }
  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (sortConfig.value.key === "lastLogin") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal === bVal) return 0;
      if (aVal == null && bVal != null) return direction;
      if (aVal != null && bVal == null) return -direction;
      return aVal > bVal ? direction : -direction;
    });
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage.value)
);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end).map((user, index) => ({
    ...user,
    no: start + index + 1,
  }));
});

const availableRoles = computed(() => {
  if (adminUserData.value?.role !== "superadmin") {
    return config.value.roles.filter(
      (role) => role.value !== "admin" && role.value !== "superadmin"
    );
  }
  return config.value.roles;
});

const handleForceLogoutAdmin = async (adminId) => {
  if (
    adminUserData.value?.role !== "superadmin" &&
    adminUserData.value?.role !== "admin"
  ) {
    await Swal.fire({
      icon: "warning",
      title: $t("permission_denied"),
      text: $t("operation_not_allowed"),
    });
    return;
  }
  const success = await socketIO.forceLogoutAdmin(adminId);
  if (success) {
    await fetchUsers();
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchConfig();
  await fetchUsers();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Admin",
});
</script>

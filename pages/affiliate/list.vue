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
            {{ $t("affiliate_list") }}
          </h1>
        </div>
      </div>
      <div class="flex gap-3 max-md:w-full">
        <button
          @click="showNewAffiliateModal = true"
          class="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-indigo-600 lg:hover:bg-indigo-500 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          {{ $t("new_user") }}
        </button>
        <NewAffiliateModal
          v-model:show="showNewAffiliateModal"
          @submit="handleNewUser"
        />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3"
      >
        <div class="flex items-center gap-4"></div>
        <div class="flex items-center gap-2 max-md:w-full">
          <BaseSearch v-model="searchQuery" @type-change="handleTypeChange" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in filteredTableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="header.sortable && handleSort(header.key)"
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
          <tbody class="divide-y divide-gray-200 text-center">
            <tr
              v-for="user in paginatedUsers"
              :key="user.id"
              class="lg:hover:bg-gray-50 whitespace-nowrap"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.no }}
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex items-center justify-center flex-col gap-1">
                  <div class="flex items-center justify-center gap-1">
                    <Icon
                      v-if="user.duplicateIP"
                      icon="material-symbols:warning-rounded"
                      class="text-amber-500 max-md:w-3.5 max-md:h-3.5"
                    />
                    <Icon
                      v-if="user.duplicateBank"
                      icon="material-symbols:error"
                      class="text-red-500 max-md:w-3.5 max-md:h-3.5"
                    />
                    {{ user.username }}
                  </div>
                  <button
                    @click="openUserDetails(user)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 flex items-center justify-center gap-1 max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    <span>{{ $t("view") }}</span>
                  </button>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm text-wrap max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.fullname }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ Number(user.wallet).toFixed(2) }}
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatPhoneNumber(user.phonenumber) }}
              </td>

              <!-- <td class="px-6 py-4 text-sm">
                  {{ formatDate(user.createdAt) }}
                </td> -->
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.createdAt ? formatDate(user.createdAt) : "-" }}
              </td>
              <!-- <td class="px-6 py-4 text-sm">{{ user.lastLoginIp }}</td> -->
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span
                  :class="[
                    'px-2 py-1 rounded max-md:px-1.5 max-md:py-2 max-md:text-xs',
                    user.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ user.status ? $t("active") : $t("inactive") }}
                </span>
              </td>
              <td
                v-if="
                  adminUserData?.role === 'superadmin' ||
                  adminUserData?.role === 'admin'
                "
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3"
              >
                <div class="flex gap-1 justify-center">
                  <button
                    @click="deleteUser(user)"
                    class="px-3 py-1 text-white bg-red-600 rounded lg:hover:bg-red-700 flex items-center justify-center gap-1 max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    <Icon
                      icon="material-symbols:delete"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    {{ $t("delete") }}
                  </button>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedUsers.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                :colspan="tableHeaders.length"
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

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedUsers.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />

      <!-- User Details Modal -->
      <AffiliateDetailsModal
        v-if="showUserDetails && selectedUser"
        v-model:show="showUserDetails"
        :user-data="selectedUser"
        @userUpdated="handleUserUpdated"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";

const adminUserData = useState("adminUserData");
const { delete: del } = useApiEndpoint();
const currency = useCurrency();
const isPageLoading = ref(true);
const allusers = ref([]);
const { get } = useApiEndpoint();
const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  { key: "username", label: "Username", labelCN: "用户名", sortable: true },
  { key: "fullname", label: "Fullname", labelCN: "全名", sortable: true },
  { key: "wallet", label: "Wallet", labelCN: "钱包", sortable: true },

  {
    key: "phoneNumber",
    label: "Phone Number",
    labelCN: "手机号",
    sortable: false,
  },

  {
    key: "creationDate",
    label: "User Creation Date",
    labelCN: "用户创建日期",
    sortable: true,
  },
  // {
  //   key: "lastLoginDate",
  //   label: "Last Login Date",
  //   labelCN: "上次登录日期",
  //   sortable: true,
  // },
  // {
  //   key: "lastLoginIP",
  //   label: "Last Login IP",
  //   labelCN: "上次登录IP",
  //   sortable: false,
  // },
  { key: "status", label: "Status", labelCN: "状态", sortable: true },
  { key: "actions", label: "Actions", labelCN: "操作", sortable: false },
];

const sortConfig = ref({
  key: "createdAt",
  direction: "desc",
});

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  fetchAllUsers();
}, 300);

const handleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
  fetchAllUsers();
};

const searchQuery = ref("");
const handleTypeChange = (type) => {
  searchType.value = type;
};

const showNewAffiliateModal = ref(false);

const handleNewUser = async () => {
  await fetchAllUsers();
};

const showUserDetails = ref(false);
const selectedUser = ref(null);

const filteredUsers = computed(() => {
  let filtered = [...allusers.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.username.toLowerCase().includes(searchTerm) ||
        item.fullname.toLowerCase().includes(searchTerm) ||
        String(item.phonenumber).includes(searchQuery.value)
    );
  }
  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (
        sortConfig.value.key === "creationDate" ||
        sortConfig.value.key === "lastLoginDate"
      ) {
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

const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalItems = ref(0);

// const paginatedUsers = computed(() => {
//   const start = (currentPage.value - 1) * itemsPerPage.value;
//   const end = start + itemsPerPage.value;
//   return filteredUsers.value.slice(start, end).map((user, index) => ({
//     ...user,
//     no: start + index + 1,
//   }));
// });

// const totalPages = computed(() =>
//   Math.ceil(filteredUsers.value.length / itemsPerPage.value)
// );

const formatPhoneNumber = (number) => {
  if (!number) return "-";
  const adminUserData = useState("adminUserData");
  const hasPhonePermission =
    adminUserData.value?.role === "superadmin" ||
    adminUserData.value?.permissions?.some(
      (p) => p.module === "user" && p.actions.includes("phonenumber")
    );
  if (hasPhonePermission) {
    return number;
  } else {
    return number
      .toString()
      .replace(/^(.*)(\d{4})$/, (_, p1, p2) => "*".repeat(p1.length) + p2);
  }
};

// const fetchAllUsers = async () => {
//   try {
//     const { data } = await get("allusers");
//     if (data.success) {
//       allusers.value = data.data;
//     }
//   } catch (error) {
//     console.error("Error fetching all users:", error);
//   }
// };

const fetchAllUsers = async () => {
  isPageLoading.value = true;
  try {
    const queryParams = new URLSearchParams({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      sortKey: sortConfig.value.key,
      sortOrder: sortConfig.value.direction,
    });

    const { data } = await get(`allaffiliate?${queryParams}`);

    if (data.success) {
      allusers.value = data.data.users;
      totalItems.value = data.data.pagination.totalUsers;
    }
  } catch (error) {
    console.error("Error fetching all users:", error);
  } finally {
    isPageLoading.value = false;
  }
};

const openUserDetails = async (user) => {
  try {
    const { data } = await get(`agent/${user._id}`);
    if (data.success) {
      selectedUser.value = data.data;
      showUserDetails.value = true;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch user details",
    });
  }
};

const handleUserUpdated = async () => {
  await fetchAllUsers();
  if (selectedUser.value?._id) {
    try {
      const { data } = await get(`agent/${selectedUser.value._id}`);
      if (data.success) {
        selectedUser.value = data.data;
      }
    } catch (error) {
      console.error("Error fetching affiliate details:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to refresh affiliate details",
      });
    }
  }
};

const deleteUser = async (user) => {
  if (
    adminUserData.value?.role !== "superadmin" &&
    adminUserData.value?.role !== "admin"
  ) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("insufficient_permissions"),
    });
    return;
  }
  try {
    const result = await Swal.fire({
      title: $t("delete_confirmation"),
      text: $t("delete_affiliate_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: $t("confirm_delete"),
      cancelButtonText: $t("cancel"),
    });
    if (result.isConfirmed) {
      const { data } = await del(`agent/${user._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchAllUsers();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting affiliate:", error);
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

const filteredTableHeaders = computed(() => {
  return tableHeaders.filter((header) => {
    if (header.key === "actions") {
      return (
        adminUserData.value?.role === "superadmin" ||
        adminUserData.value?.role === "admin"
      );
    }
    return true;
  });
});

watch(currentPage, () => {
  fetchAllUsers();
});

watch(searchQuery, () => {
  debouncedSearch();
});

const paginatedUsers = computed(() => {
  return allusers.value.map((user, index) => ({
    ...user,
    no: (currentPage.value - 1) * itemsPerPage.value + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(totalItems.value / itemsPerPage.value)
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchAllUsers();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | User List",
});
</script>

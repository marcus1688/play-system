<template>
  <div>
    <DepositModal
      v-model:show="showDepositModal"
      :user-data="selectedDepositUser"
      @success="handleDepositSuccess"
    />
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("user_list") }}
          </h1>
        </div>
      </div>
      <div class="flex gap-3">
        <button
          @click="showNewUserModal = true"
          class="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-indigo-600 lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          <span class="max-sm:hidden">{{ $t("new_user") }}</span>
          <span class="sm:hidden">{{ $t("new") }}</span>
        </button>
        <NewUserModal v-model:show="showNewUserModal" @submit="handleNewUser" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex max-md:flex-col-reverse max-md:gap-2 items-center justify-between p-4 border-b max-md:p-3"
      >
        <div class="flex items-center gap-4 max-md:w-full">
          <button
            v-if="
              adminUserData?.role === 'superadmin' ||
              adminUserData?.role === 'admin'
            "
            @click="handleExport"
            :disabled="isExporting"
            class="px-6 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            <Icon
              :icon="
                isExporting ? 'eos-icons:loading' : 'material-symbols:download'
              "
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
            <span>{{ $t("export_to_excel") }}</span>
          </button>
        </div>
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
                <button
                  @click="openUserDetails(user)"
                  class="px-3 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 flex items-center justify-center gap-1 max-md:px-2 max-md:py-2 max-md:text-xs"
                >
                  <Icon
                    icon="material-symbols:visibility"
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                  <span>{{ $t("view") }}</span>
                </button>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.no }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.userid || "-" }}
              </td>

              <td
                class="px-6 py-4 text-sm text-wrap max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.fullname }}
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatPhoneNumber(user.phonenumber) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-green-600 font-semibold max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(user.totaldeposit) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-red-600 font-semibold max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(user.totalwithdraw) }}
              </td>
              <td
                class="px-6 py-4 text-sm font-semibold max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span
                  :class="[
                    user.winlose < 0
                      ? 'text-red-600'
                      : user.winlose > 0
                      ? 'text-green-600'
                      : '',
                  ]"
                >
                  {{ currency }} {{ formatAmount(user.winlose) }}
                </span>
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
              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <div class="flex gap-1 justify-center">
                  <button
                    @click="handleDeposit(user)"
                    class="px-3 py-2 text-white bg-green-600 rounded lg:hover:bg-green-700 flex items-center justify-center gap-1 max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    <Icon
                      icon="material-symbols:add-circle"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    {{ $t("deposit") }}
                  </button>
                  <button
                    @click="handleWithdraw(user)"
                    class="px-3 py-2 text-white bg-orange-600 rounded lg:hover:bg-orange-700 flex items-center justify-center gap-1 max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    <Icon
                      icon="material-symbols:do-not-disturb-on"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    {{ $t("withdraw") }}
                  </button>
                </div>
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
                    class="px-3 py-2 text-white bg-red-600 rounded lg:hover:bg-red-700 flex items-center justify-center gap-1 max-md:px-2 max-md:py-2 max-md:text-xs"
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
      <UserDetailsModal
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
import moment from "moment-timezone";

const showDepositModal = ref(false);
const selectedDepositUser = ref(null);
const { isExporting, exportToExcel } = useExportExcel();
const { getCompanyId } = useCompany();
const adminUserData = useState("adminUserData");
const { delete: del } = useApiEndpoint();
const currency = useCurrency();
const isPageLoading = ref(true);
const allusers = ref([]);
const { get, publicGet } = useApiEndpoint();
const tableHeaders = [
  { key: "view", label: "View", labelCN: "查看", sortable: false },
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  { key: "userid", label: "User ID", labelCN: "用户ID", sortable: true },
  { key: "fullname", label: "Fullname", labelCN: "全名", sortable: true },
  {
    key: "phoneNumber",
    label: "Phone Number",
    labelCN: "手机号",
    sortable: false,
  },
  {
    key: "totalDeposit",
    label: "Total Deposit",
    labelCN: "总存款",
    sortable: true,
  },
  {
    key: "totalWithdraw",
    label: "Total Withdraw",
    labelCN: "总提款",
    sortable: true,
  },
  {
    key: "winLose",
    label: "Net Winlose",
    labelCN: "总输赢",
    sortable: true,
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
  { key: "actions", label: "Actions", labelCN: "操作", sortable: false },
  { key: "delete", label: "Delete", labelCN: "删除", sortable: false },
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

const showNewUserModal = ref(false);

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

    const { data } = await get(`allusers?${queryParams}`);
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
    const { data } = await get(`user/${user._id}`);
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
      const { data } = await get(`user/${selectedUser.value._id}`);
      if (data.success) {
        selectedUser.value = data.data;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to refresh user details",
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
      text: $t("delete_user_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: $t("confirm_delete"),
      cancelButtonText: $t("cancel"),
    });
    if (result.isConfirmed) {
      const { data } = await del(`user/${user._id}`);
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
};

const filteredTableHeaders = computed(() => {
  return tableHeaders.filter((header) => {
    if (header.key === "actions") {
      return (
        adminUserData.value?.role === "superadmin" ||
        adminUserData.value?.role === "admin"
      );
    }
    if (header.key === "wallettwo") {
      return ["localhost", "ezwin9"].includes(getCompanyId());
    }

    return true;
  });
});

const handleExport = async () => {
  try {
    const hasExportPermission =
      adminUserData.value?.role === "superadmin" ||
      adminUserData.value?.role === "admin";
    if (!hasExportPermission) {
      Swal.fire({
        icon: "error",
        title: $t("permission_denied"),
        text: $t("export_permission_required"),
      });
      return;
    }
    isPageLoading.value = true;
    const { data } = await publicGet("allusers/export");
    if (!data.success || data.data.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = data.data.map((user, index) => ({
      no: index + 1,
      userid: user.userid || "-",
      username: user.username || "-",
      fullname: user.fullname || "-",
      phonenumber: user.phonenumber || "-",
      email: user.email || "-",
      viplevel: user.viplevel || "-",
      wallet: Number(user.wallet || 0).toFixed(2),
      status: user.status ? "Active" : "Inactive",
      isPhoneVerified: user.isPhoneVerified ? "Yes" : "No",
      isEmailVerified: user.isEmailVerified ? "Yes" : "No",
      totaldeposit: Number(user.totaldeposit || 0).toFixed(2),
      totalwithdraw: Number(user.totalwithdraw || 0).toFixed(2),
      totalbonus: Number(user.totalbonus || 0).toFixed(2),
      winloss: Number(user.winloss || 0).toFixed(2),
      totalturnover: Number(user.totalturnover || 0).toFixed(2),
      createdAt: user.createdAt ? formatDate(user.createdAt) : "-",
      firstDepositDate: user.firstDepositDate
        ? formatDate(user.firstDepositDate)
        : "-",
      lastLogin: user.lastLogin ? formatDate(user.lastLogin) : "-",
      lastdepositdate: user.lastdepositdate
        ? formatDate(user.lastdepositdate)
        : "-",
      registerIp: user.registerIp || "-",
      lastLoginIp: user.lastLoginIp || "-",
      duplicateIP: user.duplicateIP ? "Yes" : "No",
      remark: user.remark || "-",
    }));
    const filename = `user_list_${moment().format("YYYY-MM-DD")}`;
    await exportToExcel({
      data: exportData,
      filename,
      sheetName: "User List",
      columns: {
        no: { header: "No", width: 8 },
        userid: { header: "User ID", width: 12 },
        username: { header: "Username", width: 15 },
        fullname: { header: "Fullname", width: 20 },
        phonenumber: { header: "Phone", width: 15 },
        email: { header: "Email", width: 25 },
        viplevel: { header: "VIP Level", width: 12 },
        wallet: { header: "Wallet", width: 12 },
        status: { header: "Status", width: 10 },
        isPhoneVerified: { header: "Phone Verified", width: 14 },
        isEmailVerified: { header: "Email Verified", width: 14 },
        totaldeposit: { header: "Total Deposit", width: 15 },
        totalwithdraw: { header: "Total Withdraw", width: 15 },
        totalbonus: { header: "Total Bonus", width: 12 },
        winloss: { header: "Win/Lose", width: 12 },
        totalturnover: { header: "Total Turnover", width: 15 },
        createdAt: { header: "Register Date", width: 18 },
        firstDepositDate: { header: "First Deposit", width: 18 },
        lastLogin: { header: "Last Login", width: 18 },
        lastdepositdate: { header: "Last Deposit", width: 18 },
        registerIp: { header: "Register IP", width: 15 },
        lastLoginIp: { header: "Last Login IP", width: 15 },
        duplicateIP: { header: "Duplicate IP", width: 12 },
        remark: { header: "Remark", width: 20 },
      },
      afterExport: (success) => {
        if (success) {
          Swal.fire({
            icon: "success",
            title: $t("export_success"),
            text: $t("file_downloaded_successfully"),
            timer: 1500,
          });
        }
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    Swal.fire({
      icon: "error",
      title: $t("export_failed"),
      text: error.message,
    });
  } finally {
    isPageLoading.value = false;
  }
};

const handleWithdraw = (user) => {
  console.log("Withdraw for user:", user.username);
};

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

const handleDeposit = (user) => {
  selectedDepositUser.value = user;
  showDepositModal.value = true;
};

const handleDepositSuccess = async () => {
  await fetchAllUsers();
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchAllUsers();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | User List",
});
</script>

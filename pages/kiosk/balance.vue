<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("kiosk_balance") }}
        </h1>
      </div>
    </div>

    <!-- Balance Card -->
    <div
      class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-6 mb-8 max-md:gap-4 max-md:mb-6"
    >
      <!-- Current Balance Card -->
      <div class="bg-white rounded-lg shadow p-6 max-md:p-4">
        <div class="flex items-center justify-between mb-4 max-md:mb-3">
          <h2 class="text-lg font-medium text-gray-700 max-md:text-base">
            {{ $t("current_balance") }}
          </h2>
          <div class="flex items-center gap-2 max-md:gap-1.5">
            <button
              v-if="isSuperAdmin"
              @click="openBalanceModal"
              class="ml-2 p-1 text-gray-500 lg:hover:text-indigo-600 transition-colors max-md:ml-1 max-md:p-0.5"
              title="Update Balance"
            >
              <Icon
                icon="mdi:cash-plus"
                class="w-8 h-8 text-green-600 max-md:w-6 max-md:h-6"
              />
            </button>
            <button
              @click="refreshKioskBalance"
              class="p-2 text-indigo-600 lg:hover:text-indigo-500 max-md:p-1"
            >
              <Icon
                icon="heroicons:arrow-path"
                class="w-6 h-6 max-md:w-5 max-md:h-5"
              />
            </button>
          </div>
        </div>
        <div class="flex items-end gap-2">
          <p class="text-3xl font-bold text-gray-800 max-md:text-2xl">
            ${{ displayBalance }}
          </p>
        </div>
        <div>
          <div
            v-if="adminUserData?.role === 'superadmin'"
            class="mt-4 pt-4 border-t border-gray-100 max-md:mt-3 max-md:pt-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 max-md:text-xs">{{
                $t("status")
              }}</span>
              <div class="flex items-center gap-2 max-md:gap-1.5">
                <BaseToggleSwitch
                  v-model="balanceInfo.status"
                  @update:modelValue="handleStatusToggle"
                  :disabled="!isSuperAdmin"
                />
                <span class="text-sm text-gray-600 max-md:text-xs">
                  {{ balanceInfo.status ? $t("active") : $t("inactive") }}
                </span>
              </div>
            </div>
          </div>
          <div v-else></div>
        </div>
      </div>

      <!-- Minimum Balance Card -->
      <div class="bg-white rounded-lg shadow p-6 max-md:p-4">
        <div class="flex items-center justify-between mb-4 max-md:mb-3">
          <h2 class="text-lg font-medium text-gray-700 max-md:text-base">
            {{ $t("minimum_balance_alert") }}
          </h2>
          <Icon
            icon="mdi:alert-circle-outline"
            class="w-8 h-8 text-amber-500 max-md:w-6 max-md:h-6"
          />
        </div>
        <div class="flex items-end gap-2">
          <p class="text-3xl font-bold text-gray-800 max-md:text-2xl">
            ${{ displayMinBalance }}
          </p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 max-md:mt-3 max-md:pt-3">
          <button
            @click="showMinBalanceModal = true"
            class="w-full py-2 bg-indigo-600 lg:hover:bg-indigo-500 text-white rounded-md transition-colors max-md:py-1.5 max-md:text-sm"
          >
            {{ $t("update_minimum_balance_alert") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Transaction History Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b max-md:p-3">
        <div
          class="flex justify-between items-center mb-4 max-md:mb-3 max-md:flex-col max-md:items-start max-md:gap-3"
        >
          <h2 class="text-lg font-medium text-gray-700 max-md:text-base">
            {{ $t("transaction_history") }}
          </h2>
          <div class="max-md:w-full">
            <BaseSearch
              v-model="searchQuery"
              :placeholder="$t('search_username')"
              @type-change="handleTypeChange"
            />
          </div>
        </div>
        <div
          class="flex items-center gap-4 max-md:flex-col max-md:items-stretch max-md:gap-3"
        >
          <div
            class="flex items-center gap-2 max-md:flex-col max-md:items-stretch max-md:w-full"
          >
            <BaseDatePicker
              v-model="dateRange.startDate"
              :placeholder="$t('start_date')"
              class="w-36 max-md:w-full"
            />
            <span class="text-gray-400 max-md:hidden">-</span>
            <BaseDatePicker
              v-model="dateRange.endDate"
              :placeholder="$t('end_date')"
              class="w-36 max-md:w-full"
            />
          </div>
          <DateFilterButtons ref="dateFilterRef" v-model="dateRange" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("date") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("username") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("transaction_type") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("operation") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("amount") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("previous_balance") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("new_balance") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("processed_by") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("remark") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction._id"
              :class="
                transaction.operation === 'add' ? 'bg-green-50' : 'bg-red-50'
              "
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.formattedDate }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.username || $t("system") }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.transactionType }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span
                  :class="
                    transaction.operation === 'add'
                      ? 'text-green-600 font-medium'
                      : 'text-red-600 font-medium'
                  "
                >
                  {{ transaction.operation === "add" ? "Add" : "Subtract" }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium max-md:px-3 max-md:py-3 max-md:text-xs"
                :class="
                  transaction.operation === 'add'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                ${{ transaction.amount.toFixed(2) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                ${{ transaction.previousBalance.toFixed(2) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                ${{ transaction.newBalance.toFixed(2) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.processBy }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.remark || "-" }}
              </td>
            </tr>
            <tr
              v-if="paginatedTransactions.length === 0"
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
                  {{ $t("no_transaction_history_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="transactions.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- Balance Update Modal -->
    <KioskBalanceModal
      v-model:show="showBalanceModal"
      :current-balance="balanceInfo.balance || 0"
      @submit="handleBalanceUpdate"
    />

    <!-- Min Balance Modal -->
    <KioskMinBalanceModal
      v-model:show="showMinBalanceModal"
      :current-min-balance="balanceInfo.minBalance || 0"
      @submit="handleMinBalanceUpdate"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import moment from "moment-timezone";

const adminUserData = useState("adminUserData");
const isPageLoading = ref(true);
const { publicGet, publicPut } = useApiEndpoint();
const balanceInfo = ref({
  balance: 0,
  status: false,
  minBalance: 0,
});
const dateFilterRef = ref(null);
const showBalanceModal = ref(false);
const showMinBalanceModal = ref(false);
const transactions = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const displayBalance = computed(() => {
  const balance = balanceInfo.value?.balance;
  return typeof balance === "number" ? balance.toFixed(2) : "0.0000";
});

const displayMinBalance = computed(() => {
  const minBalance = balanceInfo.value?.minBalance;
  return typeof minBalance === "number" ? minBalance.toFixed(0) : "0";
});

const isSuperAdmin = computed(() => {
  return adminUserData.value?.role === "superadmin";
});

const dateRange = ref({
  startDate: null,
  endDate: null,
});

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        (item.username && item.username.toLowerCase().includes(searchTerm)) ||
        (item.processBy && item.processBy.toLowerCase().includes(searchTerm))
    );
  }

  if (dateRange.value.startDate && dateRange.value.endDate) {
    filtered = filtered.filter((item) => {
      const itemDate = moment(item.date).tz("Asia/Kuala_Lumpur");
      const startDate = moment(dateRange.value.startDate)
        .tz("Asia/Kuala_Lumpur")
        .startOf("day");
      const endDate = moment(dateRange.value.endDate)
        .tz("Asia/Kuala_Lumpur")
        .endOf("day");
      return itemDate.isBetween(startDate, endDate, null, "[]");
    });
  }

  return filtered;
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value
    .slice(start, end)
    .map((transaction, index) => ({
      ...transaction,
      no: start + index + 1,
    }));
});

const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
);

const openBalanceModal = () => {
  if (isSuperAdmin.value) {
    showBalanceModal.value = true;
  }
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

const fetchKioskBalance = async () => {
  try {
    const { data } = await publicGet("kiosk-balance");
    if (data.success) {
      balanceInfo.value = {
        balance: data.data.balance || 0,
        status: !!data.data.status,
        minBalance: data.data.minBalance || 0,
      };
    }
  } catch (error) {
    console.error("Error fetching kiosk balance:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch kiosk balance information",
    });
  }
};

const refreshKioskBalance = async () => {
  try {
    const { data } = await publicGet("kiosk-balance");
    if (data.success) {
      balanceInfo.value.balance = data.data.balance;
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
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

const handleStatusToggle = async () => {
  try {
    const { data } = await publicPut("kiosk-status");
    if (data.success) {
      balanceInfo.value.status = !!data.data.status;
      balanceInfo.value.balance = data.data.balance || 0;
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
    } else {
      balanceInfo.value.status = !balanceInfo.value.status;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    balanceInfo.value.status = !balanceInfo.value.status;
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

const handleBalanceUpdate = async (formData) => {
  if (!isSuperAdmin.value) return;

  try {
    const { data } = await publicPut("kiosk-balance", {
      operation: formData.operation,
      amount: formData.amount,
      remark: formData.remark,
    });

    if (data.success) {
      balanceInfo.value.balance = data.data.balance || 0;
      balanceInfo.value.status = !!data.data.status;
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchTransactionHistory();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error(`Error ${formData.operation}ing balance:`, error);
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

const handleMinBalanceUpdate = async (formData) => {
  try {
    const { data } = await publicPut("kiosk-min-balance", {
      minBalance: formData.minBalance,
    });

    if (data.success) {
      await fetchKioskBalance();
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating minimum balance:", error);
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

const fetchTransactionHistory = async () => {
  try {
    isPageLoading.value = true;
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }

    const response = await publicGet(
      `kiosk-transaction-logs?${params.toString()}`
    );
    if (response.data.success) {
      transactions.value = response.data.data.map((transaction, index) => ({
        ...transaction,
        no: index + 1,
        formattedDate: formatDate(transaction.date),
      }));
    }
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch transaction history",
    });
  } finally {
    isPageLoading.value = false;
  }
};

watch(
  dateRange,
  () => {
    currentPage.value = 1;
    fetchTransactionHistory();
  },
  { deep: true }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchKioskBalance();
  await fetchTransactionHistory();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Kiosk Balance",
});
</script>

<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("payment_gateway_report") }}
          </h1>
        </div>
      </div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid grid-cols-2 items-center gap-6 mb-6 max-2xl:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >{{ $t("date") }}:</label
          >
          <div
            class="flex items-center gap-2 max-md:flex-col max-md:items-stretch"
          >
            <BaseDatePicker
              v-model="dateRange.startDate"
              :placeholder="$t('start_date')"
              :is-start-date="true"
              :other-date="dateRange.endDate"
              @update:otherDate="dateRange.endDate = null"
            />
            <span class="text-gray-500 max-md:hidden">-</span>
            <BaseDatePicker
              v-model="dateRange.endDate"
              :placeholder="$t('end_date')"
              :is-start-date="false"
              :other-date="dateRange.startDate"
            />
          </div>
        </div>
        <DateFilterButtons ref="dateFilterRef" v-model="dateRange" />
      </div>

      <div class="grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >{{ $t("gateway") }}:</label
          >
          <CustomSelect
            v-model="selectedGatewayId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option
              v-for="gateway in gateways"
              :key="gateway._id"
              :value="gateway._id"
            >
              {{ gateway.name }}
            </option>
          </CustomSelect>
        </div>

        <!-- ✅ New: Transaction Type Filter -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >{{ $t("transaction_type") }}:</label
          >
          <CustomSelect
            v-model="selectedTransactionType"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{{ $t("all_types") }}</option>
            <option value="deposit">{{ $t("deposit") }}</option>
            <option value="withdraw">{{ $t("withdraw") }}</option>
          </CustomSelect>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >{{ $t("status") }}:</label
          >
          <CustomSelect
            v-model="selectedStatus"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{{ $t("all_status") }}</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Timeout">Timeout</option>
          </CustomSelect>
        </div>
      </div>
      <div
        class="flex items-center justify-between mt-4 max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <button
          v-if="
            adminUserData?.role === 'superadmin' ||
            adminUserData?.role === 'admin'
          "
          @click="handleExport"
          :disabled="isExporting || filteredTransactions.length === 0"
          class="px-6 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          <Icon
            :icon="
              isExporting ? 'eos-icons:loading' : 'material-symbols:download'
            "
            class="max-md:w-4 max-md:h-4"
          />
          {{ $t("export_to_excel") }}
        </button>
        <div v-else></div>
        <BaseResetButton @click="handleReset" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <BaseSearch
          v-model="searchQuery"
          :placeholder="$t('search_username')"
          @type-change="handleTypeChange"
        />
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="header.sortable && handleSort(header.key)"
              >
                <div class="flex items-center justify-center gap-1">
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                  <Icon
                    v-if="header.sortable"
                    :icon="getSortIcon(header.key)"
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.no }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.username }}
              </td>
              <td class="px-4 py-4 text-sm max-md:px-3 max-md:py-3">
                <span
                  v-if="transaction.transactiontype"
                  :class="{
                    'px-2.5 py-1 rounded-full font-medium text-xs inline-flex items-center gap-1 max-md:px-2 max-md:py-0.5 max-md:text-[10px]': true,
                    'bg-blue-100 text-blue-700':
                      transaction.transactiontype === 'deposit',
                    'bg-purple-100 text-purple-700':
                      transaction.transactiontype === 'withdraw',
                  }"
                >
                  <Icon
                    :icon="
                      transaction.transactiontype === 'deposit'
                        ? 'heroicons:arrow-down-circle'
                        : 'heroicons:arrow-up-circle'
                    "
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                  {{
                    transaction.transactiontype === "deposit"
                      ? $t("deposit")
                      : $t("withdraw")
                  }}
                </span>
                <span
                  v-else
                  class="px-2.5 py-1 rounded-full font-medium text-xs inline-flex items-center gap-1 bg-gray-100 text-gray-600 max-md:px-2 max-md:py-0.5 max-md:text-[10px]"
                >
                  N/A
                </span>
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(transaction.amount) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(transaction.platformCharge) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.ourRefNo }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.paymentGatewayRefNo || "-" }}
              </td>
              <td class="px-4 py-4 text-sm max-md:px-3 max-md:py-3">
                <span
                  :class="{
                    'px-2.5 py-1 rounded-full font-medium text-xs inline-flex items-center gap-1 max-md:px-2 max-md:py-0.5 max-md:text-[10px]': true,
                    'bg-green-100 text-green-700':
                      transaction.status === 'Success',
                    'bg-yellow-100 text-yellow-700':
                      transaction.status === 'Pending',
                    'bg-red-100 text-red-700':
                      transaction.status === 'Failed' ||
                      transaction.status === 'Reject',
                    'bg-gray-100 text-gray-700':
                      transaction.status === 'Timeout',
                  }"
                >
                  <Icon
                    :icon="
                      {
                        Success: 'heroicons:check-circle',
                        Pending: 'heroicons:clock',
                        Failed: 'heroicons:x-circle',
                        Reject: 'heroicons:x-circle',
                        Timeout: 'heroicons:exclamation-circle',
                      }[transaction.status]
                    "
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                  {{ transaction.status }}
                </span>
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(transaction.createdAt) }}
              </td>
            </tr>
            <!-- Total Row -->
            <tr
              v-if="filteredTransactions.length > 0"
              class="bg-gray-100 border-t-2 border-gray-300 font-semibold"
            >
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              ></td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ $t("total") }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                -
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totalAmount) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totalPlatformCharge) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                -
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                -
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                -
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                -
              </td>
            </tr>
            <!-- Empty State -->
            <tr
              v-if="paginatedTransactions.length === 0"
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
                  {{ $t("no_records_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        v-if="paginatedTransactions.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import moment from "moment-timezone";
import { formatDate } from "~/utils/dateFormatter";

const selectedStatus = ref("");
const selectedTransactionType = ref(""); // ✅ New filter
const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const currency = useCurrency();
const { publicGet, get } = useApiEndpoint();
const selectedGatewayId = ref("");
const gateways = ref([]);
const transactions = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateFilterRef = ref(null);

const dateRange = ref({
  startDate: null,
  endDate: null,
});

const sortConfig = ref({
  key: "createdAt",
  direction: "desc",
});

const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号" },
  { key: "username", label: "Username", labelCN: "用户名", sortable: true },
  // ✅ New header
  { key: "transactiontype", label: "Type", labelCN: "类型", sortable: true },
  { key: "amount", label: "Amount", labelCN: "金额", sortable: true },
  {
    key: "platformCharge",
    label: "Platform Charge",
    labelCN: "平台费用",
    sortable: true,
  },
  {
    key: "ourRefNo",
    label: "Our Ref No",
    labelCN: "我方参考号",
    sortable: false,
  },
  {
    key: "paymentGatewayRefNo",
    label: "Gateway Ref No",
    labelCN: "网关参考号",
    sortable: false,
  },
  { key: "status", label: "Status", labelCN: "状态", sortable: true },
  {
    key: "createdAt",
    label: "Created At",
    labelCN: "创建时间",
    sortable: true,
  },
];

const fetchGateways = async () => {
  try {
    const { data } = await publicGet("payment-gateways");
    if (data.success) {
      gateways.value = data.data;
      if (gateways.value.length > 0) {
        selectedGatewayId.value = gateways.value[0]._id;
        await fetchTransactions();
      }
    }
  } catch (error) {
    console.error("Error fetching gateways:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load payment gateways",
    });
  }
};

const fetchTransactions = async () => {
  if (!selectedGateway.value?.reportAPI) {
    transactions.value = [];
    return;
  }
  try {
    if (!selectedGateway.value.reportAPI.trim()) {
      transactions.value = [];
      return;
    }
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }

    const { data } = await get(
      `${selectedGateway.value.reportAPI}?${params.toString()}`
    );

    if (data.success) {
      transactions.value = data.data;
    } else {
      transactions.value = [];
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    transactions.value = [];
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load transaction data",
    });
  }
};

const filteredTransactions = computed(() => {
  let result = [...transactions.value];

  // ✅ Filter by transaction type
  if (selectedTransactionType.value) {
    result = result.filter(
      (transaction) =>
        transaction.transactiontype === selectedTransactionType.value
    );
  }

  if (selectedStatus.value) {
    result = result.filter(
      (transaction) => transaction.status === selectedStatus.value
    );
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((transaction) =>
      transaction.username.toLowerCase().includes(query)
    );
  }
  if (sortConfig.value.key) {
    result.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (sortConfig.value.key === "createdAt") {
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

  return result;
});

const totalAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, transaction) => {
    return sum + (parseFloat(transaction.amount) || 0);
  }, 0);
});

const totalPlatformCharge = computed(() => {
  return filteredTransactions.value.reduce((sum, transaction) => {
    return sum + (parseFloat(transaction.platformCharge) || 0);
  }, 0);
});

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2);
};

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

const handleSort = (key) => {
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

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  selectedStatus.value = "";
  selectedTransactionType.value = ""; // ✅ Reset transaction type
  currentPage.value = 1;
  fetchTransactions();
};

const getSortIcon = (key) => {
  if (key !== sortConfig.value.key) return "material-symbols:unfold-more";
  return sortConfig.value.direction === "asc"
    ? "material-symbols:arrow-upward"
    : "material-symbols:arrow-downward";
};

const selectedGateway = computed(() =>
  gateways.value.find((g) => g._id === selectedGatewayId.value)
);

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
    if (filteredTransactions.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = filteredTransactions.value.map((transaction, index) => ({
      no: index + 1,
      username: transaction.username,
      transactiontype: transaction.transactiontype
        ? transaction.transactiontype === "deposit"
          ? $t("deposit")
          : $t("withdraw")
        : "N/A",
      amount: transaction.amount,
      platformCharge: transaction.platformCharge,
      ourRefNo: transaction.ourRefNo,
      paymentGatewayRefNo: transaction.paymentGatewayRefNo,
      status: transaction.status,
      createdAt: transaction.createdAt,
    }));
    let filename = `payment_gateway_report_${
      selectedGateway.value?.name || "all"
    }`;
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    } else {
      filename += `_${moment().format("YYYY-MM-DD")}`;
    }
    await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("payment_gateway_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        username: { header: $t("username"), width: 15 },
        transactiontype: { header: $t("transaction_type"), width: 12 }, // ✅ Added
        amount: { header: $t("amount"), width: 12 },
        platformCharge: { header: $t("platform_charge"), width: 15 },
        ourRefNo: { header: $t("our_ref_no"), width: 20 },
        paymentGatewayRefNo: { header: $t("gateway_ref_no"), width: 20 },
        status: { header: $t("status"), width: 12 },
        createdAt: { header: $t("created_at"), width: 18 },
      },
      formatter: (value, key) => {
        if (
          (key === "amount" || key === "platformCharge") &&
          typeof value === "number"
        ) {
          return value.toFixed(2);
        }
        if (key === "createdAt" && value) {
          return moment(value).format("YYYY-MM-DD HH:mm:ss");
        }
        return value;
      },
      beforeExport: () => {},
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
  }
};

// ✅ Watch transaction type filter
watch(selectedTransactionType, () => {
  currentPage.value = 1;
});

watch(selectedStatus, () => {
  currentPage.value = 1;
});

watch(
  selectedGatewayId,
  async (newId) => {
    if (newId) {
      currentPage.value = 1;
      await fetchTransactions();
    }
  },
  { immediate: true }
);

watch(
  [() => dateRange.value.startDate, () => dateRange.value.endDate],
  ([newStartDate, newEndDate], [oldStartDate, oldEndDate]) => {
    if (
      newStartDate &&
      newEndDate &&
      (newStartDate !== oldStartDate || newEndDate !== oldEndDate)
    ) {
      currentPage.value = 1;
      fetchTransactions();
    }
  }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchGateways();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Payment Gateway Report",
});
</script>

<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("payment_gateway_transaction") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
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
      <div
        class="grid grid-cols-2 gap-6 mb-6 max-sm:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs"
            >{{ $t("payment_gateway") }}:</label
          >
          <CustomSelect v-model="filters.gatewayName">
            <option value="">{{ $t("all") }}</option>
            <option
              v-for="gateway in uniqueGateways"
              :key="gateway"
              :value="gateway"
            >
              {{ gateway }}
            </option>
          </CustomSelect>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs"
            >{{ $t("transaction_type") }}:</label
          >
          <CustomSelect v-model="filters.transactionType">
            <option value="">{{ $t("all") }}</option>
            <option value="deposit">{{ $t("deposit") }}</option>
            <option value="withdrawal">{{ $t("withdraw") }}</option>
            <option value="adjustment">{{ $t("adjustment") }}</option>
            <option value="refund">{{ $t("refund") }}</option>
          </CustomSelect>
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <BaseResetButton @click="handleReset" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                <div
                  class="flex items-center justify-center whitespace-nowrap gap-1"
                >
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-center whitespace-nowrap">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.gatewayName }}
              </td>

              <td class="px-6 py-4 uppercase max-md:px-3 max-md:py-3">
                <div
                  v-if="transaction.playerusername"
                  class="flex flex-col items-center justify-center gap-2 max-md:gap-1"
                >
                  <div class="text-xs text-gray-500">
                    {{ $t("username") }}: {{ transaction.playerusername }}
                  </div>
                  <div
                    v-if="transaction.playerfullname"
                    class="text-xs text-gray-500"
                  >
                    {{ $t("fullname") }}: {{ transaction.playerfullname }}
                  </div>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td
                class="px-6 py-4 text-sm uppercase max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.transactiontype }}
              </td>
              <td
                class="px-6 py-4 text-sm font-medium max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(transaction.amount) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 whitespace-pre-wrap max-md:px-3 max-md:py-3 max-md:text-xs"
                style="width: 200px; min-width: 200px; max-width: 200px"
              >
                {{ transaction.remark || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(transaction.lastBalance) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(transaction.currentBalance) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{
                  transaction.createdAt
                    ? formatDate(transaction.createdAt)
                    : "-"
                }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ transaction.processby || "-" }}
              </td>
            </tr>
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
                  {{ $t("no_gateway_transactions_found") }}
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
import moment from "moment-timezone";
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const isPageLoading = ref(true);
const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号" },
  { key: "gatewayName", label: "Gateway Name", labelCN: "网关名称" },
  { key: "playerDetails", label: "Player Details", labelCN: "玩家详情" },
  {
    key: "transactiontype",
    label: "Transaction Type",
    labelCN: "交易类型",
    sortable: true,
  },
  { key: "amount", label: "Amount", labelCN: "金额", sortable: true },
  { key: "remark", label: "Remark", labelCN: "备注" },
  {
    key: "lastBalance",
    label: "Last Balance",
    labelCN: "上次余额",
    sortable: true,
  },
  {
    key: "currentBalance",
    label: "Current Balance",
    labelCN: "当前余额",
    sortable: true,
  },
  {
    key: "transactionTime",
    label: "Date & Time",
    labelCN: "日期和时间",
    sortable: true,
  },
  { key: "processby", label: "Process By", labelCN: "处理人" },
];

const currency = useCurrency();
const { get } = useApiEndpoint();
const isLoading = ref(false);
const transactions = ref([]);
const filters = ref({
  gatewayName: "",
  transactionType: "",
});
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const fetchTransactions = async () => {
  const params = new URLSearchParams();
  if (dateRange.value.startDate) {
    params.append("startDate", dateRange.value.startDate);
  }
  if (dateRange.value.endDate) {
    params.append("endDate", dateRange.value.endDate);
  }
  try {
    isLoading.value = true;
    const { data } = await get(
      `paymentgatewaytransactionlog?${params.toString()}`
    );
    if (data.success) {
      transactions.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load transaction data",
    });
  } finally {
    isLoading.value = false;
  }
};

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];

  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        (item.gatewayName || "").toLowerCase().includes(searchTerm) ||
        (item.transactiontype || "").toLowerCase().includes(searchTerm) ||
        (item.playerusername || "").toLowerCase().includes(searchTerm) ||
        (item.playerfullname || "").toLowerCase().includes(searchTerm) ||
        (item.remark || "").toLowerCase().includes(searchTerm) ||
        (item.processby || "").toLowerCase().includes(searchTerm)
    );
  }

  if (filters.value.gatewayName) {
    filtered = filtered.filter(
      (item) => item.gatewayName === filters.value.gatewayName
    );
  }

  if (filters.value.transactionType) {
    filtered = filtered.filter(
      (item) =>
        item.transactiontype.toLowerCase() ===
        filters.value.transactionType.toLowerCase()
    );
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
);

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

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  filters.value.gatewayName = "";
  filters.value.transactionType = "";
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
};

const uniqueGateways = computed(() => {
  const gateways = new Set();
  transactions.value.forEach((t) => {
    if (t.gatewayName) {
      gateways.add(t.gatewayName);
    }
  });
  return Array.from(gateways).sort();
});

watch(
  dateRange,
  () => {
    if (dateRange.value.startDate && dateRange.value.endDate) {
      currentPage.value = 1;
      fetchTransactions();
    }
  },
  { deep: true }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

onMounted(async () => {
  await fetchTransactions();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Payment Gateway Transaction",
});
</script>

<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("affiliate_report") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid grid-cols-2 items-center gap-6 mb-6 max-2xl:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <!-- Date Range -->
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

      <div class="flex justify-end gap-3 max-md:justify-stretch">
        <button
          @click="resetFilters"
          class="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg lg:hover:bg-gray-200 flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          <Icon icon="material-symbols:refresh" class="max-md:w-4 max-md:h-4" />
          {{ $t("reset") }}
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-between p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4">
          <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:hidden"></div>
          <span class="text-xl font-semibold max-md:hidden">{{
            $t("report_details")
          }}</span>
        </div>
        <div class="flex items-center gap-2 max-md:w-full">
          <BaseSearch v-model="searchQuery" @type-change="handleTypeChange" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
              >
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1"
                >
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
              v-for="log in paginatedLogs"
              :key="log._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.no }}
              </td>

              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex flex-col items-center gap-2 max-md:gap-1">
                  <span class="font-medium text-gray-900">{{
                    log.username
                  }}</span>
                  <span
                    :class="{
                      'bg-yellow-100 text-yellow-800': log.status === 'pending',
                      'bg-green-100 text-green-800': log.status === 'approved',
                      'bg-red-100 text-red-800': log.status === 'rejected',
                      'bg-gray-100 text-gray-800': log.status === 'cancel',
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium max-md:px-1.5 max-md:py-2"
                  >
                    {{ log.status.toUpperCase() }}
                  </span>
                </div>
              </td>
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totalDownlineDeposit) }}
              </td>
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totalDownlineWithdraw) }}
              </td>
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totalDownlineBonus) }}
              </td>

              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{
                  log.totaldownlineAPIFees
                    ? formatAmount(log.totaldownlineAPIFees)
                    : "-"
                }}
              </td>
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totalNetAmount) }}
              </td>
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.amount) }}
              </td>
              <td class="px-4 py-4 text-sm max-md:px-3 max-md:py-3">
                <button
                  @click="openFormulaModal(log)"
                  class="group inline-flex items-center gap-2 text-gray-600 lg:hover:text-blue-600 transition-colors max-md:gap-1"
                >
                  <div
                    class="p-1.5 rounded-lg bg-gray-100 lg:group-hover:bg-blue-100 transition-colors max-md:p-1"
                  >
                    <Icon
                      icon="material-symbols:calculate"
                      class="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
                    />
                  </div>
                  <span class="text-xs font-medium">{{ $t("formula") }}</span>
                </button>
              </td>
              <td class="px-4 py-4 text-sm max-md:px-3 max-md:py-3">
                <button
                  @click="openDownlineModal(log)"
                  class="group inline-flex items-center gap-2 text-gray-600 lg:hover:text-green-600 transition-colors max-md:gap-1"
                >
                  <div
                    class="p-1.5 rounded-lg bg-gray-100 lg:group-hover:bg-green-100 transition-colors max-md:p-1"
                  >
                    <Icon
                      icon="material-symbols:group"
                      class="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
                    />
                  </div>
                  <span class="text-xs font-medium">{{ $t("details") }}</span>
                </button>
              </td>
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.reportDate }}
              </td>
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(log.createdAt) }}
              </td>
              <td
                class="px-4 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.remark || "-" }}
              </td>
              <td class="px-4 py-4 text-sm max-md:px-3 max-md:py-3">
                <button
                  @click="openStatusModal(log)"
                  class="bg-indigo-600 lg:hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors max-md:px-2 max-md:py-2"
                >
                  {{ $t("change_status") }}
                </button>
              </td>
            </tr>
            <tr
              v-if="paginatedLogs.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="15"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_logs_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedLogs.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />
      <AffiliateReportFormulaModal
        :show="formulaModal.show"
        :content="formulaModal.content"
        @close="closeFormulaModal"
      />
      <AffiliateReportDownlineModal
        :show="downlineModal.show"
        :details="downlineModal.details"
        @close="closeDownlineModal"
      />
      <AffiliateReportStatusModal
        :show="statusModal.show"
        :report-data="statusModal.reportData"
        :current-status="statusModal.currentStatus"
        :new-status="statusModal.newStatus"
        :remark="statusModal.remark"
        :loading="statusUpdateLoading"
        :receiptFile="statusModal.receiptFile"
        @close="closeStatusModal"
        @update="updateStatus"
      />
    </div>
  </div>
</template>

<script setup>
import moment from "moment-timezone";
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";
const currency = useCurrency();

const isPageLoading = ref(true);
const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  { key: "status", label: "Username", labelCN: "用户名", sortable: true },
  {
    key: "totalDownlineDeposit",
    label: "Deposit",
    labelCN: "总存款",
    sortable: true,
  },
  {
    key: "totalDownlineWithdraw",
    label: "Withdraw",
    labelCN: "总提款",
    sortable: true,
  },
  {
    key: "totalDownlineBonus",
    label: "Bonus",
    labelCN: "总奖金",
    sortable: true,
  },
  {
    key: "totaldownlineAPIFees",
    label: "API Fees",
    labelCN: "API费用总计",
    sortable: true,
  },
  {
    key: "totalNetAmount",
    label: "Net Amount",
    labelCN: "净额",
    sortable: true,
  },
  {
    key: "amount",
    label: "Commission",
    labelCN: "佣金金额",
    sortable: true,
  },
  { key: "formula", label: "Formula", labelCN: "计算公式", sortable: false },
  {
    key: "downlinedetail",
    label: "Downline Details",
    labelCN: "下线详情",
    sortable: false,
  },
  {
    key: "reportDate",
    label: "Report Date",
    labelCN: "报告日期",
    sortable: true,
  },
  {
    key: "createdAt",
    label: "Created Date",
    labelCN: "创建日期",
    sortable: true,
  },
  {
    key: "remark",
    label: "Remark",
    labelCN: "备注",
    sortable: false,
  },
  { key: "action", label: "Action", labelCN: "操作", sortable: false },
];

const sortConfig = ref({
  key: "createdAt",
  direction: "desc",
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

const dateFilterRef = ref(null);
const logs = ref([]);
const { get } = useApiEndpoint();

const fetchLogs = async () => {
  const params = new URLSearchParams();
  if (dateRange.value.startDate) {
    params.append("startDate", dateRange.value.startDate);
  }
  if (dateRange.value.endDate) {
    params.append("endDate", dateRange.value.endDate);
  }
  try {
    const { data } = await get(`affiliatereport?${params.toString()}`);
    console.log(data);
    if (data.success) {
      logs.value = data.data.map((item, index) => ({
        ...item,
        no: index + 1,
      }));
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
};

const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const searchQuery = ref("");

const filteredLogs = computed(() => {
  let filtered = [...logs.value];

  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter((item) =>
      item.username.toLowerCase().includes(searchTerm)
    );
  }

  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
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

  return filtered;
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredLogs.value.slice(start, end).map((log, index) => ({
    ...log,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredLogs.value.length / itemsPerPage.value)
);

const resetFilters = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
};

const handleTypeChange = (type) => {
  searchType.value = type;
};

watch(
  dateRange,
  () => {
    if (dateRange.value.startDate && dateRange.value.endDate) {
      currentPage.value = 1;
      fetchLogs();
    }
  },
  { deep: true }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchLogs();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | User Log",
});

const formulaModal = ref({
  show: false,
  content: "",
});

const downlineModal = ref({
  show: false,
  details: [],
});

const statusModal = ref({
  show: false,
  reportData: {},
  currentStatus: "",
  newStatus: "",
  remark: "",
  receiptFile: "",
});

const statusUpdateLoading = ref(false);

// Add these methods to your existing methods
const openFormulaModal = (log) => {
  formulaModal.value.content = log.formula || "No formula available";
  formulaModal.value.show = true;
};

const closeFormulaModal = () => {
  formulaModal.value.show = false;
  formulaModal.value.content = "";
};

const openDownlineModal = (log) => {
  downlineModal.value.details = log.downlinedetail || [];
  downlineModal.value.show = true;
};

const closeDownlineModal = () => {
  downlineModal.value.show = false;
  downlineModal.value.details = [];
};

const openStatusModal = (log) => {
  statusModal.value.reportData = log;
  statusModal.value.currentStatus = log.status;
  statusModal.value.newStatus = log.status;
  statusModal.value.remark = "";
  statusModal.value.receiptFile = log.receiptImg || "";
  statusModal.value.show = true;
};

const closeStatusModal = () => {
  statusModal.value.show = false;
  statusModal.value.reportData = {};
  statusModal.value.currentStatus = "";
  statusModal.value.newStatus = "";
  (statusModal.value.receiptFile = ""), (statusModal.value.remark = "");
};

const updateStatus = async (updateData) => {
  statusUpdateLoading.value = true;
  try {
    const { put } = useApiEndpoint();

    // Create FormData for both file and non-file requests
    const formData = new FormData();
    formData.append("status", updateData.newStatus);
    formData.append("remark", updateData.remark || "");

    // Add receipt file if present
    if (updateData.receiptFile) {
      formData.append("receiptImg", updateData.receiptFile);
    }

    const { data } = await put(
      `affiliatereport/${updateData.reportId}/status`,
      formData
    );

    if (data.success) {
      fetchLogs();

      closeStatusModal();
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
    console.error("Error updating status:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    statusUpdateLoading.value = false;
  }
};
</script>

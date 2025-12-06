<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("unlimited_rebate_report") }}
          </h1>
        </div>
      </div>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-md:gap-3 max-md:mb-4"
    >
      <div class="bg-white rounded-lg shadow p-6 max-md:p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600 max-md:p-2">
            <Icon
              icon="material-symbols:account-circle"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </div>
          <div class="ml-4 max-md:ml-3">
            <p class="text-sm font-medium text-gray-500 max-md:text-xs">
              {{ $t("total_users") }}
            </p>
            <p class="text-2xl font-semibold text-gray-900 max-md:text-xl">
              {{ summaryStats.totalUsers }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 max-md:p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600 max-md:p-2">
            <Icon
              icon="material-symbols:monetization-on"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </div>
          <div class="ml-4 max-md:ml-3">
            <p class="text-sm font-medium text-gray-500 max-md:text-xs">
              {{ $t("total_commission") }}
            </p>
            <p class="text-2xl font-semibold text-gray-900 max-md:text-xl">
              {{ currency }} {{ summaryStats.totalCommission.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 max-md:p-4">
        <div class="flex items-center">
          <div
            class="p-3 rounded-full bg-purple-100 text-purple-600 max-md:p-2"
          >
            <Icon
              icon="material-symbols:trending-up"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </div>
          <div class="ml-4 max-md:ml-3">
            <p class="text-sm font-medium text-gray-500 max-md:text-xs">
              {{ $t("total_turnover") }}
            </p>
            <p class="text-2xl font-semibold text-gray-900 max-md:text-xl">
              {{ currency }} {{ summaryStats.totalTurnover.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 max-md:p-4">
        <div class="flex items-center">
          <div
            class="p-3 rounded-full bg-orange-100 text-orange-600 max-md:p-2"
          >
            <Icon
              icon="mdi:gamepad-variant"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </div>
          <div class="ml-4 max-md:ml-3">
            <p class="text-sm font-medium text-gray-500 max-md:text-xs">
              {{ $t("processed_records") }}
            </p>
            <p class="text-2xl font-semibold text-gray-900 max-md:text-xl">
              {{ summaryStats.processedRecords }}
            </p>
          </div>
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
          >
            {{ $t("date") }}:
          </label>
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
    </div>

    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <div class="flex items-center gap-4 max-md:w-full">
          <LoadingButton
            :loading="isRefreshButtonLoading"
            @click="handleRefresh"
            class="bg-indigo-600 lg:hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            <div class="flex items-center gap-2">
              <Icon icon="mdi:refresh" class="max-md:w-4 max-md:h-4" />
              {{ $t("refresh") }}
            </div>
          </LoadingButton>
        </div>

        <div class="flex items-center gap-2 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_reports')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
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
              v-for="report in paginatedReports"
              :key="report._id"
              class="lg:hover:bg-gray-50 whitespace-nowrap"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.no }}
              </td>

              <td
                class="px-6 py-4 text-sm font-medium text-blue-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.username }}
              </td>

              <td
                class="px-6 py-4 text-sm font-mono max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ report.grandTotalTurnover.toFixed(2) }}
              </td>

              <td
                class="px-6 py-4 text-sm font-mono text-green-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ report.totalCommission.toFixed(2) }}
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs max-md:px-1.5 max-md:py-2 max-md:text-[10px]',
                      report.processed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800',
                    ]"
                  >
                    {{ report.processed ? $t("processed") : $t("pending") }}
                  </span>
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="text-xs text-gray-500 max-w-xs truncate">
                  {{ report.formula }}
                </div>
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <div
                  class="flex justify-center gap-2 max-md:gap-1 max-md:flex-wrap"
                >
                  <div
                    v-if="getGamesSummary(report).live > 0"
                    class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs max-md:px-1.5 max-md:py-2 max-md:text-[10px]"
                  >
                    Live: {{ getGamesSummary(report).live }}
                  </div>
                  <div
                    v-if="getGamesSummary(report).sports > 0"
                    class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs max-md:px-1.5 max-md:py-2 max-md:text-[10px]"
                  >
                    Sports: {{ getGamesSummary(report).sports }}
                  </div>
                  <div
                    v-if="getGamesSummary(report).others > 0"
                    class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs max-md:px-1.5 max-md:py-2 max-md:text-[10px]"
                  >
                    Others: {{ getGamesSummary(report).others }}
                  </div>
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(report.timeCalled) }}
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <button
                  @click="openReportDetails(report)"
                  class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 flex items-center justify-center gap-1 mx-auto max-md:px-2 max-md:py-2 max-md:text-xs"
                >
                  <Icon
                    icon="material-symbols:visibility"
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                  <span>{{ $t("view") }}</span>
                </button>
              </td>
            </tr>

            <tr
              v-if="paginatedReports.length === 0"
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
                  {{ $t("no_reports_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedReports.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />

      <ReportDetailsModal
        v-if="showReportDetails && selectedReport"
        v-model:show="showReportDetails"
        :report-data="selectedReport"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import moment from "moment-timezone";

const { get } = useApiEndpoint();
const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const currency = useCurrency();
const isPageLoading = ref(true);
const isRefreshButtonLoading = ref(false);
const allReports = ref([]);
const showReportDetails = ref(false);
const selectedReport = ref(null);
const dateFilterRef = ref(null);

const dateRange = ref({
  startDate: null,
  endDate: null,
});

const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  { key: "username", label: "Username", labelCN: "用户名", sortable: true },
  {
    key: "grandTotalTurnover",
    label: "Total Turnover",
    labelCN: "总流水",
    sortable: true,
  },
  {
    key: "totalCommission",
    label: "Commission",
    labelCN: "佣金",
    sortable: true,
  },
  { key: "processed", label: "Status", labelCN: "状态", sortable: true },
  { key: "formula", label: "Formula", labelCN: "计算公式", sortable: false },
  { key: "games", label: "Games", labelCN: "游戏", sortable: false },
  {
    key: "timeCalled",
    label: "Time Called",
    labelCN: "调用时间",
    sortable: true,
  },
  { key: "actions", label: "Actions", labelCN: "操作", sortable: false },
];

const sortConfig = ref({
  key: "timeCalled",
  direction: "desc",
});

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(20);

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
}, 300);

const handleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

const handleTypeChange = (type) => {};

const fetchReports = async () => {
  isPageLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }

    const { data } = await get(`unlimitedrebate-report?${params.toString()}`);
    if (data.success) {
      allReports.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("failed_to_load_reports"),
    });
  } finally {
    isPageLoading.value = false;
  }
};

const filteredReports = computed(() => {
  let result = [...allReports.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter((report) => {
      const usernameMatch = report.username?.toLowerCase().includes(query);
      const formulaMatch = report.formula?.toLowerCase().includes(query);
      const gamesSummary = getGamesSummary(report);
      const gameTexts = [];
      if (gamesSummary.live > 0) {
        gameTexts.push(
          "live",
          `live:${gamesSummary.live}`,
          `live: ${gamesSummary.live}`
        );
      }
      if (gamesSummary.sports > 0) {
        gameTexts.push(
          "sports",
          `sports:${gamesSummary.sports}`,
          `sports: ${gamesSummary.sports}`
        );
      }
      if (gamesSummary.others > 0) {
        gameTexts.push(
          "others",
          `others:${gamesSummary.others}`,
          `others: ${gamesSummary.others}`
        );
      }
      const gamesMatch = gameTexts.some((text) =>
        text.toLowerCase().includes(query)
      );
      return usernameMatch || formulaMatch || gamesMatch;
    });
  }
  result.sort((a, b) => {
    const aValue = a[sortConfig.value.key];
    const bValue = b[sortConfig.value.key];

    if (sortConfig.value.direction === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return result;
});

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReports.value.slice(start, end).map((report, index) => ({
    ...report,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredReports.value.length / itemsPerPage.value)
);

const summaryStats = computed(() => {
  const totalUsers = allReports.value.length;
  const totalCommission = allReports.value.reduce(
    (sum, report) => sum + report.totalCommission,
    0
  );
  const totalTurnover = allReports.value.reduce(
    (sum, report) => sum + report.grandTotalTurnover,
    0
  );
  const processedRecords = allReports.value.filter(
    (report) => report.processed
  ).length;

  return {
    totalUsers,
    totalCommission,
    totalTurnover,
    processedRecords,
  };
});

const getGamesSummary = (report) => {
  return {
    live: report.live?.games?.length || 0,
    sports: report.sports?.games?.length || 0,
    others: report.others?.games?.length || 0,
  };
};

const openReportDetails = (report) => {
  selectedReport.value = report;
  showReportDetails.value = true;
};

const handleRefresh = async () => {
  isRefreshButtonLoading.value = true;
  await fetchReports();
  isRefreshButtonLoading.value = false;
  Swal.fire({
    icon: "success",
    title: $t("refresh_successful"),
    text: $t("data_refreshed"),
    timer: 1500,
  });
};

const resetFilters = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
};

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

    if (filteredReports.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }

    const exportData = filteredReports.value.map((report, index) => ({
      ...report,
      no: index + 1,
      statusText: report.processed ? "Processed" : "Pending",
      gamesSummary: `Live: ${getGamesSummary(report).live}, Sports: ${
        getGamesSummary(report).sports
      }, Others: ${getGamesSummary(report).others}`,
    }));

    const columns = {
      no: { header: $t("no"), width: 8 },
      username: { header: $t("username"), width: 15 },
      grandTotalTurnover: { header: $t("total_turnover"), width: 15 },
      totalCommission: { header: $t("commission"), width: 15 },
      statusText: { header: $t("status"), width: 12 },
      formula: { header: $t("formula"), width: 25 },
      gamesSummary: { header: $t("games"), width: 20 },
      timeCalled: { header: $t("time_called"), width: 20 },
    };

    const filename = `unlimited_rebate_report_${moment().format("YYYY-MM-DD")}`;

    await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("unlimited_rebate_report"),
      columns,
      formatter: (value, key, item) => {
        if (key === "timeCalled" && value) {
          return formatDate(value);
        }
        if (key === "grandTotalTurnover" || key === "totalCommission") {
          return parseFloat(value).toFixed(2);
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

watch(searchQuery, () => {
  debouncedSearch();
});

watch(
  dateRange,
  () => {
    if (dateRange.value.startDate && dateRange.value.endDate) {
      currentPage.value = 1;
      fetchReports();
    }
  },
  { deep: true }
);

onMounted(async () => {
  await fetchReports();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Unlimited Rebate Report",
});
</script>

<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("bank_report_list") }}
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
        class="flex items-center justify-between max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <button
          v-if="
            adminUserData?.role === 'superadmin' ||
            adminUserData?.role === 'admin'
          "
          @click="handleExport"
          :disabled="isExporting || filteredReports.length === 0"
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
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_bank_name_owner')"
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
                  class="flex items-center gap-1 justify-center whitespace-nowrap"
                  :class="{ 'cursor-pointer': header.sortable }"
                >
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-center whitespace-nowrap">
            <tr
              v-for="report in paginatedReports"
              :key="report.id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.bankName }}<br />
                <span class="text-xs text-gray-500">{{
                  report.holderName
                }}</span>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.ownername }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span v-if="report.bankName === `USDT`">USDT</span>
                <span v-else>{{ currency }}</span>
                {{ formatAmount(report.totalDeposit) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span v-if="report.bankName === `USDT`">USDT</span>
                <span v-else>{{ currency }}</span>
                {{ formatAmount(report.totalWithdraw) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span v-if="report.bankName === `USDT`">USDT</span>
                <span v-else>{{ currency }}</span>
                {{ formatAmount(report.totalCashIn) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span v-if="report.bankName === `USDT`">USDT</span>
                <span v-else>{{ currency }}</span>
                {{ formatAmount(report.totalCashOut) }}
              </td>
            </tr>

            <!-- Total Row -->
            <!-- <tr
              v-if="paginatedReports.length > 0"
              class="bg-gray-50 font-medium"
            >
              <td class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs">{{ $t("total") }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs">-</td>
              <td class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs">-</td>
              <td class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs">
                {{ currency }} {{ formatAmount(totals.totalDeposit) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs">
                {{ currency }} {{ formatAmount(totals.totalWithdraw) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs">
                {{ currency }} {{ formatAmount(totals.totalCashIn) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs">
                {{ currency }} {{ formatAmount(totals.totalCashOut) }}
              </td>
            </tr> -->

            <!-- Empty State -->
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
        v-if="paginatedReports.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatAmount } from "~/utils/amountFormatter";
import moment from "moment-timezone";

const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const { get } = useApiEndpoint();
const currency = useCurrency();

const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号" },
  { key: "bankName", label: "Bank Name", labelCN: "银行名称" },
  {
    key: "ownerName",
    label: "Owner Name",
    labelCN: "所有者姓名",
  },
  {
    key: "totalDeposit",
    label: "Total Dep. Amount",
    labelCN: "总存款金额",
  },
  {
    key: "totalWithdraw",
    label: "Total With. Amount",
    labelCN: "总提款金额",
  },
  {
    key: "totalCashIn",
    label: "Total Cash In",
    labelCN: "总现金流入",
  },
  {
    key: "totalCashOut",
    label: "Total Cash Out",
    labelCN: "总现金流出",
  },
];

const reports = ref([]);
const totals = ref({
  totalDeposit: 0,
  totalWithdraw: 0,
  totalCashIn: 0,
  totalCashOut: 0,
});
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);
const isLoading = ref(false);

const fetchReportData = async () => {
  try {
    isLoading.value = true;
    const params = new URLSearchParams();

    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }
    const { data } = await get(`bankreport?${params.toString()}`);
    if (data.success) {
      reports.value = data.data.reports;
      totals.value = data.data.totals;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error fetching report:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load report data",
    });
  } finally {
    isLoading.value = false;
  }
};

const filteredReports = computed(() => {
  let result = [...reports.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (report) =>
        report.bankName.toLowerCase().includes(query) ||
        report.ownername.toLowerCase().includes(query)
    );
  }
  return result;
});

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReports.value.slice(start, end).map((reports, index) => ({
    ...reports,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredReports.value.length / itemsPerPage.value)
);

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
  sortConfig.value = { key: "no", direction: "asc" };
  fetchReportData();
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
    const exportData = [
      ...filteredReports.value.map((report, index) => ({
        ...report,
        no: index + 1,
      })),
    ];
    exportData.push({
      no: "",
      bankName: $t("total"),
      ownername: "",
      totalDeposit: totals.value.totalDeposit,
      totalWithdraw: totals.value.totalWithdraw,
      totalCashIn: totals.value.totalCashIn,
      totalCashOut: totals.value.totalCashOut,
    });
    let filename = "bank_report";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    }
    const result = await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("bank_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        bankName: { header: $t("bank_name"), width: 20 },
        ownername: { header: $t("owner_name"), width: 20 },
        totalDeposit: { header: $t("total_deposit_amount"), width: 20 },
        totalWithdraw: { header: $t("total_withdraw_amount"), width: 20 },
        totalCashIn: { header: $t("total_cash_in"), width: 20 },
        totalCashOut: { header: $t("total_cash_out"), width: 20 },
      },
      formatter: (value, key, item) => {
        const moneyFields = [
          "totalDeposit",
          "totalWithdraw",
          "totalCashIn",
          "totalCashOut",
        ];
        if (moneyFields.includes(key) && typeof value === "number") {
          return value.toFixed(2);
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

watch(
  [() => dateRange.value.startDate, () => dateRange.value.endDate],
  ([newStartDate, newEndDate], [oldStartDate, oldEndDate]) => {
    if (
      newStartDate &&
      newEndDate &&
      (newStartDate !== oldStartDate || newEndDate !== oldEndDate)
    ) {
      currentPage.value = 1;
      fetchReportData();
    }
  }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchReportData();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Bank Report",
});
</script>

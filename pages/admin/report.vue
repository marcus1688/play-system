<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("admin_report") }}
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

    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('account')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 text-center whitespace-nowrap">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("no") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("employee") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("last_login_ip") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("avg_deposit_time") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("avg_withdraw_time") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("approved_dep_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("rejected_dep_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("reverted_dep_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("approved_dep_amount") }}
              </th>

              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("approved_with_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("rejected_with_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("reverted_with_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("approved_with_amount") }}
              </th>

              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("approved_bonus_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("rejected_bonus_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("reverted_bonus_qty") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("approve_bonus_amount") }}
              </th>

              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("total_cash_in") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("total_cash_out") }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 text-center whitespace-nowrap">
            <tr
              v-for="report in paginatedReports"
              :key="report.username"
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
                {{ report.username }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.lastLoginIP }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.avgDepositTime || "00:00:00" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.avgWithdrawTime || "00:00:00" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.deposit.approvedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.deposit.rejectedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.deposit.revertedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{ formatAmount(report.stats.deposit.approvedAmount) }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.withdraw.approvedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.withdraw.rejectedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.withdraw.revertedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{ formatAmount(report.stats.withdraw.approvedAmount) }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.bonus.approvedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.bonus.rejectedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.stats.bonus.revertedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{ formatAmount(report.stats.bonus.approvedAmount) }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(report.stats.cash.totalCashIn) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{ formatAmount(report.stats.cash.totalCashOut) }}
              </td>
            </tr>

            <tr
              v-if="paginatedReports.length > 0"
              class="bg-gray-50 font-semibold"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ $t("total") }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                N/A
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                N/A
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                N/A
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                N/A
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.deposit.approvedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.deposit.rejectedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.deposit.revertedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.deposit.approvedAmount) }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.withdraw.approvedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.withdraw.rejectedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.withdraw.revertedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{ formatAmount(totals.withdraw.approvedAmount) }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.bonus.approvedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.bonus.rejectedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.bonus.revertedQty }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.bonus.approvedAmount) }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.cash.totalCashIn) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.cash.totalCashOut) }}
              </td>
            </tr>

            <!-- Empty State -->
            <tr
              v-if="paginatedReports.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                :colspan="19"
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
import { formatAmount } from "~/utils/amountFormatter";
import moment from "moment-timezone";
import { Icon } from "@iconify/vue";

const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const { publicGet } = useApiEndpoint();
const currency = useCurrency();

const reports = ref([]);
const totals = ref({
  deposit: {
    approvedQty: 0,
    rejectedQty: 0,
    revertedQty: 0,
    approvedAmount: 0,
  },
  withdraw: {
    approvedQty: 0,
    rejectedQty: 0,
    revertedQty: 0,
    approvedAmount: 0,
  },
  bonus: { approvedQty: 0, rejectedQty: 0, revertedQty: 0, approvedAmount: 0 },
  cash: { totalCashIn: 0, totalCashOut: 0 },
});

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(30);
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

    const { data } = await publicGet(`allAdminStats?${params.toString()}`);

    if (data.success) {
      reports.value = data.data.adminStats;
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
    result = result.filter((report) =>
      report.username.toLowerCase().includes(query)
    );
  }
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

const handleTypeChange = () => {
  searchQuery.value = "";
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchReportData();
};

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
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
        avgDepositTime: report.avgDepositTime || "00:00:00",
        avgWithdrawTime: report.avgWithdrawTime || "00:00:00",
        approvedDepQty: report.stats.deposit.approvedQty,
        rejectedDepQty: report.stats.deposit.rejectedQty,
        revertedDepQty: report.stats.deposit.revertedQty,
        approvedDepAmount: report.stats.deposit.approvedAmount,

        approvedWithQty: report.stats.withdraw.approvedQty,
        rejectedWithQty: report.stats.withdraw.rejectedQty,
        revertedWithQty: report.stats.withdraw.revertedQty,
        approvedWithAmount: report.stats.withdraw.approvedAmount,

        approvedBonusQty: report.stats.bonus.approvedQty,
        rejectedBonusQty: report.stats.bonus.rejectedQty,
        revertedBonusQty: report.stats.bonus.revertedQty,
        approvedBonusAmount: report.stats.bonus.approvedAmount,

        totalCashIn: report.stats.cash.totalCashIn,
        totalCashOut: report.stats.cash.totalCashOut,
      })),
    ];

    exportData.push({
      no: "",
      username: $t("total"),
      lastLoginIP: "",
      avgDepositTime: "",
      avgWithdrawTime: "",

      approvedDepQty: totals.value.deposit.approvedQty,
      rejectedDepQty: totals.value.deposit.rejectedQty,
      revertedDepQty: totals.value.deposit.revertedQty,
      approvedDepAmount: totals.value.deposit.approvedAmount,

      approvedWithQty: totals.value.withdraw.approvedQty,
      rejectedWithQty: totals.value.withdraw.rejectedQty,
      revertedWithQty: totals.value.withdraw.revertedQty,
      approvedWithAmount: totals.value.withdraw.approvedAmount,

      approvedBonusQty: totals.value.bonus.approvedQty,
      rejectedBonusQty: totals.value.bonus.rejectedQty,
      revertedBonusQty: totals.value.bonus.revertedQty,
      approvedBonusAmount: totals.value.bonus.approvedAmount,

      totalCashIn: totals.value.cash.totalCashIn,
      totalCashOut: totals.value.cash.totalCashOut,
    });

    let filename = "admin_report";
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
      sheetName: $t("admin_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        username: { header: $t("employee"), width: 15 },
        lastLoginIP: { header: $t("last_login_ip"), width: 15 },
        avgDepositTime: { header: $t("avg_deposit_time"), width: 15 },
        avgWithdrawTime: { header: $t("avg_withdraw_time"), width: 15 },

        approvedDepQty: { header: $t("approved_dep_qty"), width: 15 },
        rejectedDepQty: { header: $t("rejected_dep_qty"), width: 15 },
        revertedDepQty: { header: $t("reverted_dep_qty"), width: 15 },
        approvedDepAmount: { header: $t("approved_dep_amount"), width: 15 },

        approvedWithQty: { header: $t("approved_with_qty"), width: 15 },
        rejectedWithQty: { header: $t("rejected_with_qty"), width: 15 },
        revertedWithQty: { header: $t("reverted_with_qty"), width: 15 },
        approvedWithAmount: { header: $t("approved_with_amount"), width: 15 },

        approvedBonusQty: { header: $t("approved_bonus_qty"), width: 15 },
        rejectedBonusQty: { header: $t("rejected_bonus_qty"), width: 15 },
        revertedBonusQty: { header: $t("reverted_bonus_qty"), width: 15 },
        approvedBonusAmount: { header: $t("approve_bonus_amount"), width: 15 },

        totalCashIn: { header: $t("total_cash_in"), width: 15 },
        totalCashOut: { header: $t("total_cash_out"), width: 15 },
      },
      formatter: (value, key) => {
        const moneyFields = [
          "approvedDepAmount",
          "approvedWithAmount",
          "approvedBonusAmount",
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
  title: "Play System | Admin Report",
});
</script>

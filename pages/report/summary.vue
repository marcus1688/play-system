<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <NewDepositBreakdownModal
      v-model:show="showNewDepositModal"
      :data="selectedNewDepositData"
    />
    <CrossDayRevertsModal
      v-model:show="showCrossDayRevertsModal"
      :type="selectedCrossDayRevertsType"
      :data="selectedCrossDayRevertsData"
    />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("summary_report") }}
          </h1>
        </div>
      </div>
      <button
        @click="handleSendReport"
        :disabled="isSendingReport"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon
          :icon="isSendingReport ? 'eos-icons:loading' : 'mdi:send'"
          class="max-md:w-4 max-md:h-4"
        />
        {{ $t("send_report") }}
      </button>
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
          :disabled="isExporting || summaries.length === 0"
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
      <div class="overflow-x-auto rounded-lg pb-2">
        <table class="w-full text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                v-show="
                  header.key !== 'totalTransactionFees' ||
                  (summaries[0] && summaries[0].totalTransactionFees > 0)
                "
                class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
              >
                <div class="flex items-center justify-center gap-1 text-center">
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
          <tbody class="divide-y divide-gray-200 whitespace-nowrap">
            <tr
              v-for="summary in paginatedSummaries"
              :key="summary.date"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ displayDate }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.depositQty }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalDeposit) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.withdrawQty }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalWithdraw) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex items-center justify-center gap-2">
                  <span>
                    {{ currency }}
                    {{
                      formatAmount(
                        summary.crossDayReverts?.deposits?.total || 0
                      )
                    }}
                  </span>
                  <button
                    v-if="summary.crossDayReverts?.deposits?.count > 0"
                    @click="
                      openCrossDayRevertsModal(
                        'deposit',
                        summary.crossDayReverts.deposits
                      )
                    "
                    class="px-2 py-2 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500"
                  >
                    {{ $t("view") }}
                  </button>
                </div>
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex items-center justify-center gap-2">
                  <span>
                    {{ currency }}
                    {{
                      formatAmount(
                        summary.crossDayReverts?.withdraws?.total || 0
                      )
                    }}
                  </span>
                  <button
                    v-if="summary.crossDayReverts?.withdraws?.count > 0"
                    @click="
                      openCrossDayRevertsModal(
                        'withdraw',
                        summary.crossDayReverts.withdraws
                      )
                    "
                    class="px-2 py-2 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500"
                  >
                    {{ $t("view") }}
                  </button>
                </div>
              </td>
              <td
                v-show="summaries[0] && summaries[0].totalTransactionFees > 0"
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalTransactionFees) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalBonus) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalRebate) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.winLose) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.activePlayers }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.newRegistrations }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex items-center justify-center gap-2">
                  {{ summary.newDeposits }}
                  <button
                    v-if="
                      summary.newDepositBreakdown &&
                      summary.newDepositBreakdown.length > 0
                    "
                    @click="openNewDepositModal(summary.newDepositBreakdown)"
                    class="px-2 py-2 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500"
                  >
                    {{ $t("view") }}
                  </button>
                </div>
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.revertedTransactions }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.cashoutQty }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalUserCashout) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.cashinQty }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalUserCashin) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalCashIn) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(summary.totalCashOut) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.avgDepositTime }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ summary.avgWithdrawTime }}
              </td>
            </tr>
            <tr
              v-if="paginatedSummaries.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                :colspan="visibleColumnsCount"
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
      <BasePagination v-model="currentPage" :total-pages="totalPages" />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";
import moment from "moment-timezone";

const isSendingReport = ref(false);
const showNewDepositModal = ref(false);
const selectedNewDepositData = ref([]);
const { isExporting, exportToExcel } = useExportExcel();
const adminUserData = useState("adminUserData");
const isPageLoading = ref(true);
const currency = useCurrency();
const { get } = useApiEndpoint();

const openNewDepositModal = (data) => {
  selectedNewDepositData.value = data;
  showNewDepositModal.value = true;
};

const tableHeaders = [
  { key: "date", label: "Date", labelCN: "日期", sortable: false },
  {
    key: "depositQty",
    label: "Deposit QTY",
    labelCN: "存款次数",
    sortable: false,
  },
  { key: "totalDeposit", label: "Deposit", labelCN: "存款", sortable: false },
  {
    key: "withdrawQty",
    label: "Withdraw QTY",
    labelCN: "提款次数",
    sortable: false,
  },
  { key: "totalWithdraw", label: "Withdraw", labelCN: "提款", sortable: false },
  {
    key: "crossDayRevertsDeposit",
    label: "Cross Day Reverts (Deposit)",
    labelCN: "跨天撤销(存款)",
    sortable: false,
  },
  {
    key: "crossDayRevertsWithdraw",
    label: "Cross Day Reverts (Withdraw)",
    labelCN: "跨天撤销(提款)",
    sortable: false,
  },
  {
    key: "totalTransactionFees",
    label: "Transaction Fees",
    labelCN: "手续费",
    sortable: false,
  },
  { key: "totalBonus", label: "Bonus", labelCN: "奖金", sortable: false },
  { key: "totalRebate", label: "Rebate", labelCN: "返水", sortable: false },
  { key: "winLose", label: "Win/Lose", labelCN: "输赢", sortable: false },
  {
    key: "activePlayers",
    label: "Active Players",
    labelCN: "活跃玩家",
    sortable: false,
  },
  {
    key: "newRegister",
    label: "New Register",
    labelCN: "新注册",
    sortable: false,
  },
  {
    key: "newDeposits",
    label: "New Deposits",
    labelCN: "新存款",
    sortable: false,
  },
  {
    key: "revertedTransactions",
    label: "Reverted Transactions",
    labelCN: "撤销交易",
    sortable: false,
  },
  {
    key: "cashoutQty",
    label: "User Cash Out QTY",
    labelCN: "提现数量(用户)",
    sortable: false,
  },
  {
    key: "totalUserCashout",
    label: "User Cash Out",
    labelCN: "提现总额(用户)",
    sortable: false,
  },
  {
    key: "cashinQty",
    label: "User Cash In QTY",
    labelCN: "转入数量(用户)",
    sortable: false,
  },
  {
    key: "totalUserCashin",
    label: "User Cash In",
    labelCN: "转入总额(用户)",
    sortable: false,
  },
  {
    key: "totalCashIn",
    label: "Cash In",
    labelCN: "现金流入",
    sortable: false,
  },
  {
    key: "totalCashOut",
    label: "Cash Out",
    labelCN: "现金流出",
    sortable: false,
  },
  {
    key: "avgDepositTime",
    label: "Deposit Time (AVG)",
    labelCN: "存款时间(平均)",
    sortable: false,
  },
  {
    key: "avgWithdrawTime",
    label: "Withdraw Time (AVG)",
    labelCN: "提款时间(平均)",
    sortable: false,
  },
];

const summaries = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(50);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);

const fetchSummaryData = async () => {
  try {
    isPageLoading.value = true;
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }

    const { data } = await get(`summary-report?${params.toString()}`);
    if (data.success) {
      summaries.value = [data.data];
    }
  } catch (error) {
    console.error("Error fetching summary report:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load summary report",
    });
  } finally {
    isPageLoading.value = false;
  }
};

const filteredSummaries = computed(() => {
  let result = [...summaries.value];
  return result;
});

const paginatedSummaries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSummaries.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredSummaries.value.length / itemsPerPage.value)
);

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  currentPage.value = 1;
  fetchSummaryData();
};

const displayDate = computed(() => {
  if (dateRange.value.startDate && dateRange.value.endDate) {
    const start = moment(dateRange.value.startDate).format("DD/MM/YYYY");
    const end = moment(dateRange.value.endDate).format("DD/MM/YYYY");

    if (start === end) {
      return start;
    } else {
      return `${start} - ${end}`;
    }
  }
  return "-";
});

const sortConfig = ref({
  key: "no",
  direction: "asc",
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

    const exportData = [...summaries.value];
    let filename = "summary_report";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    }

    const baseColumns = {
      date: { header: $t("date"), width: 15 },
      depositQty: { header: $t("deposit_qty"), width: 12 },
      totalDeposit: { header: $t("total_deposit"), width: 15 },
      withdrawQty: { header: $t("withdraw_qty"), width: 12 },
      totalWithdraw: { header: $t("total_withdraw"), width: 15 },
      crossDayRevertsDepositTotal: {
        header: $t("cross_day_reverts_deposit"),
        width: 20,
      },
      crossDayRevertsWithdrawTotal: {
        header: $t("cross_day_reverts_withdraw"),
        width: 20,
      },
    };

    const conditionalColumns = {};
    if (summaries.value[0] && summaries.value[0].totalTransactionFees > 0) {
      conditionalColumns.totalTransactionFees = {
        header: $t("transaction_fees"),
        width: 15,
      };
    }

    const remainingColumns = {
      totalBonus: { header: $t("total_bonus"), width: 15 },
      totalRebate: { header: $t("total_rebate"), width: 15 },
      winLose: { header: $t("win_lose"), width: 15 },
      activePlayers: { header: $t("active_players"), width: 15 },
      newDeposits: { header: $t("new_deposits"), width: 15 },
      revertedTransactions: {
        header: $t("reverted_transactions"),
        width: 15,
      },
      cashoutQty: { header: $t("cashout_qty"), width: 15 },
      totalUserCashout: { header: $t("total_user_cashout"), width: 15 },
      cashinQty: { header: $t("cashin_qty"), width: 15 },
      totalUserCashin: { header: $t("total_user_cashin"), width: 15 },
      totalCashIn: { header: $t("total_cash_in"), width: 15 },
      totalCashOut: { header: $t("total_cash_out"), width: 15 },
      avgDepositTime: { header: $t("avg_deposit_time"), width: 15 },
      avgWithdrawTime: { header: $t("avg_withdraw_time"), width: 15 },
    };

    const exportColumns = {
      ...baseColumns,
      ...conditionalColumns,
      ...remainingColumns,
    };

    const result = await exportToExcel({
      data: exportData,
      filename,
      sheetName: "Summary Report",
      columns: exportColumns,
      formatter: (value, key, row) => {
        const moneyFields = [
          "totalDeposit",
          "totalWithdraw",
          "totalTransactionFees",
          "totalBonus",
          "totalRebate",
          "winLose",
          "totalUserCashout",
          "totalUserCashin",
          "totalCashIn",
          "totalCashOut",
        ];

        if (moneyFields.includes(key) && typeof value === "number") {
          return value.toFixed(2);
        }
        if (key === "date") {
          return displayDate.value;
        }
        if (key === "crossDayRevertsDepositTotal") {
          return (row.crossDayReverts?.deposits?.total || 0).toFixed(2);
        }
        if (key === "crossDayRevertsWithdrawTotal") {
          return (row.crossDayReverts?.withdraws?.total || 0).toFixed(2);
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

const visibleColumnsCount = computed(() => {
  let count = tableHeaders.length;
  if (!(summaries.value[0] && summaries.value[0].totalTransactionFees > 0)) {
    count--;
  }
  return count;
});

const showCrossDayRevertsModal = ref(false);
const selectedCrossDayRevertsType = ref("deposit");
const selectedCrossDayRevertsData = ref(null);

const openCrossDayRevertsModal = (type, data) => {
  selectedCrossDayRevertsType.value = type;
  selectedCrossDayRevertsData.value = data;
  showCrossDayRevertsModal.value = true;
};

const handleSendReport = async () => {
  try {
    isSendingReport.value = true;
    const { data } = await get("trigger-daily-balance-check");
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Report sent successfully",
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error sending report:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to send report",
    });
  } finally {
    isSendingReport.value = false;
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
      fetchSummaryData();
    }
  }
);

useHead({
  title: "Play System | Summary Report",
});
</script>

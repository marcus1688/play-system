<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("agent_pt_report") }}
        </h1>
      </div>
      <div class="flex gap-3 max-md:w-full">
        <button
          @click="markAllAsPaid"
          class="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-indigo-600 lg:hover:bg-indigo-500 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          :disabled="isMarkAllLoading"
        >
          <LoadingSpinner v-if="isMarkAllLoading" small />
          <span>{{ $t("mark_all_paid") }}</span>
        </button>
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
        class="grid grid-cols-2 gap-6 mb-6 max-sm:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
          >
            {{ $t("status") }}
          </label>
          <CustomSelect v-model="status">
            <option value="">{{ $t("all") }}</option>
            <option value="unpaid">{{ $t("unpaid") }}</option>
            <option value="paid">{{ $t("paid") }}</option>
          </CustomSelect>
        </div>
      </div>

      <div
        class="flex justify-between items-center max-md:flex-col max-md:gap-3"
      >
        <button
          v-if="
            adminUserData?.role === 'superadmin' ||
            adminUserData?.role === 'admin'
          "
          @click="handleExport"
          :disabled="isExporting || filteredReports.length === 0"
          class="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-green-600 lg:hover:bg-green-500 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
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
        <button
          @click="handleReset"
          class="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg lg:hover:bg-gray-200 flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          <Icon icon="material-symbols:refresh" class="max-md:w-4 max-md:h-4" />
          {{ $t("reset") }}
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-2 max-md:w-full">
          <BaseSearch v-model="searchQuery" />
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
              v-for="report in paginatedReports"
              :key="report._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.no }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.agentUsername }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ report.totalDeposit }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ report.totalWithdraw }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ report.totalBonus }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span
                  class="font-semibold"
                  :class="
                    parseFloat(report.netWinlose) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                >
                  {{ currency }} {{ report.netWinlose }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ report.positionTaking }}%
              </td>
              <td
                class="font-semibold px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
                :class="
                  parseFloat(report.netWinlose) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ currency }} {{ report.commission }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span :class="getStatusClass(report.status)">
                  {{ $t(report.status) }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(report.createdAt) }}
              </td>
              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <div class="flex gap-2 justify-center max-md:gap-1">
                  <button
                    @click="viewFormula(report)"
                    class="p-2 text-indigo-600 lg:hover:bg-indigo-100 rounded max-md:p-1.5"
                  >
                    <Icon icon="mdi:eye" class="max-md:w-4 max-md:h-4" />
                  </button>
                  <button
                    v-if="report.status === 'unpaid'"
                    @click="markAsPaid(report._id)"
                    class="p-2 text-green-600 lg:hover:bg-green-100 rounded max-md:p-1.5"
                  >
                    <Icon icon="mdi:check" class="max-md:w-4 max-md:h-4" />
                  </button>
                  <button
                    v-if="report.status === 'paid'"
                    @click="markAsUnpaid(report._id)"
                    class="p-2 text-yellow-600 lg:hover:bg-yellow-100 rounded max-md:p-1.5"
                  >
                    <Icon icon="mdi:undo" class="max-md:w-4 max-md:h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr
              v-if="paginatedReports.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="10"
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
            <tr class="bg-gray-100 font-bold">
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ $t("total") }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                -
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ calculateTotal("totalDeposit") }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ calculateTotal("totalWithdraw") }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ calculateTotal("totalBonus") }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span
                  :class="
                    calculateTotal('netWinlose') >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                >
                  {{ currency }} {{ calculateTotal("netWinlose") }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                -
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span
                  :class="
                    calculateTotal('commission') >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                >
                  {{ currency }} {{ calculateTotal("commission") }}
                </span>
              </td>
              <td
                colspan="3"
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3"
              ></td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedReports.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />
    </div>

    <FormulaModal v-model:show="showFormulaModal" :formula="selectedFormula" />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import moment from "moment-timezone";

const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const currency = useCurrency();
const isPageLoading = ref(true);
const isCalculateLoading = ref(false);
const isMarkAllLoading = ref(false);
const showFormulaModal = ref(false);
const selectedFormula = ref("");
const { get, post } = useApiEndpoint();

const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号", sortable: false },
  { key: "agentUsername", label: "Agent", labelCN: "代理", sortable: true },
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
    key: "totalBonus",
    label: "Total Bonus",
    labelCN: "总奖金",
    sortable: true,
  },
  {
    key: "netWinlose",
    label: "Net Win/Loss",
    labelCN: "净盈亏",
    sortable: true,
  },
  {
    key: "positionTaking",
    label: "PT (%)",
    labelCN: "持仓比例 (%)",
    sortable: true,
  },
  { key: "commission", label: "Commission", labelCN: "佣金", sortable: true },
  { key: "status", label: "Status", labelCN: "状态", sortable: true },
  { key: "createdAt", label: "Date", labelCN: "日期", sortable: true },
  { key: "actions", label: "Actions", labelCN: "操作", sortable: false },
];

const sortConfig = ref({
  key: "createdAt",
  direction: "desc",
});

const currentPage = ref(1);
const itemsPerPage = ref(10);
const reports = ref([]);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const status = ref("");
const searchQuery = ref("");
const dateFilterRef = ref(null);
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

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  status.value = "";
  searchQuery.value = "";
  currentPage.value = 1;
};

const getStatusClass = (status) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 px-2 py-1 rounded-full";
    case "unpaid":
      return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full";
    default:
      return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full";
  }
};

const viewFormula = (report) => {
  selectedFormula.value = report.formula;
  showFormulaModal.value = true;
};

const markAsPaid = async (reportId) => {
  try {
    const { data } = await post(`agent-pt-reports/${reportId}/mark-paid`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      fetchReports();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error marking report as paid:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("mark_paid_failed"),
    });
  }
};

const markAsUnpaid = async (reportId) => {
  try {
    const { data } = await post(`agent-pt-reports/${reportId}/mark-unpaid`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      fetchReports();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error marking report as unpaid:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("mark_unpaid_failed"),
    });
  }
};

const markAllAsPaid = async () => {
  try {
    const result = await Swal.fire({
      title: $t("mark_all_paid_confirmation"),
      text: $t("mark_all_paid_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("yes_mark_all_paid"),
      cancelButtonText: $t("cancel"),
    });

    if (result.isConfirmed) {
      isMarkAllLoading.value = true;
      const { data } = await post("agent-pt-reports/mark-all-paid");
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        fetchReports();
      } else {
        await Swal.fire({
          icon: "error",
          title: $t("error"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error marking all reports as paid:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("mark_all_paid_failed"),
    });
  } finally {
    isMarkAllLoading.value = false;
  }
};

const handleCalculate = async () => {
  try {
    const result = await Swal.fire({
      title: $t("calculate_confirmation"),
      text: $t("calculate_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("yes_calculate"),
      cancelButtonText: $t("cancel"),
    });

    if (result.isConfirmed) {
      isCalculateLoading.value = true;
      const { data } = await post("agent-pt/calculate");
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        fetchReports();
      } else {
        await Swal.fire({
          icon: "error",
          title: $t("error"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error calculating PT:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("calculate_failed"),
    });
  } finally {
    isCalculateLoading.value = false;
  }
};

const fetchReports = async () => {
  try {
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }
    if (status.value) {
      params.append("status", status.value);
    }
    const { data } = await get(`agent-pt-reports?${params.toString()}`);
    if (data.success) {
      reports.value = data.data;
    }
    isPageLoading.value = false;
  } catch (error) {
    console.error("Error fetching reports:", error);
    isPageLoading.value = false;
  }
};

const filteredReports = computed(() => {
  let filtered = [...reports.value].map((report) => {
    const commission = (
      (parseFloat(report.netWinlose) * parseFloat(report.positionTaking)) /
      100
    ).toFixed(2);
    return {
      ...report,
      commission,
    };
  });

  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter((item) =>
      item.agentUsername.toLowerCase().includes(searchTerm)
    );
  }
  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];

      if (sortConfig.value.key === "createdAt") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (
        [
          "totalDeposit",
          "totalWithdraw",
          "netWinlose",
          "positionTaking",
          "commission",
        ].includes(sortConfig.value.key)
      ) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
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

const calculateTotal = (field) => {
  if (filteredReports.value.length === 0) return "0.00";

  const total = filteredReports.value.reduce((sum, report) => {
    return sum + parseFloat(report[field] || 0);
  }, 0);

  return total.toFixed(2);
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
      no: index + 1,
      agentUsername: report.agentUsername,
      totalDeposit: report.totalDeposit,
      totalWithdraw: report.totalWithdraw,
      totalBonus: report.totalBonus,
      netWinlose: report.netWinlose,
      positionTaking: report.positionTaking,
      commission: report.commission,
      status: $t(report.status),
      date: formatDate(report.createdAt),
    }));
    exportData.push({
      no: "",
      agentUsername: $t("total"),
      totalDeposit: calculateTotal("totalDeposit"),
      totalWithdraw: calculateTotal("totalWithdraw"),
      totalBonus: calculateTotal("totalBonus"),
      netWinlose: calculateTotal("netWinlose"),
      positionTaking: "",
      commission: calculateTotal("commission"),
      status: "",
      date: "",
    });
    let filename = "agent_pt_report";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    }
    if (status.value) {
      filename += `_${status.value}`;
    }
    const result = await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("agent_pt_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        agentUsername: { header: $t("agent"), width: 15 },
        totalDeposit: { header: $t("total_deposit"), width: 15 },
        totalWithdraw: { header: $t("total_withdraw"), width: 15 },
        totalBonus: { header: $t("total_bonus"), width: 15 },
        netWinlose: { header: $t("net_win_loss"), width: 15 },
        positionTaking: { header: $t("position_taking"), width: 12 },
        commission: { header: $t("commission_amount"), width: 15 },
        status: { header: $t("status"), width: 12 },
        date: { header: $t("date"), width: 15 },
      },
      formatter: (value, key, item) => {
        const moneyFields = [
          "totalDeposit",
          "totalWithdraw",
          "totalBonus",
          "netWinlose",
          "commission",
        ];

        if (moneyFields.includes(key) && typeof value === "string") {
          return parseFloat(value).toFixed(2);
        }

        if (key === "positionTaking" && value !== "") {
          return `${value}%`;
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
  [dateRange, status],
  () => {
    if (
      (dateRange.value.startDate && dateRange.value.endDate) ||
      status.value
    ) {
      currentPage.value = 1;
      fetchReports();
    }
  },
  { deep: true }
);

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(() => {
  fetchReports();
});

useHead({
  title: "Money System | Agent PT Report",
});
</script>

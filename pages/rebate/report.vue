<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <BonusClaimModal
      v-model:show="showClaimModal"
      :bonus-data="selectedBonus"
      :bonus-amount="selectedBonus?.totalRebate || 0"
      :title="$t('rebate')"
      claim-api="claim-rebate"
      claim-id-field="rebateLogId"
      @success="handleClaimSuccess"
    />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("rebate_report_list") }}
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

      <div
        class="flex justify-between max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <button
          v-if="
            adminUserData?.role === 'superadmin' ||
            adminUserData?.role === 'admin'
          "
          @click="handleExport"
          :disabled="isExporting || filteredRebateLogs.length === 0"
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
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="header.sortable ? handleSort(header.key) : null"
              >
                <div class="flex items-center justify-center gap-1">
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                  <Icon
                    v-if="header.sortable"
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
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(log, index) in paginatedRebateLogs"
              :key="index"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.userid || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.username }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totaldeposit) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totalwithdraw) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totalbonus) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totalwinlose) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.formula }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.totalRebate) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.claimedAt ? formatDate(log.claimedAt) : "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 uppercase max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.claimedBy || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3"
              >
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="!log.claimed"
                    @click="openClaimModal(log)"
                    class="px-3 py-1.5 text-sm bg-indigo-600 text-white lg:hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm lg:hover:shadow-md max-md:px-2 max-md:py-1 max-md:text-xs"
                  >
                    {{ $t("claim") }}
                  </button>
                  <span
                    v-else
                    class="px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed max-md:px-2 max-md:py-1 max-md:text-xs"
                  >
                    {{ $t("claimed") }}
                  </span>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedRebateLogs.length === 0"
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
        v-if="paginatedRebateLogs.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";
import { Icon } from "@iconify/vue";
import moment from "moment-timezone";

const showClaimModal = ref(false);
const selectedBonus = ref(null);
const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const { get } = useApiEndpoint();
const currency = useCurrency();

const sortConfig = ref({
  key: null,
  direction: "asc",
});

const handleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号", sortable: false },
  { key: "userid", label: "User ID", labelCN: "用户ID", sortable: true },
  { key: "username", label: "Username", labelCN: "用户名", sortable: true },
  {
    key: "totaldeposit",
    label: "Total Deposit",
    labelCN: "总存款",
    sortable: true,
  },
  {
    key: "totalwithdraw",
    label: "Total Withdraw",
    labelCN: "总提款",
    sortable: true,
  },
  {
    key: "totalbonus",
    label: "Total Bonus",
    labelCN: "总奖金",
    sortable: true,
  },
  {
    key: "totalwinlose",
    label: "Total Win/Lose",
    labelCN: "总输赢",
    sortable: true,
  },
  { key: "formula", label: "Formula", labelCN: "公式", sortable: false },
  {
    key: "totalRebate",
    label: "Total Rebate",
    labelCN: "总返水",
    sortable: true,
  },
  {
    key: "claimedAt",
    label: "Issue Date",
    labelCN: "发放日期",
    sortable: true,
  },
  { key: "claimedBy", label: "Process By", labelCN: "处理人", sortable: true },
  { key: "claimed", label: "Action", labelCN: "操作", sortable: true },
];

const rebateLogs = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);

const fetchRebateReport = async () => {
  try {
    isPageLoading.value = true;
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }

    const { data } = await get(`rebate-report?${params.toString()}`);
    if (data.success) {
      rebateLogs.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching rebate report:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load rebate report",
    });
  } finally {
    isPageLoading.value = false;
  }
};

const filteredRebateLogs = computed(() => {
  let result = [...rebateLogs.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (log) =>
        log.username.toLowerCase().includes(query) ||
        (log.userid && log.userid.toLowerCase().includes(query))
    );
  }
  if (sortConfig.value.key) {
    result.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      const numericFields = [
        "totaldeposit",
        "totalwithdraw",
        "totalbonus",
        "totalwinlose",
        "totalRebate",
      ];
      if (numericFields.includes(sortConfig.value.key)) {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      }
      if (sortConfig.value.key === "claimedAt") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      if (sortConfig.value.key === "claimed") {
        aVal = a.claimed ? 1 : 0;
        bVal = b.claimed ? 1 : 0;
      }
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });
  }

  return result;
});

const paginatedRebateLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRebateLogs.value.slice(start, end).map((rebate, index) => ({
    ...rebate,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredRebateLogs.value.length / itemsPerPage.value)
);

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
  fetchRebateReport();
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
    if (filteredRebateLogs.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = filteredRebateLogs.value.map((log, index) => ({
      no: index + 1,
      userid: log.userid || "-",
      username: log.username,
      totaldeposit: log.totaldeposit,
      totalwithdraw: log.totalwithdraw,
      totalbonus: log.totalbonus,
      totalwinlose: log.totalwinlose,
      formula: log.formula,
      totalRebate: log.totalRebate,
      claimedAt: log.claimedAt ? formatDate(log.claimedAt) : "-",
      claimedBy: log.claimedBy || "-",
      claimed: log.claimed ? "Claimed" : "Pending",
    }));

    const columns = {
      no: { header: $t("no"), width: 8 },
      userid: { header: "User ID", width: 12 },
      username: { header: $t("username"), width: 15 },
      totaldeposit: { header: $t("total_deposit"), width: 15 },
      totalwithdraw: { header: $t("total_withdraw"), width: 15 },
      totalbonus: { header: $t("total_bonus"), width: 15 },
      totalwinlose: { header: $t("total_win_lose"), width: 15 },
      formula: { header: $t("formula"), width: 20 },
      totalRebate: { header: $t("total_rebate"), width: 15 },
      claimedAt: { header: $t("issue_date"), width: 15 },
      claimedBy: { header: $t("process_by"), width: 15 },
      claimed: { header: $t("status"), width: 12 },
    };

    let filename = `rebate_report`;
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    }

    await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("rebate_report"),
      columns,
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

const openClaimModal = (record) => {
  selectedBonus.value = record;
  showClaimModal.value = true;
};

const handleClaimSuccess = () => {
  fetchRebateReport();
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
      fetchRebateReport();
    }
  }
);

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(async () => {
  const now = moment().tz("Asia/Kuala_Lumpur");
  const yesterday = now.clone().subtract(1, "day");
  dateRange.value.startDate = yesterday.startOf("day").toDate();
  dateRange.value.endDate = yesterday.endOf("day").toDate();
});

useHead({
  title: "Play System | Rebate Report",
});
</script>

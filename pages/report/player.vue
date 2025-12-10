<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("player_report") }}
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
          :disabled="isExporting || filteredPlayers.length === 0"
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
            :placeholder="$t('search_username')"
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
          <tbody class="divide-y divide-gray-200 text-center whitespace-nowrap">
            <tr
              v-for="player in paginatedPlayers"
              :key="player.username"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ player.no }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ player.userid || "-" }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ player.username }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ player.depositQty }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(player.totalDeposit) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ player.uniqueDepositDays }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ player.withdrawQty }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(player.totalWithdraw) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(player.winLose) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(player.totalTurnover) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(player.totalBonus) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(player.totalRebate) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(player.totalCashout) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(player.totalCashin) }}
              </td>
            </tr>
            <tr
              v-if="paginatedPlayers.length === 0"
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
            <!-- Totals Row -->
            <tr
              v-if="paginatedPlayers.length > 0"
              class="bg-gray-50 font-medium"
            >
              <td
                class="px-4 py-4 text-sm text-gray-700 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ $t("total") }}:
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
                {{ totals.depositQty }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.totalDeposit) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                -
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ totals.withdrawQty }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.totalWithdraw) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.winLose) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.totalTurnover) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.totalBonus) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.totalRebate) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.totalCashout) }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totals.totalCashin) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        v-if="paginatedPlayers.length > 0"
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
const currency = useCurrency();
const { get } = useApiEndpoint();
const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号" },
  { key: "userid", label: "User ID", labelCN: "用户ID", sortable: true },
  { key: "username", label: "Username", labelCN: "用户名", sortable: false },
  {
    key: "depositQty",
    label: "Deposit QTY",
    labelCN: "存款次数",
    sortable: true,
  },
  { key: "totalDeposit", label: "Deposit", labelCN: "存款", sortable: true },
  {
    key: "uniqueDepositDays",
    label: "Unique Deposit Days",
    labelCN: "存款天数",
    sortable: true,
  },
  {
    key: "withdrawQty",
    label: "Withdraw QTY",
    labelCN: "提款次数",
    sortable: true,
  },
  { key: "totalWithdraw", label: "Withdraw", labelCN: "提款", sortable: true },
  { key: "winLose", label: "Win/Lose", labelCN: "输赢", sortable: true },
  { key: "totalTurnover", label: "Turnover", labelCN: "流水", sortable: true },
  { key: "totalBonus", label: "Bonus", labelCN: "奖金", sortable: true },
  { key: "totalRebate", label: "Rebate", labelCN: "返水", sortable: true },
  { key: "totalCashout", label: "Cash Out", labelCN: "提现", sortable: true },
  { key: "totalCashin", label: "Cash In", labelCN: "转入", sortable: true },
];

const players = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortConfig = ref({
  key: "winLose",
  direction: "desc",
});
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);

const getSortIcon = (key) => {
  if (key !== sortConfig.value.key) return "material-symbols:unfold-more";
  return sortConfig.value.direction === "asc"
    ? "material-symbols:arrow-upward"
    : "material-symbols:arrow-downward";
};

const handleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

const fetchPlayerData = async () => {
  try {
    isPageLoading.value = true;
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }

    const { data } = await get(`player-report?${params.toString()}`);

    if (data.success) {
      players.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching player data:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load player data",
    });
  } finally {
    isPageLoading.value = false;
  }
};

const filteredPlayers = computed(() => {
  let result = [...players.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (player) =>
        player.username.toLowerCase().includes(query) ||
        (player.userid && String(player.userid).toLowerCase().includes(query))
    );
  }

  if (sortConfig.value.key) {
    result.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (typeof aVal === "string" && !isNaN(aVal)) aVal = parseFloat(aVal);
      if (typeof bVal === "string" && !isNaN(bVal)) bVal = parseFloat(bVal);
      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal === bVal) return 0;
      if (aVal == null && bVal != null) return direction;
      if (aVal != null && bVal == null) return -direction;
      return aVal > bVal ? direction : -direction;
    });
  }

  return result;
});

const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPlayers.value.slice(start, end).map((player, index) => ({
    ...player,
    no: start + index + 1,
  }));
});

const totals = computed(() => {
  return filteredPlayers.value.reduce(
    (acc, player) => ({
      depositQty: acc.depositQty + player.depositQty,
      totalDeposit: acc.totalDeposit + player.totalDeposit,
      withdrawQty: acc.withdrawQty + player.withdrawQty,
      totalWithdraw: acc.totalWithdraw + player.totalWithdraw,
      totalTurnover: acc.totalTurnover + player.totalTurnover,
      totalBonus: acc.totalBonus + player.totalBonus,
      totalRebate: acc.totalRebate + player.totalRebate,
      totalCashout: acc.totalCashout + player.totalCashout,
      totalCashin: acc.totalCashin + (player.totalCashin || 0),
      winLose: acc.winLose + player.winLose,
    }),
    {
      depositQty: 0,
      totalDeposit: 0,
      withdrawQty: 0,
      totalWithdraw: 0,
      totalTurnover: 0,
      totalBonus: 0,
      totalRebate: 0,
      totalCashout: 0,
      totalCashin: 0,
      winLose: 0,
    }
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredPlayers.value.length / itemsPerPage.value)
);

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
  fetchPlayerData();
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
    const exportData = [...filteredPlayers.value];
    const totalRow = {
      userid: "-",
      username: $t("total"),
      depositQty: totals.value.depositQty,
      totalDeposit: totals.value.totalDeposit,
      uniqueDepositDays: totals.value.uniqueDepositDays,
      withdrawQty: totals.value.withdrawQty,
      totalWithdraw: totals.value.totalWithdraw,
      winLose: totals.value.winLose,
      totalTurnover: totals.value.totalTurnover,
      totalBonus: totals.value.totalBonus,
      totalRebate: totals.value.totalRebate,
      totalCashout: totals.value.totalCashout,
      totalCashin: totals.value.totalCashin,
    };
    exportData.push(totalRow);
    let filename = "player_report";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    } else {
      filename += `_${moment().format("YYYY-MM-DD")}`;
    }
    const result = await exportToExcel({
      data: exportData,
      filename,
      sheetName: "Player Report",
      columns: {
        userid: { header: "User ID", width: 12 },
        username: { header: $t("username"), width: 15 },
        depositQty: { header: $t("deposit_qty"), width: 12 },
        totalDeposit: { header: $t("total_deposit"), width: 12 },
        uniqueDepositDays: { header: $t("unique_deposit_days"), width: 15 },
        withdrawQty: { header: $t("withdraw_qty"), width: 12 },
        totalWithdraw: { header: $t("total_withdraw"), width: 12 },
        winLose: { header: $t("win_lose"), width: 12 },
        totalTurnover: { header: $t("total_turnover"), width: 12 },
        totalBonus: { header: $t("total_bonus"), width: 12 },
        totalRebate: { header: $t("total_rebate"), width: 12 },
        totalCashout: { header: $t("total_cashout"), width: 12 },
        totalCashin: { header: $t("total_cashin"), width: 12 },
      },
      formatter: (value, key) => {
        const moneyFields = [
          "totalDeposit",
          "totalWithdraw",
          "winLose",
          "totalTurnover",
          "totalBonus",
          "totalRebate",
          "totalCashout",
          "totalCashin",
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
      fetchPlayerData();
    }
  }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

useHead({
  title: "Play System | Player Report",
});
</script>

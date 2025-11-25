<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <FormulaModal v-model:show="showFormulaModal" :formula="selectedFormula" />

    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("agent_report_list") }}
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
        class="flex items-center justify-between max-md:flex-col max-md:gap-3"
      >
        <button
          v-if="
            adminUserData?.role === 'superadmin' ||
            adminUserData?.role === 'admin'
          "
          @click="handleExport"
          :disabled="isExporting || filteredAgentLogs.length === 0"
          class="px-6 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 flex items-center gap-2 justify-center max-md:px-4 max-md:py-2 max-md:text-sm max-md:w-full"
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
          placeholder="Search username"
          @type-change="handleTypeChange"
        />
      </div>

      <div>
        <!-- <div v-if="checkTemplate(1)" class="overflow-x-auto">
          <table class="w-full text-center whitespace-nowrap">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="header in winloseHeaders"
                  :key="header.key"
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(log, index) in paginatedAgentLogs"
                :key="index"
                class="lg:hover:bg-gray-50"
              >
                <template v-if="currentType === 'winlose'">
                  <td class="px-6 py-4 text-sm text-gray-600">{{ log.no }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ log.agentUsername }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }} {{ formatAmount(log.totalDeposit) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }} {{ formatAmount(log.totalWithdraw) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }} {{ formatAmount(log.totalBonus) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }} {{ formatAmount(log.totalWinLoss) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    <button
                      @click.prevent="openFormulaModal(log.formula)"
                      class="px-3 py-1.5 text-sm bg-indigo-600 text-white lg:hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm lg:hover:shadow-md"
                    >
                      {{ $t("view") }}
                    </button>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }} {{ formatAmount(log.commissionAmount) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ formatDate(log.createdAt) }}
                  </td>
                </template>

                <template v-else>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ log.no }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ log.agentUsername }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ log.downlineUsername }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Live Casino"] || 0) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Sports"] || 0) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Slot Games"] || 0) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Others"] || 0) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 font-bold">
                    {{ currency }}
                    {{ formatAmount(log.totalTurnover) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    <div class="flex items-center justify-center">
                      <button
                        @click="openFormulaModal(log.formula)"
                        class="px-3 py-1.5 text-sm bg-indigo-600 text-white lg:hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm lg:hover:shadow-md"
                      >
                        {{ $t("view") }}
                      </button>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ currency }} {{ formatAmount(log.commissionAmount) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ formatDate(log.createdAt) }}
                  </td>
                </template>
              </tr>
              <tr v-if="paginatedAgentLogs.length === 0">
                <td
                  :colspan="tableHeaders.length"
                  class="px-6 py-4 text-center text-gray-500"
                >
                  <div class="flex flex-col gap-8 items-center">
                    <img
                      src="/images/empty2.png"
                      alt="Empty State"
                      class="w-32 h-auto opacity-80"
                    />
                    {{ $t("no_records_found") }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div> -->
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
                v-for="(log, index) in paginatedAgentLogs"
                :key="index"
                class="lg:hover:bg-gray-50"
              >
                <template v-if="currentType === 'winlose'">
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ log.no }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ log.agentUsername }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(log.totalDeposit) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(log.totalWithdraw) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(log.totalBonus) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(log.totalWinLoss) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3"
                  >
                    <button
                      @click.prevent="openFormulaModal(log.formula)"
                      class="px-3 py-1.5 text-sm bg-indigo-600 text-white lg:hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm lg:hover:shadow-md max-md:px-2 max-md:py-1 max-md:text-xs"
                    >
                      {{ $t("view") }}
                    </button>
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(log.commissionAmount) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatDate(log.claimedAt) }}
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
                        @click="claimCommission(log.agentUsername, log._id)"
                        :disabled="isClaimingCommission[log._id]"
                        class="px-3 py-1.5 text-sm bg-indigo-600 text-white lg:hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm lg:hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed max-md:px-2 max-md:py-1 max-md:text-xs"
                      >
                        <Icon
                          v-if="isClaimingCommission[log._id]"
                          icon="eos-icons:loading"
                          class="w-4 h-4 max-md:w-3 max-md:h-3"
                        />
                        <span v-else>{{ $t("claim") }}</span>
                      </button>
                      <span
                        v-else
                        class="px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed max-md:px-2 max-md:py-1 max-md:text-xs"
                      >
                        {{ $t("claimed") }}
                      </span>
                    </div>
                  </td>
                </template>

                <template v-else>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ log.no }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ log.agentUsername }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ log.downlineUsername }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Live Casino"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Sports"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Slot Games"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Fishing"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Poker"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Mah Jong"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["E-Sports"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Horse"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.categoryTurnover["Lottery"] || 0) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 font-bold max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }}
                    {{ formatAmount(log.totalTurnover) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3"
                  >
                    <div class="flex items-center justify-center">
                      <button
                        @click="openFormulaModal(log.formula)"
                        class="px-3 py-1.5 text-sm bg-indigo-600 text-white lg:hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm lg:hover:shadow-md max-md:px-2 max-md:py-1 max-md:text-xs"
                      >
                        {{ $t("view") }}
                      </button>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(log.commissionAmount) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatDate(log.createdAt) }}
                  </td>
                </template>
              </tr>
              <tr v-if="paginatedAgentLogs.length === 0">
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
      </div>

      <BasePagination
        v-if="paginatedAgentLogs.length > 0"
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

const isClaimingCommission = ref({});
const { post } = useApiEndpoint();
const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const { checkTemplate } = useCompany();
const showFormulaModal = ref(false);
const selectedFormula = ref("");
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

const winloseHeaders = [
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  {
    key: "agentUsername",
    label: "Username",
    labelCN: "用户名",
    sortable: true,
  },
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
    key: "totalWinLoss",
    label: "Total Win/Lose",
    labelCN: "总输赢",
    sortable: true,
  },
  { key: "formula", label: "Formula", labelCN: "公式", sortable: false },
  {
    key: "commissionAmount",
    label: "Commission",
    labelCN: "佣金",
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

const turnoverHeaders = [
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  {
    key: "agentUsername",
    label: "Agent Username",
    labelCN: "代理用户名",
    sortable: true,
  },
  {
    key: "downlineUsername",
    label: "Downline Username",
    labelCN: "下线用户名",
    sortable: true,
  },
  {
    key: "liveCasino",
    label: "Live Casino",
    labelCN: "真人娱乐场",
    sortable: true,
  },
  { key: "sports", label: "Sports", labelCN: "体育", sortable: true },
  {
    key: "slotGames",
    label: "Slot Games",
    labelCN: "老虎机游戏",
    sortable: true,
  },
  { key: "fishing", label: "Fishing", labelCN: "捕鱼", sortable: true },
  { key: "poker", label: "Poker", labelCN: "扑克", sortable: true },
  { key: "mahjong", label: "Mahjong", labelCN: "麻将", sortable: true },
  { key: "eSports", label: "E-Sports", labelCN: "电子竞技", sortable: true },
  { key: "horse", label: "Horse", labelCN: "赛马", sortable: true },
  { key: "lottery", label: "Lottery", labelCN: "彩票", sortable: true },
  {
    key: "totalTurnover",
    label: "Total Turnover",
    labelCN: "总流水",
    sortable: true,
  },
  { key: "formula", label: "Formula", labelCN: "公式", sortable: false },
  {
    key: "commissionAmount",
    label: "Total Commission",
    labelCN: "总佣金",
    sortable: true,
  },
  {
    key: "createdAt",
    label: "Issue Date",
    labelCN: "发放日期",
    sortable: true,
  },
];

const currentType = ref("turnover");
const tableHeaders = computed(() =>
  currentType.value === "turnover" ? turnoverHeaders : winloseHeaders
);

const agentLogs = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);

const fetchAgentReport = async () => {
  try {
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }

    const { data } = await get(`commission-report?${params.toString()}`);
    if (data.success) {
      agentLogs.value = data.data;
      currentType.value = data?.data?.[0]?.calculationType;
    }
  } catch (error) {
    console.error("Error fetching rebate report:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load rebate report",
    });
  }
};

const filteredAgentLogs = computed(() => {
  let result = [...agentLogs.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((log) => {
      const agentUsername = (log.agentUsername || "").toString().toLowerCase();
      const downlineUsername = (log.downlineUsername || "")
        .toString()
        .toLowerCase();
      return agentUsername.includes(query) || downlineUsername.includes(query);
    });
  }
  if (sortConfig.value.key) {
    result.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      const numericFields = [
        "totalDeposit",
        "totalWithdraw",
        "totalBonus",
        "totalWinLoss",
        "commissionAmount",
        "totalTurnover",
      ];
      if (numericFields.includes(sortConfig.value.key)) {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      }
      if (
        sortConfig.value.key === "createdAt" ||
        sortConfig.value.key === "claimedAt"
      ) {
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

const paginatedAgentLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAgentLogs.value.slice(start, end).map((rebate, index) => ({
    ...rebate,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredAgentLogs.value.length / itemsPerPage.value)
);

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchAgentReport();
};

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
  fetchAgentReport();
};

const openFormulaModal = (formula) => {
  selectedFormula.value = formula;
  showFormulaModal.value = true;
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
    if (filteredAgentLogs.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    let exportData = [];
    let columns = {};
    let sheetName = "";
    if (currentType.value === "winlose") {
      exportData = filteredAgentLogs.value.map((log, index) => ({
        no: index + 1,
        username: log.agentUsername,
        totalDeposit: log.totalDeposit,
        totalWithdraw: log.totalWithdraw,
        totalBonus: log.totalBonus,
        totalWinLoss: log.totalWinLoss,
        formula: log.formula,
        commission: log.commissionAmount,
        issueDate: formatDate(log.createdAt),
      }));
      columns = {
        no: { header: $t("no"), width: 8 },
        username: { header: $t("username"), width: 20 },
        totalDeposit: { header: $t("total_deposit"), width: 15 },
        totalWithdraw: { header: $t("total_withdraw"), width: 15 },
        totalBonus: { header: $t("total_bonus"), width: 15 },
        totalWinLoss: { header: $t("total_win_lose"), width: 15 },
        formula: { header: $t("formula"), width: 30 },
        commission: { header: $t("commission_amount"), width: 15 },
        issueDate: { header: $t("issue_date"), width: 15 },
      };
      sheetName = "Agent Winlose Report";
    } else {
      if (checkTemplate(1)) {
        exportData = filteredAgentLogs.value.map((log, index) => ({
          no: index + 1,
          agentUsername: log.agentUsername,
          downlineUsername: log.downlineUsername,
          liveCasino: log.categoryTurnover["Live Casino"] || 0,
          sports: log.categoryTurnover["Sports"] || 0,
          slotGames: log.categoryTurnover["Slot Games"] || 0,
          others: log.categoryTurnover["Others"] || 0,
          totalTurnover: log.totalTurnover,
          formula: log.formula,
          commission: log.commissionAmount,
          issueDate: formatDate(log.createdAt),
        }));
        columns = {
          no: { header: $t("no"), width: 8 },
          agentUsername: { header: $t("agent_username"), width: 20 },
          downlineUsername: { header: $t("downline_username"), width: 20 },
          liveCasino: { header: $t("live_casino"), width: 15 },
          sports: { header: $t("sports"), width: 15 },
          slotGames: { header: $t("slot_games"), width: 15 },
          others: { header: $t("others"), width: 15 },
          totalTurnover: { header: $t("total_turnover"), width: 15 },
          formula: { header: $t("formula"), width: 30 },
          commission: { header: $t("commission_amount"), width: 15 },
          issueDate: { header: $t("issue_date"), width: 15 },
        };
      } else {
        exportData = filteredAgentLogs.value.map((log, index) => ({
          no: index + 1,
          agentUsername: log.agentUsername,
          downlineUsername: log.downlineUsername,
          liveCasino: log.categoryTurnover["Live Casino"] || 0,
          sports: log.categoryTurnover["Sports"] || 0,
          slotGames: log.categoryTurnover["Slot Games"] || 0,
          fishing: log.categoryTurnover["Fishing"] || 0,
          poker: log.categoryTurnover["Poker"] || 0,
          mahjong: log.categoryTurnover["Mah Jong"] || 0,
          eSports: log.categoryTurnover["E-Sports"] || 0,
          horse: log.categoryTurnover["Horse"] || 0,
          lottery: log.categoryTurnover["Lottery"] || 0,
          totalTurnover: log.totalTurnover,
          formula: log.formula,
          commission: log.commissionAmount,
          issueDate: formatDate(log.createdAt),
        }));
        columns = {
          no: { header: $t("no"), width: 8 },
          agentUsername: { header: $t("agent_username"), width: 20 },
          downlineUsername: { header: $t("downline_username"), width: 20 },
          liveCasino: { header: $t("live_casino"), width: 15 },
          sports: { header: $t("sports"), width: 15 },
          slotGames: { header: $t("slot_games"), width: 15 },
          fishing: { header: $t("fishing"), width: 15 },
          poker: { header: $t("poker"), width: 15 },
          mahjong: { header: $t("mahjong"), width: 15 },
          eSports: { header: $t("e_sports"), width: 15 },
          horse: { header: $t("horse"), width: 15 },
          lottery: { header: $t("lottery"), width: 15 },
          totalTurnover: { header: $t("total_turnover"), width: 15 },
          formula: { header: $t("formula"), width: 30 },
          commission: { header: $t("commission_amount"), width: 15 },
          issueDate: { header: $t("issue_date"), width: 15 },
        };
      }
      sheetName = "Agent Turnover Report";
    }
    const totals = exportData.reduce(
      (acc, log) => {
        acc.commission += parseFloat(log.commission || 0);
        if (currentType.value === "winlose") {
          acc.totalDeposit += parseFloat(log.totalDeposit || 0);
          acc.totalWithdraw += parseFloat(log.totalWithdraw || 0);
          acc.totalBonus += parseFloat(log.totalBonus || 0);
          acc.totalWinLoss += parseFloat(log.totalWinLoss || 0);
        } else {
          acc.totalTurnover += parseFloat(log.totalTurnover || 0);
          acc.liveCasino += parseFloat(log.liveCasino || 0);
          acc.sports += parseFloat(log.sports || 0);
          acc.slotGames += parseFloat(log.slotGames || 0);
          if (checkTemplate(1)) {
            acc.others += parseFloat(log.others || 0);
          } else {
            acc.fishing += parseFloat(log.fishing || 0);
            acc.poker += parseFloat(log.poker || 0);
            acc.mahjong += parseFloat(log.mahjong || 0);
            acc.eSports += parseFloat(log.eSports || 0);
            acc.horse += parseFloat(log.horse || 0);
            acc.lottery += parseFloat(log.lottery || 0);
          }
        }
        return acc;
      },
      currentType.value === "winlose"
        ? {
            totalDeposit: 0,
            totalWithdraw: 0,
            totalBonus: 0,
            totalWinLoss: 0,
            commission: 0,
          }
        : checkTemplate(1)
        ? {
            liveCasino: 0,
            sports: 0,
            slotGames: 0,
            others: 0,
            totalTurnover: 0,
            commission: 0,
          }
        : {
            liveCasino: 0,
            sports: 0,
            slotGames: 0,
            fishing: 0,
            poker: 0,
            mahjong: 0,
            eSports: 0,
            horse: 0,
            lottery: 0,
            totalTurnover: 0,
            commission: 0,
          }
    );
    if (currentType.value === "winlose") {
      exportData.push({
        no: "",
        username: $t("total"),
        totalDeposit: totals.totalDeposit.toFixed(2),
        totalWithdraw: totals.totalWithdraw.toFixed(2),
        totalBonus: totals.totalBonus.toFixed(2),
        totalWinLoss: totals.totalWinLoss.toFixed(2),
        formula: "",
        commission: totals.commission.toFixed(2),
        issueDate: "",
      });
    } else if (checkTemplate(1)) {
      exportData.push({
        no: "",
        agentUsername: $t("total"),
        downlineUsername: "",
        liveCasino: totals.liveCasino.toFixed(2),
        sports: totals.sports.toFixed(2),
        slotGames: totals.slotGames.toFixed(2),
        others: totals.others.toFixed(2),
        totalTurnover: totals.totalTurnover.toFixed(2),
        formula: "",
        commission: totals.commission.toFixed(2),
        issueDate: "",
      });
    } else {
      exportData.push({
        no: "",
        agentUsername: $t("total"),
        downlineUsername: "",
        liveCasino: totals.liveCasino.toFixed(2),
        sports: totals.sports.toFixed(2),
        slotGames: totals.slotGames.toFixed(2),
        fishing: totals.fishing.toFixed(2),
        poker: totals.poker.toFixed(2),
        mahjong: totals.mahjong.toFixed(2),
        eSports: totals.eSports.toFixed(2),
        horse: totals.horse.toFixed(2),
        lottery: totals.lottery.toFixed(2),
        totalTurnover: totals.totalTurnover.toFixed(2),
        formula: "",
        commission: totals.commission.toFixed(2),
        issueDate: "",
      });
    }
    let filename = `agent_${currentType.value}_report`;
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
      sheetName,
      columns,
      formatter: (value, key) => {
        const moneyFields = [
          "totalDeposit",
          "totalWithdraw",
          "totalBonus",
          "totalWinLoss",
          "liveCasino",
          "sports",
          "slotGames",
          "fishing",
          "poker",
          "mahjong",
          "eSports",
          "horse",
          "lottery",
          "others",
          "totalTurnover",
          "commission",
        ];
        if (moneyFields.includes(key) && value !== "") {
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

const claimCommission = async (agentUsername, commissionReportId) => {
  try {
    isClaimingCommission.value[commissionReportId] = true;
    const result = await Swal.fire({
      title: $t("confirm_claim"),
      text: $t("claim_commission_confirmation", { agentUsername }),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });
    if (!result.isConfirmed) return;
    const { data } = await post("claim-commission", {
      agentUsername,
      commissionReportId,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchAgentReport();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error claiming commission:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("claim_failed"),
    });
  } finally {
    isClaimingCommission.value[commissionReportId] = false;
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
      fetchAgentReport();
    }
  }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchAgentReport();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Agent Report",
});
</script>

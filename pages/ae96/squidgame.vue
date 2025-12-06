<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("squid_game") }}
        </h1>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="border-b overflow-x-auto">
        <div class="flex max-md:min-w-max">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="px-6 py-3 text-md font-medium border-b-2 -mb-px whitespace-nowrap max-md:px-4 max-md:py-2 max-md:text-sm"
            :class="[
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 lg:hover:text-gray-700 lg:hover:border-gray-300',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div
        v-if="currentCompetition && activeTab === 'settings'"
        class="p-4 bg-gray-50 rounded-lg max-md:p-3"
      >
        <div
          class="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-4"
        >
          <div
            class="flex items-center gap-6 max-md:gap-3 max-md:flex-col max-md:items-start max-md:w-full"
          >
            <div class="flex items-center gap-3 max-md:gap-2">
              <label class="text-sm font-medium text-gray-700 max-md:text-xs">
                {{ $t("campaign_status") }}:
              </label>
              <BaseToggleSwitch
                v-model="campaignEnabled"
                @update:modelValue="toggleCampaignStatus"
              />
              <span class="text-sm font-medium text-gray-700 max-md:text-xs">
                {{ campaignEnabled ? $t("active") : $t("inactive") }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 max-md:w-full max-md:flex-col">
            <LoadingButton
              v-if="currentCompetition.status === true"
              :loading="isButtonLoading.dropPrize"
              @click="dropPrize"
              class="px-4 py-2 bg-yellow-600 text-white rounded-lg lg:hover:bg-yellow-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("drop_prize") }}
            </LoadingButton>
            <LoadingButton
              :loading="isButtonLoading.reset"
              @click="resetCompetition"
              class="px-4 py-2 bg-red-600 text-white rounded-lg lg:hover:bg-red-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("reset") }}
            </LoadingButton>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'settings'" class="p-6 max-md:p-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-md:gap-4">
          <div class="space-y-4 max-md:space-y-3">
            <h3 class="text-lg font-medium text-gray-900 max-md:text-base">
              {{ $t("campaign_settings") }}
            </h3>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("campaign_start_time") }}
              </label>
              <input
                v-model="competitionForm.campaignStartTime"
                type="text"
                placeholder="DD/MM/YYYY HH:MM"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                :disabled="currentCompetition?.status === true"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("campaign_end_time") }}
              </label>
              <input
                v-model="competitionForm.campaignEndTime"
                type="text"
                placeholder="DD/MM/YYYY HH:MM"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                :disabled="currentCompetition?.status === true"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("prize_pool") }} ({{ currency }})
              </label>
              <input
                v-model="competitionForm.prizePool"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>
          </div>
          <div class="space-y-4 max-md:space-y-3">
            <h3 class="text-lg font-medium text-gray-900 max-md:text-base">
              {{ $t("prize_distribution") }}
            </h3>

            <div
              v-for="rank in prizeRanks"
              :key="rank.key"
              class="flex items-center gap-3 max-md:gap-2"
            >
              <span
                class="w-16 text-sm text-gray-600 max-md:w-12 max-md:text-xs"
                >{{ rank.label }}:</span
              >
              <div class="flex-1">
                <input
                  v-model="competitionForm.prizeDistribution[rank.key]"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
              </div>
              <span class="text-sm text-gray-500 max-md:text-xs">%</span>
            </div>

            <div class="pt-2 border-t">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700 max-md:text-xs"
                  >{{ $t("total") }}:</span
                >
                <span
                  class="text-sm font-medium max-md:text-xs"
                  :class="
                    totalPercentage === 100 ? 'text-green-600' : 'text-red-600'
                  "
                >
                  {{ totalPercentage.toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex items-center justify-end gap-3 mt-6 max-md:mt-4 max-md:justify-stretch"
        >
          <LoadingButton
            v-if="!currentCompetition || currentCompetition.status !== true"
            :loading="isButtonLoading.save"
            @click="saveCompetition"
            :disabled="totalPercentage !== 100"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 disabled:bg-gray-400 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{
              currentCompetition
                ? $t("update_competition")
                : $t("create_competition")
            }}
          </LoadingButton>
        </div>
      </div>

      <div v-if="activeTab === 'rankings'" class="p-6 max-md:p-4">
        <div
          v-if="currentCompetition"
          class="mb-6 flex items-center justify-between max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
        >
          <div>
            <h3
              class="text-lg font-medium text-gray-900 mb-2 max-md:text-base max-md:mb-1.5"
            >
              {{ $t("current_rankings") }}
            </h3>
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("rankings_description") }}
            </p>
          </div>
          <div class="flex gap-3 max-md:gap-2 max-md:w-full max-md:flex-col">
            <LoadingButton
              :loading="isButtonLoading.initializeLeaderboard"
              @click="initializeLeaderboard"
              :disabled="
                !currentCompetition.campaignStartTime ||
                !currentCompetition.campaignEndTime
              "
              class="px-4 py-2 bg-blue-600 text-white rounded-lg lg:hover:bg-blue-500 disabled:bg-gray-400 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("initialize_leaderboard") }}
            </LoadingButton>
            <LoadingButton
              :loading="isButtonLoading.previewLeaderboard"
              @click="previewLeaderboard"
              :disabled="
                !currentCompetition.campaignStartTime ||
                !currentCompetition.campaignEndTime
              "
              class="px-4 py-2 bg-gray-600 text-white rounded-lg lg:hover:bg-gray-500 disabled:bg-gray-400 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("preview_leaderboard") }}
            </LoadingButton>
          </div>
        </div>
        <div
          v-if="
            currentCompetition &&
            currentCompetition.topDeposits &&
            currentCompetition.topDeposits.length > 0
          "
        >
          <div class="overflow-x-auto">
            <table class="w-full whitespace-nowrap">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("rank") }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("username") }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("fullname") }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("total_deposit") }} ({{ currency }})
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("deposit_count") }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("last_deposit") }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("estimated_prize") }} ({{ currency }})
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="deposit in currentCompetition.topDeposits"
                  :key="deposit.userId"
                  class="lg:hover:bg-gray-50"
                  :class="getRankClass(deposit.rank)"
                >
                  <td
                    class="px-6 py-4 text-sm font-medium max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-lg max-md:text-base">{{
                        getRankEmoji(deposit.rank)
                      }}</span>
                      <!-- <span>{{ deposit.rank }}</span> -->
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ deposit.username }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ deposit.fullname }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 font-medium max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatCurrency(deposit.totalDeposit) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ deposit.depositCount }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatDateTime(deposit.lastDepositTime) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 font-medium max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatCurrency(calculateEstimatedPrize(deposit.rank)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-center py-12 max-md:py-8">
          <Icon
            icon="solar:trophy-bold"
            class="w-16 h-16 text-gray-300 mx-auto mb-4 max-md:w-12 max-md:h-12 max-md:mb-3"
          />
          <h3
            class="text-lg font-medium text-gray-900 mb-2 max-md:text-base max-md:mb-1.5"
          >
            {{ $t("no_participants") }}
          </h3>
          <p class="text-gray-500 max-md:text-sm">
            {{ $t("no_participants_description") }}
          </p>
        </div>
      </div>

      <div v-if="activeTab === 'reports'" class="p-6 max-md:p-4">
        <div v-if="squidGameReports.length > 0">
          <div class="overflow-x-auto">
            <table class="w-full whitespace-nowrap text-center">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("username") }}
                  </th>
                  <th
                    class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("fullname") }}
                  </th>
                  <th
                    class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("total_deposit") }} ({{ currency }})
                  </th>
                  <th
                    class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("prize_amount") }} ({{ currency }})
                  </th>
                  <th
                    class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("percentage") }}
                  </th>
                  <th
                    class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("status") }}
                  </th>
                  <th
                    class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("distributed_at") }}
                  </th>
                  <th
                    class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("process_by") }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="report in squidGameReports"
                  :key="report._id"
                  class="lg:hover:bg-gray-50"
                  :class="getReportRowClass(report.status)"
                >
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ report.username }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ report.fullname }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 font-medium max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatCurrency(report.totalDeposit) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 font-medium max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatCurrency(report.prizeAmount) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ report.percentage.toFixed(2) }}%
                  </td>
                  <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                    <span
                      :class="getReportStatusClass(report.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{
                        report.status === "distributed"
                          ? $t("distributed")
                          : $t("failed")
                      }}
                    </span>
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatDateTime(report.distributedAt) }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ report.processBy }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="reportsPagination.totalPages > 1"
            class="mt-6 flex items-center justify-between max-md:mt-4 max-md:flex-col max-md:gap-3"
          >
            <div class="text-sm text-gray-700 max-md:text-xs">
              {{ $t("showing") }}
              {{ (reportsPagination.page - 1) * reportsPagination.limit + 1 }}
              {{ $t("to") }}
              {{
                Math.min(
                  reportsPagination.page * reportsPagination.limit,
                  reportsPagination.total
                )
              }}
              {{ $t("of") }} {{ reportsPagination.total }} {{ $t("results") }}
            </div>
            <div class="flex gap-2 max-md:w-full">
              <button
                @click="loadReports(reportsPagination.page - 1)"
                :disabled="reportsPagination.page <= 1"
                class="px-3 py-1 text-sm border border-gray-300 rounded lg:hover:bg-gray-50 disabled:opacity-50 max-md:text-xs max-md:w-full"
              >
                {{ $t("previous") }}
              </button>
              <button
                @click="loadReports(reportsPagination.page + 1)"
                :disabled="
                  reportsPagination.page >= reportsPagination.totalPages
                "
                class="px-3 py-1 text-sm border border-gray-300 rounded lg:hover:bg-gray-50 disabled:opacity-50 max-md:text-xs max-md:w-full"
              >
                {{ $t("next") }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 max-md:py-8">
          <Icon
            icon="solar:document-text-bold"
            class="w-16 h-16 text-gray-300 mx-auto mb-4 max-md:w-12 max-md:h-12 max-md:mb-3"
          />
          <h3
            class="text-lg font-medium text-gray-900 mb-2 max-md:text-base max-md:mb-1.5"
          >
            {{ $t("no_reports") }}
          </h3>
          <p class="text-gray-500 max-md:text-sm">
            {{ $t("no_reports_description") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import moment from "moment";

const currency = useCurrency();
const isPageLoading = ref(true);
const { get, post, patch } = useApiEndpoint();
const activeTab = ref("settings");
const campaignEnabled = ref(false);

const tabs = [
  { key: "settings", label: $t("competition_settings") },
  { key: "rankings", label: $t("current_rankings") },
  { key: "reports", label: $t("report") },
];

const isButtonLoading = ref({
  save: false,
  dropPrize: false,
  reset: false,
  initializeLeaderboard: false,
  previewLeaderboard: false,
  loadReports: false,
});

const prizeRanks = [
  { key: "first", label: "1st" },
  { key: "second", label: "2nd" },
  { key: "third", label: "3rd" },
  { key: "fourth", label: "4th" },
  { key: "fifth", label: "5th" },
  { key: "sixth", label: "6th" },
  { key: "seventh", label: "7th" },
  { key: "eighth", label: "8th" },
  { key: "ninth", label: "9th" },
  { key: "tenth", label: "10th" },
];

const competitionForm = reactive({
  campaignStartTime: "",
  campaignEndTime: "",
  prizePool: 0,
  prizeDistribution: {
    first: 50,
    second: 30,
    third: 20,
    fourth: 0,
    fifth: 0,
    sixth: 0,
    seventh: 0,
    eighth: 0,
    ninth: 0,
    tenth: 0,
  },
});

const squidGameReports = ref([]);
const reportSummary = ref(null);
const reportsPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const reportFilters = reactive({
  username: "",
  status: "",
  startDate: "",
  endDate: "",
});

const currentCompetition = ref(null);
const competitionHistory = ref([]);
const historyPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const totalPercentage = computed(() => {
  return Object.values(competitionForm.prizeDistribution).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );
});

const formatDateTimeToDisplay = (utcDateStr) => {
  if (!utcDateStr) return "";
  return moment
    .utc(utcDateStr)
    .tz("Australia/Melbourne")
    .format("DD/MM/YYYY HH:mm");
};

const convertToUtc = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  return moment
    .tz(dateTimeStr, "DD/MM/YYYY HH:mm", "Australia/Melbourne")
    .utc()
    .toISOString();
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  return moment
    .utc(dateStr)
    .tz("Australia/Melbourne")
    .format("DD/MM/YYYY HH:mm");
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount || 0);
};

const getRankClass = (rank) => {
  if (rank === 1) return "bg-yellow-50";
  if (rank === 2) return "bg-gray-50";
  if (rank === 3) return "bg-orange-50";
  return "";
};

const getRankEmoji = (rank) => {
  const emojis = [
    "",
    "🥇",
    "🥈",
    "🥉",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
  ];
  return emojis[rank] || rank;
};

const calculateEstimatedPrize = (rank) => {
  if (!currentCompetition.value) return 0;
  const rankKeys = [
    "",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
  ];
  const rankKey = rankKeys[rank];
  if (!rankKey) return 0;

  const percentage = currentCompetition.value.prizeDistribution[rankKey] || 0;
  return (currentCompetition.value.prizePool * percentage) / 100;
};

const fetchCurrentCompetition = async () => {
  try {
    const { data } = await get("deposit-competition/current");
    if (data.success && data.data) {
      currentCompetition.value = data.data;
      campaignEnabled.value = data.data.status === true;
      if (data.data.campaignStartTime) {
        competitionForm.campaignStartTime = formatDateTimeToDisplay(
          data.data.campaignStartTime
        );
      }
      if (data.data.campaignEndTime) {
        competitionForm.campaignEndTime = formatDateTimeToDisplay(
          data.data.campaignEndTime
        );
      }
      if (data.data.prizePool) {
        competitionForm.prizePool = data.data.prizePool;
      }
      if (data.data.prizeDistribution) {
        Object.assign(
          competitionForm.prizeDistribution,
          data.data.prizeDistribution
        );
      }
    } else {
      campaignEnabled.value = false;
    }
  } catch (error) {
    console.error("Error fetching current competition:", error);
  }
};

const toggleCampaignStatus = async () => {
  if (!currentCompetition.value) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_create_competition_first"),
    });
    campaignEnabled.value = false;
    return;
  }
  try {
    const { data } = await patch(
      `deposit-competition/${currentCompetition.value._id}/toggle`
    );
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
      await fetchCurrentCompetition();
    } else {
      campaignEnabled.value = currentCompetition.value.status;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    campaignEnabled.value = currentCompetition.value.status;
    console.error("Error toggling campaign status:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const saveCompetition = async () => {
  if (totalPercentage.value !== 100) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("prize_distribution_must_total_100"),
    });
    return;
  }
  if (
    !moment(
      competitionForm.campaignStartTime,
      "DD/MM/YYYY HH:mm",
      true
    ).isValid() ||
    !moment(competitionForm.campaignEndTime, "DD/MM/YYYY HH:mm", true).isValid()
  ) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: "Please enter valid date time in DD/MM/YYYY HH:MM format",
    });
    return;
  }
  isButtonLoading.value.save = true;
  try {
    const apiData = {
      ...competitionForm,
      campaignStartTime: convertToUtc(competitionForm.campaignStartTime),
      campaignEndTime: convertToUtc(competitionForm.campaignEndTime),
    };

    const { data } = await post("deposit-competition", apiData);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
      await fetchCurrentCompetition();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving competition:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value.save = false;
  }
};

const dropPrize = async () => {
  const result = await Swal.fire({
    title: $t("drop_prize_confirmation"),
    text: $t("drop_prize_warning"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: $t("confirm_drop"),
    cancelButtonText: $t("cancel"),
  });
  if (!result.isConfirmed) return;
  isButtonLoading.value.dropPrize = true;
  try {
    const { data } = await post(
      `deposit-competition/${currentCompetition.value._id}/drop-prize`
    );
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: `${data.message[$locale.value] || data.message.en}\n\n${$t(
          "total_distributed"
        )}: ${formatCurrency(data.data.totalDistributed)}`,
      });
      await fetchCurrentCompetition();
      await loadReports();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error dropping prize:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value.dropPrize = false;
  }
};

const resetCompetition = async () => {
  const result = await Swal.fire({
    title: $t("reset_competition_confirmation"),
    text: $t("reset_competition_warning"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: $t("confirm_reset"),
    cancelButtonText: $t("cancel"),
  });
  if (!result.isConfirmed) return;
  isButtonLoading.value.reset = true;
  try {
    if (currentCompetition.value) {
      const { data } = await post(
        `deposit-competition/${currentCompetition.value._id}/reset`
      );
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
        });
        window.location.reload();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } else {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: $t("form_reset_successfully"),
      });
      window.location.reload();
    }
  } catch (error) {
    console.error("Error resetting competition:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value.reset = false;
  }
};

const initializeLeaderboard = async () => {
  if (!currentCompetition.value) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("no_competition_found"),
    });
    return;
  }
  const result = await Swal.fire({
    title: $t("initialize_leaderboard_confirmation"),
    text: $t("initialize_leaderboard_warning"),
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: $t("confirm_initialize"),
    cancelButtonText: $t("cancel"),
  });
  if (!result.isConfirmed) return;
  isButtonLoading.value.initializeLeaderboard = true;
  try {
    const { data } = await post(
      `deposit-competition/${currentCompetition.value._id}/initialize-leaderboard`
    );
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        html: `
          <div class="text-left">
            <p class="mb-2">${
              data.message[$locale.value] || data.message.en
            }</p>
            <div class="text-sm text-gray-600">
              <p><strong>${$t("total_participants")}:</strong> ${
          data.data.summary.totalParticipants
        }</p>
              <p><strong>${$t("total_deposits")}:</strong> ${formatCurrency(
          data.data.summary.totalDeposits
        )}</p>
              <p><strong>${$t("total_transactions")}:</strong> ${
          data.data.summary.totalTransactions
        }</p>
            </div>
          </div>
        `,
      });
      await fetchCurrentCompetition();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error initializing leaderboard:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value.initializeLeaderboard = false;
  }
};

const previewLeaderboard = async () => {
  if (!currentCompetition.value) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("no_competition_found"),
    });
    return;
  }
  isButtonLoading.value.previewLeaderboard = true;
  try {
    const { data } = await get(
      `deposit-competition/${currentCompetition.value._id}/preview-leaderboard`
    );
    if (data.success) {
      if (data.data.topDeposits.length === 0) {
        await Swal.fire({
          icon: "info",
          title: $t("preview_leaderboard"),
          text: $t("no_eligible_deposits_found"),
        });
      } else {
        let tableHTML = `
          <div class="text-left">
            <p class="mb-4 text-center">${
              data.message[$locale.value] || data.message.en
            }</p>
            <div class="overflow-x-auto max-h-96">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-500">${$t(
                      "rank"
                    )}</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-500">${$t(
                      "username"
                    )}</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-500">${$t(
                      "total_deposit"
                    )}</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-500">${$t(
                      "deposit_count"
                    )}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
        `;

        data.data.topDeposits.forEach((deposit) => {
          tableHTML += `
            <tr>
              <td class="px-3 py-2">${deposit.rank}</td>
              <td class="px-3 py-2">${deposit.username}</td>
              <td class="px-3 py-2 font-medium">${formatCurrency(
                deposit.totalDeposit
              )}</td>
              <td class="px-3 py-2">${deposit.depositCount}</td>
            </tr>
          `;
        });

        tableHTML += `
                </tbody>
              </table>
            </div>
            <div class="mt-4 text-center text-sm text-gray-600 border-t pt-4">
              <p><strong>${$t("summary")}:</strong></p>
              <p>${$t("total_participants")}: ${
          data.data.summary.totalParticipants
        }</p>
              <p>${$t("total_deposits")}: ${formatCurrency(
          data.data.summary.totalDeposits
        )}</p>
              <p>${$t("total_transactions")}: ${
          data.data.summary.totalTransactions
        }</p>
            </div>
          </div>
        `;

        await Swal.fire({
          title: $t("preview_leaderboard"),
          html: tableHTML,
          width: "800px",
          showConfirmButton: true,
          confirmButtonText: $t("close"),
        });
      }
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error previewing leaderboard:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value.previewLeaderboard = false;
  }
};

const loadReports = async (page = 1) => {
  isButtonLoading.value.loadReports = true;
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: reportsPagination.value.limit.toString(),
    });
    if (reportFilters.username) {
      params.append("username", reportFilters.username);
    }
    if (reportFilters.status) {
      params.append("status", reportFilters.status);
    }
    if (reportFilters.startDate) {
      params.append("startDate", reportFilters.startDate);
    }
    if (reportFilters.endDate) {
      params.append("endDate", reportFilters.endDate);
    }
    const { data } = await get(`squid-game-reports?${params.toString()}`);
    if (data.success) {
      squidGameReports.value = data.data.reports;
      reportsPagination.value = data.data.pagination;
      reportSummary.value = data.data.summary;
    }
  } catch (error) {
    console.error("Error loading reports:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("network_error"),
    });
  } finally {
    isButtonLoading.value.loadReports = false;
  }
};

const getReportRowClass = (status) => {
  if (status === "distributed") return "bg-green-50";
  if (status === "failed") return "bg-red-50";
  return "";
};

const getReportStatusClass = (status) => {
  if (status === "distributed") {
    return "bg-green-100 text-green-800";
  } else if (status === "failed") {
    return "bg-red-100 text-red-800";
  }
  return "bg-gray-100 text-gray-800";
};

onMounted(async () => {
  await Promise.all([fetchCurrentCompetition(), loadReports()]);
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Squid Game",
});
</script>

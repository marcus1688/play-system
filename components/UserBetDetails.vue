<template>
  <div>
    <BetDetailsModal
      v-model:show="showBetDetailModal"
      :record="selectedBetRecord"
    />
    <div
      class="bg-white rounded-lg shadow min-w-[500px] min-h-[400px] overflow-x-auto max-md:min-w-0 max-md:min-h-[300px]"
    >
      <PageLoading v-if="isPageLoading" />

      <div class="p-4 border-b max-md:p-3">
        <div class="flex flex-wrap gap-4 max-md:gap-3">
          <div
            class="flex items-center gap-2 max-md:flex-col max-md:items-stretch max-md:w-full"
          >
            <BaseDatePicker
              v-model="filters.startDate"
              :placeholder="$t('start_date')"
              :is-start-date="true"
              :other-date="filters.endDate"
              @update:otherDate="filters.endDate = null"
            />
            <span class="text-gray-500 max-md:hidden">-</span>
            <BaseDatePicker
              v-model="filters.endDate"
              :placeholder="$t('end_date')"
              :is-start-date="false"
              :other-date="filters.startDate"
            />
          </div>

          <div class="max-md:w-full">
            <CustomSelect
              v-model="filters.provider"
              class="min-w-[150px] max-md:w-full"
            >
              <option value="">{{ $t("all_providers") }}</option>
              <option
                v-for="provider in providerOptions"
                :key="provider"
                :value="provider"
              >
                {{ provider }}
              </option>
            </CustomSelect>
          </div>

          <div class="max-md:w-full">
            <CustomSelect
              v-model="filters.category"
              class="min-w-[150px] max-md:w-full"
            >
              <option value="">{{ $t("all_categories") }}</option>
              <option
                v-for="category in categoryOptions"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </CustomSelect>
          </div>

          <LoadingButton
            :loading="isSearching"
            @click="fetchBetDetails(1)"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:w-full max-md:justify-center"
          >
            <div class="flex items-center gap-2">
              <Icon
                icon="material-symbols:search"
                class="w-4 h-4 max-md:w-3 max-md:h-3"
              />
              <span class="max-md:text-sm">{{ $t("search") }}</span>
            </div>
          </LoadingButton>
        </div>
      </div>

      <div v-if="summary && !isPageLoading" class="p-4 border-b max-md:p-3">
        <div class="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:gap-3">
          <div class="bg-blue-50 rounded-lg p-4 max-md:p-3">
            <div class="flex items-center gap-3 max-md:gap-2">
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center max-md:w-8 max-md:h-8"
              >
                <Icon
                  icon="material-symbols:casino"
                  class="w-5 h-5 text-blue-600 max-md:w-4 max-md:h-4"
                />
              </div>
              <div>
                <p class="text-sm text-blue-600 font-medium max-md:text-xs">
                  {{ $t("total_bet_amount") }}
                </p>
                <p class="text-lg font-bold text-blue-800 max-md:text-base">
                  {{ currency }} {{ formatNumber(summary.totalBetAmount) }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-green-50 rounded-lg p-4 max-md:p-3">
            <div class="flex items-center gap-3 max-md:gap-2">
              <div
                class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center max-md:w-8 max-md:h-8"
              >
                <Icon
                  icon="material-symbols:payments"
                  class="w-5 h-5 text-green-600 max-md:w-4 max-md:h-4"
                />
              </div>
              <div>
                <p class="text-sm text-green-600 font-medium max-md:text-xs">
                  {{ $t("total_settle_amount") }}
                </p>
                <p class="text-lg font-bold text-green-800 max-md:text-base">
                  {{ currency }} {{ formatNumber(summary.totalSettleAmount) }}
                </p>
              </div>
            </div>
          </div>

          <div
            :class="[
              'rounded-lg p-4 max-md:p-3',
              summary.totalWinLoss >= 0 ? 'bg-emerald-50' : 'bg-red-50',
            ]"
          >
            <div class="flex items-center gap-3 max-md:gap-2">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center max-md:w-8 max-md:h-8',
                  summary.totalWinLoss >= 0 ? 'bg-emerald-100' : 'bg-red-100',
                ]"
              >
                <Icon
                  :icon="
                    summary.totalWinLoss >= 0
                      ? 'material-symbols:trending-up'
                      : 'material-symbols:trending-down'
                  "
                  :class="[
                    'w-5 h-5 max-md:w-4 max-md:h-4',
                    summary.totalWinLoss >= 0
                      ? 'text-emerald-600'
                      : 'text-red-600',
                  ]"
                />
              </div>
              <div>
                <p
                  :class="[
                    'text-sm font-medium max-md:text-xs',
                    summary.totalWinLoss >= 0
                      ? 'text-emerald-600'
                      : 'text-red-600',
                  ]"
                >
                  {{ $t("total_win_loss") }}
                </p>
                <p
                  :class="[
                    'text-lg font-bold max-md:text-base',
                    summary.totalWinLoss >= 0
                      ? 'text-emerald-800'
                      : 'text-red-800',
                  ]"
                >
                  {{ currency }} {{ formatNumber(summary.totalWinLoss) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="userInfo"
          class="mt-4 flex items-center gap-4 text-sm text-gray-600 max-md:flex-col max-md:items-start max-md:gap-2 max-md:text-xs"
        >
          <span>
            <strong>{{ $t("username") }}:</strong> {{ userInfo.username }}
          </span>
          <span v-if="userInfo.gameId">
            <strong>{{ $t("game_id") }}:</strong> {{ userInfo.gameId }}
          </span>
          <span v-if="filters.startDate && filters.endDate">
            <strong>{{ $t("date_range") }}:</strong>
            {{ formatDate(filters.startDate) }} ~
            {{ formatDate(filters.endDate) }}
          </span>
        </div>
      </div>

      <div ref="containerRef" class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("no") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("bet_id") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("game_name") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("provider") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("category") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("bet_amount") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("settle_amount") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("win_loss") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("begin_balance") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("end_balance") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("bet_time") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(record, index) in records"
              :key="record.betId"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{
                  (pagination.currentPage - 1) * pagination.limit + index + 1
                }}
              </td>
              <td
                class="px-6 py-4 text-sm font-mono max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <span
                  class="cursor-pointer text-indigo-600 lg:hover:text-indigo-500"
                  @click="openBetDetail(record)"
                  :title="record.betId"
                >
                  {{ truncateBetId(record.betId) }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ record.gameName || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs uppercase"
              >
                <span
                  class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs max-md:text-[10px]"
                >
                  {{ record.provider || "-" }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs uppercase"
              >
                <span :class="getCategoryClass(record.category)">
                  {{ record.category || "-" }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ currency }} {{ formatNumber(record.betamount) }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ currency }} {{ formatNumber(record.settleamount) }}
              </td>
              <td
                class="px-6 py-4 text-sm font-medium max-md:px-3 max-md:py-2 max-md:text-xs"
                :class="getWinLossClass(record.settleamount - record.betamount)"
              >
                {{ currency }}
                {{ formatNumber(record.settleamount - record.betamount) }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ currency }} {{ formatNumber(record.beganbalance || 0) }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ currency }} {{ formatNumber(record.endbalance || 0) }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ formatDateTime(record.betTime) }}
              </td>
            </tr>
            <tr v-if="records.length === 0" class="h-[400px] max-md:h-[300px]">
              <td
                colspan="12"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:py-3"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  <span class="max-md:text-xs">{{
                    $t("no_records_found")
                  }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="records.length > 0"
        class="p-4 border-t flex items-center justify-between max-md:p-3 max-md:flex-col max-md:gap-3"
      >
        <div class="text-sm text-gray-600 max-md:text-xs">
          {{ $t("showing") }}
          {{ (pagination.currentPage - 1) * pagination.limit + 1 }}
          -
          {{
            Math.min(
              pagination.currentPage * pagination.limit,
              pagination.totalRecords
            )
          }}
          {{ $t("of") }} {{ pagination.totalRecords }} {{ $t("records") }}
        </div>
        <BasePagination
          v-model="pagination.currentPage"
          :totalPages="pagination.totalPages"
          @update:modelValue="fetchBetDetails"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import moment from "moment-timezone";

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const { get, post } = useApiEndpoint();
const currency = useCurrency();
const containerRef = ref(null);
const isPageLoading = ref(true);
const isSearching = ref(false);
const records = ref([]);
const summary = ref(null);
const userInfo = ref(null);
const dateRangeInfo = ref(null);

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  limit: 50,
  totalRecords: 0,
});

const filters = ref({
  startDate: null,
  endDate: null,
  provider: "",
  category: "",
});

const providerOptions = ref([]);

const categoryOptions = ref([]);

const showLiveCasinoModal = ref(false);
const selectedLiveCasinoRecord = ref(null);

const openLiveCasinoDetail = (record) => {
  selectedLiveCasinoRecord.value = record;
  showLiveCasinoModal.value = true;
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return "0.00";
  return parseFloat(num).toFixed(2);
};

const formatDate = (date) => {
  if (!date) return "-";
  return moment(date).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD");
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return moment(dateString)
    .tz("Asia/Kuala_Lumpur")
    .format("DD/MM/YYYY HH:mm:ss");
};

const truncateBetId = (betId) => {
  if (!betId) return "-";
  if (betId.length <= 12) return betId;
  return `${betId.slice(0, 6)}...${betId.slice(-4)}`;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    await Swal.fire({
      icon: "success",
      title: $t("copied"),
      text: $t("bet_id_copied"),
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Copy failed:", error);
  }
};

const getWinLossClass = (value) => {
  const numValue = parseFloat(value);
  if (numValue > 0) return "text-green-600";
  if (numValue < 0) return "text-red-600";
  return "text-gray-600";
};

const getCategoryClass = (category) => {
  const classes = {
    slot: "bg-purple-100 text-purple-800",
    live: "bg-red-100 text-red-800",
    sports: "bg-green-100 text-green-800",
    fishing: "bg-blue-100 text-blue-800",
    lottery: "bg-yellow-100 text-yellow-800",
    table: "bg-orange-100 text-orange-800",
  };
  return `px-2 py-1 rounded text-xs max-md:text-[10px] ${
    classes[category?.toLowerCase()] || "bg-gray-100 text-gray-800"
  }`;
};

const fetchBetDetails = async (page = 1) => {
  try {
    if (page === 1) {
      isPageLoading.value = true;
    }
    isSearching.value = true;

    const requestBody = {
      page,
      limit: pagination.value.limit,
    };

    if (filters.value.startDate) {
      requestBody.startDate = filters.value.startDate;
    }
    if (filters.value.endDate) {
      requestBody.endDate = filters.value.endDate;
    }
    if (filters.value.provider) {
      requestBody.provider = filters.value.provider;
    }
    if (filters.value.category) {
      requestBody.category = filters.value.category;
    }

    const { data } = await post(
      `getdetailgamehistory/${props.userId}`,
      requestBody
    );
    if (data.success) {
      records.value = data.data.records || [];
      summary.value = data.data.summary || null;
      userInfo.value = data.data.user || null;
      dateRangeInfo.value = data.data.dateRange || null;
      providerOptions.value = data.data.providers || [];
      const categories = [
        ...new Set(
          data.data.records
            ?.map((r) => r.category?.toUpperCase())
            .filter(Boolean)
        ),
      ];
      categoryOptions.value = categories;
      pagination.value = {
        currentPage: data.data.pagination?.currentPage || 1,
        totalPages: data.data.pagination?.totalPages || 1,
        limit: data.data.pagination?.limit || 50,
        totalRecords: data.data.pagination?.totalRecords || 0,
      };
      containerRef.value?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text:
          data.message?.[$locale.value] ||
          data.message?.en ||
          $t("fetch_failed"),
      });
    }
  } catch (error) {
    console.error("Error fetching bet details:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isPageLoading.value = false;
    isSearching.value = false;
  }
};

const showBetDetailModal = ref(false);
const selectedBetRecord = ref(null);
const openBetDetail = (record) => {
  selectedBetRecord.value = record;
  showBetDetailModal.value = true;
};

onMounted(async () => {
  const now = moment().tz("Asia/Kuala_Lumpur");
  filters.value.startDate = now.clone().startOf("day").toDate();
  filters.value.endDate = now.clone().endOf("day").toDate();
  await fetchBetDetails(1);
});
</script>

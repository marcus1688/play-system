<template>
  <div>
    <PageLoading v-if="isPageLoading" />

    <!-- Header -->
    <div class="flex items-center gap-4 mb-8 max-md:mb-5">
      <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
      <h1
        class="text-2xl font-semibold text-gray-800 tracking-wide max-md:text-lg"
      >
        {{ $t("admin_dashboard") }}
      </h1>
    </div>

    <!-- Stats Cards Row -->
    <div
      class="grid grid-cols-4 max-xl:grid-cols-2 gap-5 mb-8 max-sm:grid-cols-1 max-md:gap-3 max-md:mb-5"
    >
      <!-- Total Users -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-md:p-3"
      >
        <div class="flex items-center justify-between mb-3 max-md:mb-2">
          <div
            class="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center max-md:w-9 max-md:h-9"
          >
            <Icon
              icon="mdi:account-group"
              class="text-indigo-600 w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </div>
          <span
            class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full max-md:text-[10px]"
            >Active</span
          >
        </div>
        <p class="text-sm text-gray-500 mb-1 max-md:text-xs">
          {{ $t("total_users") }}
        </p>
        <p class="text-2xl font-bold text-gray-800 max-md:text-xl">
          {{ totaluser || 0 }}
        </p>
      </div>

      <!-- Total Deposits (7 Days) -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-md:p-3"
      >
        <div class="flex items-center justify-between mb-3 max-md:mb-2">
          <div
            class="w-11 h-11 bg-emerald-100 rounded-lg flex items-center justify-center max-md:w-9 max-md:h-9"
          >
            <Icon
              icon="mdi:arrow-down-circle"
              class="text-emerald-600 w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </div>
          <span class="text-xs font-medium text-gray-500 max-md:text-[10px]"
            >7 {{ $t("days") }}</span
          >
        </div>
        <p class="text-sm text-gray-500 mb-1 max-md:text-xs">
          {{ $t("total_deposits") }}
        </p>
        <p class="text-2xl font-bold text-gray-800 max-md:text-lg">
          {{ currency }} {{ formatNumber(lastSevenDaySummary?.totalDeposits) }}
        </p>
        <p class="text-xs text-gray-400 mt-1.5 max-md:text-[10px]">
          {{ lastSevenDaySummary.totalDepositCount || 0 }}
          {{ $t("transactions") }}
        </p>
      </div>

      <!-- Total Withdrawals (7 Days) -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-md:p-3"
      >
        <div class="flex items-center justify-between mb-3 max-md:mb-2">
          <div
            class="w-11 h-11 bg-orange-100 rounded-lg flex items-center justify-center max-md:w-9 max-md:h-9"
          >
            <Icon
              icon="mdi:arrow-up-circle"
              class="text-orange-600 w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </div>
          <span class="text-xs font-medium text-gray-500 max-md:text-[10px]"
            >7 {{ $t("days") }}</span
          >
        </div>
        <p class="text-sm text-gray-500 mb-1 max-md:text-xs">
          {{ $t("total_withdrawals") }}
        </p>
        <p class="text-2xl font-bold text-gray-800 max-md:text-lg">
          {{ currency }}
          {{ formatNumber(lastSevenDaySummary?.totalWithdrawals) }}
        </p>
        <p class="text-xs text-gray-400 mt-1.5 max-md:text-[10px]">
          {{ lastSevenDaySummary.totalWithdrawalCount || 0 }}
          {{ $t("transactions") }}
        </p>
      </div>

      <!-- Net Profit -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-md:p-3"
      >
        <div class="flex items-center justify-between mb-3 max-md:mb-2">
          <div
            class="w-11 h-11 bg-violet-100 rounded-lg flex items-center justify-center max-md:w-9 max-md:h-9"
          >
            <Icon
              icon="mdi:chart-line"
              class="text-violet-600 w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </div>
          <span class="text-xs font-medium text-gray-500 max-md:text-[10px]"
            >7 {{ $t("days") }}</span
          >
        </div>
        <p class="text-sm text-gray-500 mb-1 max-md:text-xs">
          {{ $t("net_profit") }}
        </p>
        <p
          class="text-2xl font-bold max-md:text-lg"
          :class="netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'"
        >
          {{ currency }} {{ formatNumber(netProfit) }}
        </p>
        <p class="text-xs text-gray-400 mt-1.5 max-md:text-[10px]">
          {{ $t("deposit_minus_withdraw") }}
        </p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-2 gap-5 max-xl:grid-cols-1 max-md:gap-4">
      <!-- Deposit Chart -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="px-5 py-4 border-b border-gray-100 max-md:px-4 max-md:py-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-gray-800 max-md:text-sm">
                {{ $t("last_7_days_deposit") }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ $t("approved_transactions") }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-emerald-600 max-md:text-lg">
                {{ currency }}
                {{ formatNumber(lastSevenDaySummary?.totalDeposits) }}
              </p>
              <p class="text-[11px] text-gray-500 max-md:text-[10px]">
                {{ $t("avg_time") }}:
                {{ lastSevenDaySummary.averageDepositProcessingTime || "-" }}
              </p>
            </div>
          </div>
        </div>
        <div class="p-5 max-md:p-3">
          <BaseBarChart :data="depositData" :labels="dateLabels" />
        </div>
        <div
          class="px-5 py-3 bg-gray-50 border-t border-gray-100 max-md:px-4 max-md:py-2.5"
        >
          <div
            class="flex items-center justify-between text-xs max-md:text-[11px]"
          >
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 bg-indigo-600 rounded"></div>
              <span class="text-gray-600">{{ $t("daily_amount") }}</span>
            </div>
            <span class="font-semibold text-gray-800">
              {{ lastSevenDaySummary.totalDepositCount || 0 }}
              {{ $t("total_txn") }}
            </span>
          </div>
        </div>
      </div>

      <!-- Withdraw Chart -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="px-5 py-4 border-b border-gray-100 max-md:px-4 max-md:py-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-gray-800 max-md:text-sm">
                {{ $t("last_7_days_withdraw") }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ $t("approved_transactions") }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-orange-600 max-md:text-lg">
                {{ currency }}
                {{ formatNumber(lastSevenDaySummary?.totalWithdrawals) }}
              </p>
              <p class="text-[11px] text-gray-500 max-md:text-[10px]">
                {{ $t("avg_time") }}:
                {{ lastSevenDaySummary.averageWithdrawProcessingTime || "-" }}
              </p>
            </div>
          </div>
        </div>
        <div class="p-5 max-md:p-3">
          <BaseBarChart :data="withdrawData" :labels="dateLabels" />
        </div>
        <div
          class="px-5 py-3 bg-gray-50 border-t border-gray-100 max-md:px-4 max-md:py-2.5"
        >
          <div
            class="flex items-center justify-between text-xs max-md:text-[11px]"
          >
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 bg-indigo-600 rounded"></div>
              <span class="text-gray-600">{{ $t("daily_amount") }}</span>
            </div>
            <span class="font-semibold text-gray-800">
              {{ lastSevenDaySummary.totalWithdrawalCount || 0 }}
              {{ $t("total_txn") }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { get } = useApiEndpoint();
const totaluser = ref("");
const isPageLoading = ref(true);
const lastSevenDaySummary = ref({});
const currency = useCurrency();

const formatNumber = (num) => {
  if (!num) return "0.00";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const netProfit = computed(() => {
  const deposits = lastSevenDaySummary.value?.totalDeposits || 0;
  const withdrawals = lastSevenDaySummary.value?.totalWithdrawals || 0;
  return deposits - withdrawals;
});

const fetchTotalUser = async () => {
  try {
    const { data } = await get("totaluser");
    if (data.success) {
      totaluser.value = data.totalUsers;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

const fetchLastSevenDaySummary = async () => {
  try {
    const { data } = await get("lastsevendaysummary");
    if (data.success) {
      lastSevenDaySummary.value = data;
    }
  } catch (error) {
    console.error("Error fetching last seven day summary:", error);
  }
};

const dateLabels = computed(() =>
  Object.keys(lastSevenDaySummary.value?.summary || {})
);
const depositData = computed(() =>
  dateLabels.value.map(
    (date) =>
      lastSevenDaySummary.value?.summary[date]?.deposits?.totalAmount || 0
  )
);
const withdrawData = computed(() =>
  dateLabels.value.map(
    (date) =>
      lastSevenDaySummary.value?.summary[date]?.withdrawals?.totalAmount || 0
  )
);

onMounted(async () => {
  try {
    await fetchTotalUser();
    await fetchLastSevenDaySummary();
  } finally {
    isPageLoading.value = false;
  }
});

useHead({
  title: "Play System | Dashboard",
  meta: [
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
});
</script>

<style scoped></style>

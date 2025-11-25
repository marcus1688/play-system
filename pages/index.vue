<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center gap-4 mb-6 max-md:mb-4">
      <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
      <h1
        class="text-2xl font-semibold text-gray-800 tracking-wide max-md:text-xl"
      >
        {{ $t("admin_dashboard") }}
      </h1>
    </div>
    <div class="flex gap-4 mb-6 min-h-[500px] max-lg:flex-col max-md:min-h-0">
      <!-- Total Users Card -->
      <div
        class="bg-white p-6 rounded-lg shadow w-[40%] max-xl:w-[50%] max-lg:w-full max-md:p-4"
      >
        <div class="flex justify-between items-start h-full">
          <div class="w-full flex flex-col h-full">
            <p class="text-lg font-semibold max-md:text-base uppercase">
              {{ $t("total_users") }}
            </p>
            <div class="flex w-full justify-center flex-1 items-center">
              <div
                class="w-64 h-64 relative bg-white rounded-full flex items-center justify-center mt-4 shadow-xl max-md:w-48 max-md:h-48 max-sm:w-40 max-sm:h-40"
              >
                <img
                  src="/images/index/circle-effect.png"
                  alt="Circle Effect"
                  class="absolute left-[1%] max-w-none w-[17rem] max-md:w-[13rem] max-sm:w-[11rem]"
                />
                <Icon
                  icon="mdi:user"
                  class="w-10 h-auto max-md:w-8 max-sm:w-6"
                />
                <div
                  class="text-3xl text-center font-bold max-md:text-2xl max-sm:text-xl"
                >
                  {{ totaluser }}
                </div>
              </div>
            </div>
            <div class="w-full flex justify-center max-lg:mt-6 max-md:mt-4">
              <NuxtLinkLocale
                @click="
                  () => {
                    menuActiveBar = 'User List';
                    openDropdowns = { User: true };
                  }
                "
                to="/user/list"
                class="mt-4 bg-indigo-600 lg:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm max-md:text-xs max-md:px-3 max-md:py-1.5"
              >
                {{ $t("view_users") }}
              </NuxtLinkLocale>
            </div>
          </div>
        </div>
      </div>

      <!-- Online Users Table -->
      <div class="bg-white rounded-lg shadow flex-1">
        <div
          class="p-4 border-b border-gray-200 flex justify-between items-end"
        >
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold max-md:text-base">
              {{ $t("online_users") }} ({{ onlineUsers.length }})
            </h2>
            <div
              class="flex items-center gap-2 text-sm text-gray-600 max-md:text-xs"
            >
              <span>{{ $t("auto_refresh_in") }}</span>
              <span class="font-semibold text-indigo-600"
                >{{ countdown }}s</span
              >
            </div>
          </div>
          <div class="flex items-center gap-1">
            <LoadingButton
              :loading="isRefreshButtonLoading"
              @click="handleRefresh"
              class="bg-indigo-600 lg:hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 max-md:text-xs max-md:px-3 max-md:py-1.5"
            >
              <div class="flex items-center gap-2">
                <i class="fas fa-sync-alt"></i>
                {{ $t("refresh_now") }}
              </div>
            </LoadingButton>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-nowrap">
            <thead class="bg-gray-50 text-center">
              <tr>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                >
                  {{ $t("name") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                >
                  {{ $t("balance") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                >
                  {{ $t("vip_level") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-sm:hidden"
                >
                  {{ $t("last_login_date") }}
                </th>
                <th
                  class="px-6 py-3 t text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                >
                  {{ $t("action") }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="user in onlineUsers"
                :key="user.userId"
                class="lg:hover:bg-gray-50 text-center"
              >
                <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                  {{ user.username }}
                </td>
                <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                  {{ currency }} {{ user.wallet }}
                </td>
                <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                  {{ user.vip }}
                </td>
                <td
                  class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm max-sm:hidden"
                >
                  {{ formatDate(user.lastlogin) }}
                </td>
                <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                  <button
                    @click="socketIO.forceLogoutPlayer(user.userId)"
                    class="bg-red-500 lg:hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors max-md:text-xs max-md:px-2 max-md:py-1"
                  >
                    {{ $t("force_logout") }}
                  </button>
                </td>
              </tr>
              <tr
                v-if="onlineUsers.length === 0"
                class="h-[400px] max-md:h-[300px]"
              >
                <td
                  colspan="5"
                  class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
                >
                  <div class="flex flex-col gap-8 items-center max-md:gap-4">
                    <img
                      src="/images/empty.png"
                      alt="Empty State"
                      class="w-32 h-auto opacity-80 max-md:w-24"
                    />
                    {{ $t("no_users_online") }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pending Items Cards -->
    <div
      class="grid grid-cols-3 col-span-2 gap-4 mb-6 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-3"
    >
      <!-- Pending Deposits -->
      <div class="bg-white p-4 rounded-lg shadow flex max-md:p-3">
        <div class="flex flex-col flex-1 gap-2">
          <div class="text-sm text-gray-600 max-md:text-xs">
            {{ $t("pending_deposits") }}
          </div>
          <div class="text-3xl font-bold max-md:text-2xl">
            {{ countOfPendingTransaction.deposits }}
          </div>

          <NuxtLinkLocale
            @click="
              () => {
                menuActiveBar = 'Transaction List';
                openDropdowns = { Transaction: true };
              }
            "
            to="/transaction/list"
            class="mt-4 bg-indigo-600 lg:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm w-[50%] max-2xl:w-[65%] max-xl:w-full flex justify-center max-md:text-xs max-md:px-3 max-md:py-1.5 max-md:mt-3"
          >
            {{ $t("go_to_deposit") }}
          </NuxtLinkLocale>
        </div>
        <div
          class="flex items-start w-[15%] max-2xl:w-[20%] max-xl:w-[25%] max-lg:w-[30%] max-lg:justify-end max-md:w-auto"
        >
          <div
            class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center max-md:w-12 max-md:h-12"
          >
            <Icon
              icon="mingcute:bank-fill"
              class="text-blue-500"
              width="32"
              height="32"
            />
          </div>
        </div>
      </div>

      <!-- Pending Withdrawals -->
      <div class="bg-white p-4 rounded-lg shadow flex max-md:p-3">
        <div class="flex flex-col flex-1 gap-2">
          <div class="text-sm text-gray-600 max-md:text-xs">
            {{ $t("pending_withdrawals") }}
          </div>
          <div class="text-3xl font-bold max-md:text-2xl">
            {{ countOfPendingTransaction.withdrawals }}
          </div>
          <NuxtLinkLocale
            @click="
              () => {
                menuActiveBar = 'Transaction List';
                openDropdowns = { Transaction: true };
              }
            "
            to="/transaction/list"
            class="mt-4 bg-indigo-600 lg:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm w-[50%] max-2xl:w-[65%] max-xl:w-full flex justify-center max-md:text-xs max-md:px-3 max-md:py-1.5 max-md:mt-3"
          >
            {{ $t("go_to_withdrawals") }}
          </NuxtLinkLocale>
        </div>
        <div
          class="flex items-start w-[15%] max-2xl:w-[20%] max-xl:w-[25%] max-lg:w-[30%] max-lg:justify-end max-md:w-auto"
        >
          <div
            class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center max-md:w-12 max-md:h-12"
          >
            <Icon
              icon="healthicons:money-bag"
              class="text-red-500"
              width="32"
              height="32"
            />
          </div>
        </div>
      </div>

      <!-- Pending Bonuses -->
      <div class="bg-white p-4 rounded-lg shadow flex max-md:p-3">
        <div class="flex flex-col flex-1 gap-2">
          <div class="text-sm text-gray-600 max-md:text-xs">
            {{ $t("pending_bonuses") }}
          </div>
          <div class="text-3xl font-bold max-md:text-2xl">
            {{ countOfPendingTransaction.bonus }}
          </div>
          <NuxtLinkLocale
            @click="
              () => {
                menuActiveBar = 'Transaction List';
                openDropdowns = { Transaction: true };
              }
            "
            to="/transaction/list"
            class="mt-4 bg-indigo-600 lg:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm w-[50%] max-2xl:w-[65%] max-xl:w-full flex justify-center max-md:text-xs max-md:px-3 max-md:py-1.5 max-md:mt-3"
          >
            {{ $t("go_to_bonuses") }}
          </NuxtLinkLocale>
        </div>
        <div
          class="flex items-start w-[15%] max-2xl:w-[20%] max-xl:w-[25%] max-lg:w-[30%] max-lg:justify-end max-md:w-auto"
        >
          <div
            class="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center max-md:w-12 max-md:h-12"
          >
            <Icon
              icon="mdi:present"
              class="text-green-500"
              width="32"
              height="32"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-2 max-xl:grid-cols-1 gap-6 max-md:gap-4">
      <!-- Last 7 Days Approved Deposit -->
      <div class="bg-white rounded-lg shadow p-4 max-md:p-3">
        <h3 class="text-lg font-semibold mb-4 max-md:text-base max-md:mb-3">
          {{ $t("last_7_days_deposit") }}
        </h3>
        <div>
          <BaseBarChart :data="depositData" :labels="dateLabels" />
        </div>
        <div
          class="flex items-center justify-between mt-4 border-t pt-4 max-xl:hidden"
        >
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-indigo-600 rounded"></div>
            <span class="text-sm text-gray-600">{{ $t("amount") }}</span>
            <span class="font-bold text-sm"
              >{{ currency }}
              {{ lastSevenDaySummary?.totalDeposits?.toFixed(2) }}</span
            >
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-indigo-400 rounded"></div>
            <span class="text-sm text-gray-600">{{ $t("total") }}</span>
            <span class="font-bold text-sm">{{
              lastSevenDaySummary.totalDepositCount
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-indigo-200 rounded"></div>
            <span class="text-sm text-gray-600">{{ $t("avg_time") }}</span>
            <span class="font-bold text-sm">{{
              lastSevenDaySummary.averageDepositProcessingTime
            }}</span>
          </div>
        </div>
        <!-- Mobile Stats -->
        <div class="xl:hidden flex flex-col gap-3 mt-4 border-t pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-indigo-600 rounded"></div>
              <span class="text-sm text-gray-600 max-md:text-xs">{{
                $t("amount")
              }}</span>
            </div>
            <span class="font-bold text-sm max-md:text-xs"
              >{{ currency }}
              {{ lastSevenDaySummary?.totalDeposits?.toFixed(2) }}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-indigo-400 rounded"></div>
              <span class="text-sm text-gray-600 max-md:text-xs">{{
                $t("total")
              }}</span>
            </div>
            <span class="font-bold text-sm max-md:text-xs">{{
              lastSevenDaySummary.totalDepositCount
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-indigo-200 rounded"></div>
              <span class="text-sm text-gray-600 max-md:text-xs">{{
                $t("avg_time")
              }}</span>
            </div>
            <span class="font-bold text-sm max-md:text-xs">{{
              lastSevenDaySummary.averageDepositProcessingTime
            }}</span>
          </div>
        </div>
      </div>

      <!-- Last 7 Days Approved Withdraw -->
      <div class="bg-white rounded-lg shadow p-4 max-md:p-3">
        <h3 class="text-lg font-semibold mb-4 max-md:text-base max-md:mb-3">
          {{ $t("last_7_days_withdraw") }}
        </h3>
        <div>
          <BaseBarChart :data="withdrawData" :labels="dateLabels" />
        </div>
        <div
          class="flex items-center justify-between mt-4 border-t pt-4 max-xl:hidden"
        >
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-indigo-600 rounded"></div>
            <span class="text-sm text-gray-600">{{ $t("amount") }}</span>
            <span class="font-bold text-sm"
              >{{ currency }}
              {{ lastSevenDaySummary?.totalWithdrawals?.toFixed(2) }}</span
            >
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-indigo-400 rounded"></div>
            <span class="text-sm text-gray-600">{{ $t("total") }}</span>
            <span class="font-bold text-sm">{{
              lastSevenDaySummary.totalWithdrawalCount
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-indigo-200 rounded"></div>
            <span class="text-sm text-gray-600">{{ $t("avg_time") }}</span>
            <span class="font-bold text-sm">{{
              lastSevenDaySummary.averageWithdrawProcessingTime
            }}</span>
          </div>
        </div>
        <!-- Mobile Stats -->
        <div class="xl:hidden flex flex-col gap-3 mt-4 border-t pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-indigo-600 rounded"></div>
              <span class="text-sm text-gray-600 max-md:text-xs">{{
                $t("amount")
              }}</span>
            </div>
            <span class="font-bold text-sm max-md:text-xs"
              >{{ currency }}
              {{ lastSevenDaySummary?.totalWithdrawals?.toFixed(2) }}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-indigo-400 rounded"></div>
              <span class="text-sm text-gray-600 max-md:text-xs">{{
                $t("total")
              }}</span>
            </div>
            <span class="font-bold text-sm max-md:text-xs">{{
              lastSevenDaySummary.totalWithdrawalCount
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-indigo-200 rounded"></div>
              <span class="text-sm text-gray-600 max-md:text-xs">{{
                $t("avg_time")
              }}</span>
            </div>
            <span class="font-bold text-sm max-md:text-xs">{{
              lastSevenDaySummary.averageWithdrawProcessingTime
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Stats Table -->
    <div class="bg-white rounded-lg shadow hidden">
      <div class="p-4 border-b border-gray-200 max-md:p-3">
        <h2 class="text-lg font-semibold max-md:text-base">
          {{ $t("employee_stats") }}
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("employees") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("deposit_my") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("avg_deposit_time") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("reversed_deposit_my") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("withdraw_my") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("avg_withdraw_time") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("reversed_withdraw_my") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="staff in staff"
              :key="staff.id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                {{ staff.username }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                {{ staff.depositTransactionCount }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                {{ staff.averageDepositProcessingTime }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                {{ staff.totalRevertedDeposits }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                {{ staff.withdrawalTransactionCount }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                {{ staff.averageWithdrawalProcessingTime }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-sm">
                {{ staff.totalRevertedWithdrawals }}
              </td>
            </tr>
            <tr v-if="staff.length === 0" class="h-[400px] max-md:h-[300px]">
              <td
                colspan="7"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_employee_stats") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";
import { getCompanyCurrency } from "~/utils/companies";

const isRefreshButtonLoading = ref(false);
const openDropdowns = useState("openDropdowns");
const menuActiveBar = useState("menuActiveBar");
const { get } = useApiEndpoint();
const totaluser = ref("");
const isPageLoading = ref(true);
const onlineUsers = useState("onlineUsers");
const socketIO = useSocketIO();
const countOfPendingTransaction = ref([]);
const lastSevenDaySummary = ref({});
const currency = useCurrency();
const staff = ref([]);
const refreshTimer = ref(null);
const countdownTimer = ref(null);
const countdown = ref(30);

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

const fetchCountOfPendingTransaction = async () => {
  try {
    const { data } = await get("count/pendingtransaction");
    if (data.success) {
      countOfPendingTransaction.value = data.summary;
    }
  } catch (error) {
    console.error("Error fetching count of pending transaction:", error);
  }
};

const handleRefresh = async () => {
  isRefreshButtonLoading.value = true;
  socketIO.refreshData();
  startAutoRefresh();
  isRefreshButtonLoading.value = false;
  Swal.fire({
    icon: "success",
    title: $t("refresh_successful"),
    text: $t("data_refreshed"),
    timer: 1500,
  });
};

const resetCountdown = () => {
  countdown.value = 30;
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      countdown.value = 30;
    }
  }, 1000);
};

const startAutoRefresh = () => {
  stopAutoRefresh();
  resetCountdown();
  refreshTimer.value = setInterval(() => {
    socketIO.refreshData();
    resetCountdown();
  }, 30000);
};

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
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

const fetchAllStaff = async () => {
  try {
    const { data } = await get("allstaff");
    if (data.success) {
      staff.value = data.allstaff;
    }
  } catch (error) {
    console.error("Error fetching all staff:", error);
  }
};

onMounted(async () => {
  try {
    await fetchTotalUser();
    await fetchCountOfPendingTransaction();
    await fetchLastSevenDaySummary();
    await fetchAllStaff();
    startAutoRefresh();
  } finally {
    isPageLoading.value = false;
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});

useHead({
  title: "Money System | Dashboard",
  meta: [
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
});
</script>

<style scoped></style>

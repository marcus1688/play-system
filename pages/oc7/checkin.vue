<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("consecutive_deposit_users") }}
          </h1>
        </div>
      </div>

      <div
        class="flex items-center gap-3 max-md:gap-2 max-md:w-full max-md:flex-col"
      >
        <div
          class="flex items-center gap-2 max-md:w-full max-md:justify-between"
        >
          <label class="text-sm text-gray-600 max-md:text-xs"
            >{{ $t("min_amount") }}:</label
          >
          <div class="flex items-center gap-2">
            <input
              v-model="minAmount"
              type="number"
              min="1"
              step="1"
              class="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 max-md:w-16 max-md:text-xs max-md:px-1.5 max-md:py-2"
            />
            <span class="text-sm text-gray-600 max-md:text-xs">{{
              currency
            }}</span>
          </div>
        </div>
        <LoadingButton
          :loading="isFetchLoading"
          @click="fetchConsecutiveUsers"
          class="px-4 py-2 text-md text-white bg-orange-600 rounded lg:hover:bg-orange-500 transition-colors max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          {{ $t("refresh_data") }}
        </LoadingButton>
      </div>
    </div>
    <div
      class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 max-md:gap-3 max-md:mb-4"
      v-if="summaryData"
    >
      <div class="bg-white rounded-lg shadow p-4 max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("total_users") }}
            </p>
            <p class="text-2xl font-semibold text-gray-800 max-md:text-xl">
              {{ summaryData.total }}
            </p>
          </div>
          <Icon
            icon="material-symbols:group"
            class="w-8 h-8 text-blue-500 max-md:w-6 max-md:h-6"
          />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4 max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("seven_day_users") }}
            </p>
            <p class="text-2xl font-semibold text-green-600 max-md:text-xl">
              {{ summaryData.sevenDayUsers }}
            </p>
          </div>
          <Icon
            icon="material-symbols:trending-up"
            class="w-8 h-8 text-green-500 max-md:w-6 max-md:h-6"
          />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4 max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("two_to_six_day_users") }}
            </p>
            <p class="text-2xl font-semibold text-orange-600 max-md:text-xl">
              {{ summaryData.twoToSixDayUsers }}
            </p>
          </div>
          <Icon
            icon="material-symbols:schedule"
            class="w-8 h-8 text-orange-500 max-md:w-6 max-md:h-6"
          />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4 max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("active_today") }}
            </p>
            <p class="text-2xl font-semibold text-purple-600 max-md:text-xl">
              {{ summaryData.activeTodayUsers }}
            </p>
          </div>
          <Icon
            icon="material-symbols:today"
            class="w-8 h-8 text-purple-500 max-md:w-6 max-md:h-6"
          />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4 max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("query_date") }}
            </p>
            <p class="text-lg font-semibold text-gray-800 max-md:text-base">
              {{ summaryData.queryDate }}
            </p>
          </div>
          <Icon
            icon="material-symbols:calendar-today"
            class="w-8 h-8 text-gray-500 max-md:w-6 max-md:h-6"
          />
        </div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:items-start max-md:gap-2"
      >
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-medium text-gray-800 hidden">
            {{ displayMessage }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <div class="text-sm text-gray-600 max-md:text-xs">
            {{ $t("min_deposit_amount") }}: {{ currency }} {{ minAmount }}
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("no") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("username") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("consecutive_days") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("date_range") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("total_amount") }} ({{ currency }})
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("avg_daily_amount") }} ({{ currency }})
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("status") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("actions") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(user, index) in displayUsers"
              :key="user.userId"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex items-center justify-center">
                  {{ index + 1 }}
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm font-medium text-blue-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.username }}
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium max-md:px-2 max-md:py-2 max-md:text-xs',
                    user.consecutiveDays >= 7
                      ? 'bg-green-100 text-green-800'
                      : user.consecutiveDays >= 5
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800',
                  ]"
                >
                  {{ user.consecutiveDays }} {{ $t("days") }}
                </span>
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex flex-col">
                  <span>{{ formatDate(user.startDate) }}</span>
                  <span class="text-xs text-gray-400">{{ $t("to") }}</span>
                  <span>{{ formatDate(user.endDate) }}</span>
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm font-semibold text-green-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(user.totalAmount) }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(user.avgDailyAmount) }}
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium max-md:px-1.5 max-md:py-2',
                    user.isActiveToday
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{
                    user.isActiveToday
                      ? $t("active_today")
                      : $t("inactive_today")
                  }}
                </span>
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <div
                  class="flex gap-2 justify-center max-md:flex-col max-md:gap-1"
                >
                  <button
                    @click="viewDailyBreakdown(user)"
                    class="px-3 py-1 text-white bg-blue-600 rounded lg:hover:bg-blue-700 flex items-center gap-1 justify-center max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    <span class="max-sm:hidden">{{ $t("view_details") }}</span>
                    <span class="sm:hidden">{{ $t("view") }}</span>
                  </button>
                  <button
                    @click="submitCheckinBonus(user)"
                    :disabled="
                      isSubmittingBonus[user.userId] || user.consecutiveDays < 7
                    "
                    :class="[
                      'px-3 py-1 rounded flex items-center gap-1 transition-colors justify-center max-md:px-2 max-md:py-2 max-md:text-xs',
                      user.consecutiveDays >= 7 &&
                      !isSubmittingBonus[user.userId]
                        ? 'text-white bg-green-600 lg:hover:bg-green-700'
                        : 'text-gray-400 bg-gray-200 cursor-not-allowed',
                    ]"
                  >
                    <Icon
                      :icon="
                        isSubmittingBonus[user.userId]
                          ? 'material-symbols:hourglass-empty'
                          : 'material-symbols:redeem'
                      "
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                      :class="{
                        'animate-spin': isSubmittingBonus[user.userId],
                      }"
                    />
                    {{
                      isSubmittingBonus[user.userId]
                        ? $t("submitting")
                        : $t("submit_bonus")
                    }}
                  </button>
                </div>
              </td>
            </tr>

            <tr
              v-if="displayUsers.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="8"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_consecutive_users_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Daily Breakdown Modal -->
    <div
      v-if="showBreakdownModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 max-md:px-4"
      @click="closeBreakdownModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-md:mx-2"
        @click.stop
      >
        <div class="flex items-center justify-between p-6 border-b max-md:p-4">
          <h3 class="text-lg font-semibold text-gray-800 max-md:text-base">
            {{ $t("daily_breakdown_for") }} {{ selectedUser?.username }}
          </h3>
          <button
            @click="closeBreakdownModal"
            class="text-gray-400 lg:hover:text-gray-600"
          >
            <Icon
              icon="material-symbols:close"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </button>
        </div>

        <div class="p-6 max-md:p-4">
          <div v-if="selectedUser" class="mb-4 max-md:mb-3">
            <div
              class="grid grid-cols-3 gap-4 text-center max-md:gap-2 max-md:grid-cols-1"
            >
              <div class="bg-blue-50 p-3 rounded max-md:p-2">
                <p class="text-sm text-gray-600 max-md:text-xs">
                  {{ $t("consecutive_days") }}
                </p>
                <p class="text-xl font-semibold text-blue-600 max-md:text-lg">
                  {{ selectedUser.consecutiveDays }}
                </p>
              </div>
              <div class="bg-green-50 p-3 rounded max-md:p-2">
                <p class="text-sm text-gray-600 max-md:text-xs">
                  {{ $t("total_amount") }}
                </p>
                <p class="text-xl font-semibold text-green-600 max-md:text-lg">
                  {{ currency }} {{ formatAmount(selectedUser.totalAmount) }}
                </p>
              </div>
              <div class="bg-purple-50 p-3 rounded max-md:p-2">
                <p class="text-sm text-gray-600 max-md:text-xs">
                  {{ $t("avg_daily") }}
                </p>
                <p class="text-xl font-semibold text-purple-600 max-md:text-lg">
                  {{ currency }} {{ formatAmount(selectedUser.avgDailyAmount) }}
                </p>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase max-md:px-2 max-md:py-1.5"
                  >
                    {{ $t("date") }}
                  </th>
                  <th
                    class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase max-md:px-2 max-md:py-1.5"
                  >
                    {{ $t("amount") }} ({{ currency }})
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="day in selectedUser?.dailyBreakdown"
                  :key="day.date"
                  class="lg:hover:bg-gray-50"
                >
                  <td
                    class="px-4 py-3 text-sm text-gray-800 max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    {{ formatDate(day.date) }}
                    <span
                      v-if="day.date === summaryData?.queryDate"
                      class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded max-md:ml-1 max-md:px-1.5 max-md:py-2"
                    >
                      {{ $t("today") }}
                    </span>
                  </td>
                  <td
                    class="px-4 py-3 text-sm font-semibold text-right text-green-600 max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(day.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatAmount } from "~/utils/amountFormatter";

const isSubmittingBonus = ref({});
const { get, post } = useApiEndpoint();
const currency = useCurrency();
const isPageLoading = ref(true);
const isFetchLoading = ref(false);
const minAmount = ref(50);
const consecutiveData = ref(null);
const summaryData = ref(null);
const displayUsers = ref([]);
const displayMessage = ref("");
const showBreakdownModal = ref(false);
const selectedUser = ref(null);

const formatDate = (date) => {
  if (!date) return "-";
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "-";
    }
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "-";
  }
};

const fetchConsecutiveUsers = async () => {
  isFetchLoading.value = true;
  try {
    const queryParams = new URLSearchParams({
      minAmount: minAmount.value,
    });
    const { data } = await get(`consecutive-deposit-users?${queryParams}`);
    if (data.success) {
      consecutiveData.value = data.data;
      summaryData.value = data.data.summary;
      displayUsers.value = data.data.primary || [];
      displayMessage.value = data.message[$locale.value] || data.message.en;
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error fetching consecutive deposit users:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isFetchLoading.value = false;
  }
};

const submitCheckinBonus = async (user) => {
  if (isSubmittingBonus.value[user.userId]) return;
  try {
    const result = await Swal.fire({
      title: $t("confirm_submit"),
      text: `${$t("submit_checkin_bonus_for")} ${user.username}? `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;
    isSubmittingBonus.value[user.userId] = true;
    const { data } = await post(`submit-checkin-bonus/${user.userId}`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error submitting checkin bonus:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isSubmittingBonus.value[user.userId] = false;
  }
};

const viewDailyBreakdown = (user) => {
  selectedUser.value = user;
  showBreakdownModal.value = true;
};

const closeBreakdownModal = () => {
  showBreakdownModal.value = false;
  selectedUser.value = null;
};

onMounted(async () => {
  await fetchConsecutiveUsers();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Consecutive Deposit Users",
});
</script>

<style scoped></style>

<template>
  <div
    class="space-y-6 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:space-y-4"
  >
    <PageLoading v-if="isPageLoading" />
    <AdjustTotalModal
      v-model:show="showAdjustModal"
      :type="adjustType"
      :current-amount="
        adjustType === 'deposit'
          ? userData.totaldeposit
          : userData.totalwithdraw
      "
      @submit="submitAdjust"
    />
    <!-- Statistics Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:gap-2">
          <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
          <h3 class="text-lg font-semibold max-md:text-base">
            {{ $t("performance_statistics") }}
          </h3>
        </div>
      </div>

      <div class="p-6 max-md:p-3">
        <div class="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-3">
          <!-- Deposits, Withdrawals & Bonus -->
          <div class="space-y-4 max-md:space-y-3">
            <div
              class="flex justify-between items-center bg-gray-50 p-4 rounded-lg max-md:p-3"
            >
              <div>
                <label
                  class="text-sm font-medium text-gray-700 max-md:text-xs"
                  >{{ $t("total_deposits") }}</label
                >
                <div
                  class="text-lg font-semibold mt-1 max-md:text-base max-md:mt-0.5"
                >
                  {{ currency }}
                  {{ formatAmount(userData.totaldeposit) }}
                  <button
                    @click="openAdjustModal('deposit')"
                    class="px-2 py-1 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 transition-colors"
                  >
                    {{ $t("adjust") }}
                  </button>
                </div>
              </div>
              <Icon
                icon="material-symbols:account-balance"
                class="text-indigo-600 w-8 h-8 max-md:w-6 max-md:h-6"
              />
            </div>
            <div
              class="flex justify-between items-center bg-gray-50 p-4 rounded-lg max-md:p-3"
            >
              <div>
                <label
                  class="text-sm font-medium text-gray-700 max-md:text-xs"
                  >{{ $t("total_withdrawals") }}</label
                >
                <div
                  class="text-lg font-semibold mt-1 max-md:text-base max-md:mt-0.5"
                >
                  {{ currency }}
                  {{ formatAmount(userData.totalwithdraw) }}
                  <button
                    @click="openAdjustModal('withdraw')"
                    class="px-2 py-1 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 transition-colors"
                  >
                    {{ $t("adjust") }}
                  </button>
                </div>
              </div>
              <Icon
                icon="material-symbols:move-to-inbox"
                class="text-indigo-600 w-8 h-8 max-md:w-6 max-md:h-6"
              />
            </div>
            <div
              class="flex justify-between items-center bg-gray-50 p-4 rounded-lg max-md:p-3"
            >
              <div>
                <label
                  class="text-sm font-medium text-gray-700 max-md:text-xs"
                  >{{ $t("total_bonus") }}</label
                >
                <div
                  class="text-lg font-semibold mt-1 max-md:text-base max-md:mt-0.5"
                >
                  {{ currency }}
                  {{ formatAmount(userData.totalbonus) }}
                </div>
              </div>
              <Icon
                icon="material-symbols:redeem"
                class="text-indigo-600 w-8 h-8 max-md:w-6 max-md:h-6"
              />
            </div>
          </div>

          <!-- Win/Loss & Last Deposit -->
          <div class="space-y-4 max-md:space-y-3">
            <div
              class="flex justify-between items-center bg-gray-50 p-4 rounded-lg max-md:p-3"
            >
              <div>
                <label
                  class="text-sm font-medium text-gray-700 max-md:text-xs"
                  >{{ $t("net_win_loss") }}</label
                >
                <div
                  class="text-lg font-semibold mt-1 max-md:text-base max-md:mt-0.5"
                  :class="getWinLossClass(winloss)"
                >
                  {{ currency }}
                  {{ formatAmount(winloss) }}
                </div>
              </div>
              <Icon
                :icon="
                  winloss >= 0
                    ? 'material-symbols:trending-up'
                    : 'material-symbols:trending-down'
                "
                :class="winloss >= 0 ? 'text-green-600' : 'text-red-600'"
                class="w-8 h-8 max-md:w-6 max-md:h-6"
              />
            </div>

            <div
              class="flex justify-between items-center bg-gray-50 p-4 rounded-lg max-md:p-3"
            >
              <div>
                <label
                  class="text-sm font-medium text-gray-700 max-md:text-xs"
                  >{{ $t("last_deposit_date") }}</label
                >
                <div
                  class="text-lg font-semibold mt-1 max-md:text-base max-md:mt-0.5"
                >
                  {{
                    userData.lastdepositdate
                      ? formatDate(userData.lastdepositdate)
                      : "-"
                  }}
                </div>
              </div>
              <Icon
                icon="material-symbols:calendar-today"
                class="text-indigo-600 w-8 h-8 max-md:w-6 max-md:h-6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Update Rebate Modal -->
    <UpdateRebateModal
      v-model:show="showUpdateRebateModal"
      :current-rebate="Number(userData.rebate)"
      @submit="submitRebateUpdate"
    />

    <!-- Add Cashout Modal -->
    <CashOutModal
      v-model:show="showCashoutModal"
      :max-amount="Number(userData.wallet)"
      @submit="submitCashout"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";
const { getCompanyId } = useCompany();
const { post, patch } = useApiEndpoint();
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["fetch-balance", "update"]);
const showAdjustModal = ref(false);
const adjustType = ref("deposit");
const isFetchBalanceButtonLoading = ref(false);
const isPageLoading = ref(true);
const showCashoutModal = ref(false);
const showUpdateRebateModal = ref(false);
const currency = useCurrency();
const getWinLossClass = (value) => {
  const numValue = parseFloat(value);
  if (numValue > 0) return "text-green-600";
  if (numValue < 0) return "text-red-600";
  return "text-gray-600";
};
const userGameWalletBalance = ref("");

const handleCashout = () => {
  showCashoutModal.value = true;
};

const winloss = computed(() => {
  const totalDeposit = Number(props.userData.totaldeposit || 0);
  const totalWithdraw = Number(props.userData.totalwithdraw || 0);
  return totalWithdraw - totalDeposit;
});

const openAdjustModal = (type) => {
  adjustType.value = type;
  showAdjustModal.value = true;
};

const submitAdjust = async (adjustData) => {
  try {
    const endpoint =
      adjustType.value === "deposit"
        ? `adjust-total-deposit/${props.userData._id}`
        : `adjust-total-withdraw/${props.userData._id}`;

    const { data } = await patch(endpoint, {
      amount: Number(adjustData.amount),
      remark: adjustData.remark,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      showAdjustModal.value = false;
      emit("update");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
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

const submitCashout = async (cashout) => {
  try {
    const { data } = await patch(`user/cashout/${props.userData._id}`, {
      amount: Number(cashout.amount),
      remark: cashout.remark,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
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

const submitRebateUpdate = async (amount) => {
  try {
    const { data } = await patch(`user/${props.userData._id}/updateRebate`, {
      rebate: amount,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
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

const fetchUserGameWalletBalance = async () => {
  isFetchBalanceButtonLoading.value = true;
  try {
    const { data } = await post(
      `game/${props.userData._id}/checkallgamebalance`
    );
    if (data.success) {
      userGameWalletBalance.value = data.totalBalance;
    }
  } catch (error) {
    console.error("Error fetching game wallet balance:", error);
  } finally {
    isFetchBalanceButtonLoading.value = false;
  }
};

onMounted(async () => {
  // await fetchUserGameWalletBalance();
  isPageLoading.value = false;
});
</script>

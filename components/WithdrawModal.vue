<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[700px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div class="w-2 h-8 bg-orange-600 rounded-full max-md:h-6"></div>
              <h2 class="text-xl font-semibold max-md:text-lg">
                {{ $t("withdraw") }}
              </h2>
            </div>
            <button
              @click="fetchAllKioskBalances"
              :disabled="isLoadingBalances"
              class="flex items-center gap-1 text-sm text-indigo-600 lg:hover:text-indigo-800 max-md:text-xs"
            >
              <Icon
                :icon="isLoadingBalances ? 'eos-icons:loading' : 'mdi:refresh'"
                class="w-5 h-5 max-md:w-4 max-md:h-4"
              />
              <span class="max-sm:hidden">{{ $t("refresh_all") }}</span>
            </button>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <!-- User Info -->
          <div
            class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-md:p-3 max-md:mb-3"
          >
            <div class="grid grid-cols-2 gap-4 max-md:gap-2">
              <div>
                <div class="text-sm text-gray-500 max-md:text-xs">
                  {{ $t("userid") }}
                </div>
                <div class="font-semibold text-gray-800 max-md:text-sm">
                  {{ userData?.userid }}
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-500 max-md:text-xs">
                  {{ $t("full_name") }}
                </div>
                <div class="font-semibold text-gray-800 max-md:text-sm">
                  {{ userData?.fullname }}
                </div>
              </div>
            </div>
          </div>

          <!-- Kiosk Select -->
          <div class="mb-4 max-md:mb-3">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("select_kiosk") }} <span class="text-red-500">*</span>
            </label>
            <CustomSelect v-model="formData.kioskId" required>
              <option value="" disabled>{{ $t("select_kiosk") }}</option>
              <option value="without_kiosk">{{ $t("without_kiosk") }}</option>
              <option
                v-for="kiosk in kioskListWithBalances"
                :key="kiosk._id"
                :value="kiosk._id"
              >
                {{ kiosk.name }} - {{ $t("balance") }}:
                {{ formatAmount(kiosk.balance) }}
              </option>
            </CustomSelect>

            <div v-if="formData.kioskId === 'without_kiosk'" class="mt-2">
              <input
                v-model="formData.customKioskName"
                type="text"
                :placeholder="$t('enter_kiosk_name')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Selected Kiosk Info -->
            <div
              v-if="selectedKioskInfo && formData.kioskId !== 'without_kiosk'"
              class="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg max-md:p-2"
            >
              <div
                class="flex items-center justify-between text-sm max-md:text-xs"
              >
                <div>
                  <span class="text-gray-600">{{ $t("kiosk_balance") }}:</span>
                  <span class="font-bold text-indigo-600 ml-1">
                    {{ formatAmount(selectedKioskInfo.balance) }}
                    {{ $t("points") }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">{{ $t("gameid") }}:</span>
                  <span
                    class="font-bold"
                    :class="
                      selectedKioskInfo.userKioskId
                        ? 'text-gray-800'
                        : 'text-red-500'
                    "
                  >
                    {{ selectedKioskInfo.userKioskId || $t("not_registered") }}
                  </span>
                  <button
                    v-if="selectedKioskInfo.userKioskId"
                    @click="copyToClipboard(selectedKioskInfo.userKioskId)"
                    class="text-gray-400 lg:hover:text-indigo-600"
                  >
                    <Icon icon="mdi:content-copy" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Multiplier Info (for x2/x5) -->
              <div
                v-if="transferMultiplier > 1 && formData.amount"
                class="mt-2 pt-2 border-t border-indigo-200"
              >
                <div class="flex justify-between text-sm max-md:text-xs">
                  <span class="text-gray-600">
                    {{ $t("actual_withdraw") }} (x{{ transferMultiplier }}
                    {{ $t("multiplier") }}):
                  </span>
                  <span class="font-bold text-orange-600">
                    {{ currency }}
                    {{ formatAmount(actualWithdrawAmountWithMultiplier) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <!-- Amount -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("withdraw_points") }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.amount"
                type="number"
                step="0.01"
                min="0"
                :placeholder="$t('enter_points')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                required
              />
            </div>

            <!-- CashOut Remaining Balance Checkbox -->
            <div
              v-if="formData.kioskId && formData.kioskId !== 'without_kiosk'"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                id="cashoutRemaining"
                v-model="formData.cashoutRemaining"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                for="cashoutRemaining"
                class="text-sm text-gray-700 max-md:text-xs"
              >
                {{ $t("cashout_remaining_balance") }}
              </label>
            </div>

            <!-- CashOut Info (Show if cashoutRemaining checked and has kiosk balance) -->
            <div
              v-if="
                formData.cashoutRemaining &&
                selectedKioskInfo &&
                cashoutAmount > 0
              "
              class="p-3 bg-orange-50 border border-orange-200 rounded-lg max-md:p-2"
            >
              <div class="text-sm max-md:text-xs">
                <div class="flex justify-between mb-1">
                  <span class="text-gray-600">{{ $t("kiosk_balance") }}:</span>
                  <span class="font-semibold text-gray-800">
                    - {{ formatAmount(selectedKioskInfo.balance) }}
                    {{ $t("points") }}
                  </span>
                </div>

                <div
                  class="flex justify-between pt-2 border-t border-orange-200 mt-2"
                >
                  <div class="w-full flex flex-col">
                    <div class="flex justify-between w-full">
                      <span class="text-gray-700 font-medium"
                        >{{ $t("actual_withdraw") }}:</span
                      >
                      <span class="font-bold text-red-600">
                        {{ currency }}
                        {{ formatAmount(actualWithdrawAmountWithMultiplier) }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-700 font-medium"
                        >{{ $t("cashout_amount") }}:</span
                      >
                      <span class="font-bold text-red-600">
                        {{ currency }} {{ formatAmount(cashoutAmount) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CashOut Remark (Show if cashoutRemaining checked and has cashout) -->
            <div v-if="formData.cashoutRemaining && cashoutAmount > 0">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("cashout_remark") }}
              </label>
              <input
                v-model="formData.cashoutRemark"
                type="text"
                :placeholder="$t('enter_cashout_remark')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- CashOut Remark (Show if cashoutAmount > 0) -->
            <div v-if="formData.cashoutAmount > 0">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("cashout_remark") }}
              </label>
              <input
                v-model="formData.cashoutRemark"
                type="text"
                :placeholder="$t('enter_cashout_remark')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Actual Withdraw Info (Show if cashoutAmount > 0) -->
            <div
              v-if="formData.cashoutAmount > 0 && formData.amount"
              class="p-3 bg-orange-50 border border-orange-200 rounded-lg max-md:p-2"
            >
              <div class="text-sm max-md:text-xs">
                <div class="flex justify-between mb-1">
                  <span class="text-gray-600"
                    >{{ $t("withdraw_amount") }}:</span
                  >
                  <span class="font-semibold text-gray-800">
                    {{ currency }} {{ formatAmount(formData.amount) }}
                  </span>
                </div>
                <div class="flex justify-between mb-1">
                  <span class="text-gray-600">{{ $t("cashout_amount") }}:</span>
                  <span class="font-semibold text-red-600">
                    - {{ currency }} {{ formatAmount(formData.cashoutAmount) }}
                  </span>
                </div>
                <div
                  class="flex justify-between pt-2 border-t border-orange-200 mt-2"
                >
                  <span class="text-gray-700 font-medium"
                    >{{ $t("actual_withdraw_amount") }}:</span
                  >
                  <span class="font-bold text-orange-600">
                    {{ currency }} {{ formatAmount(actualWithdrawAmount) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bank Select -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("bank_name") }} <span class="text-red-500">*</span>
              </label>
              <CustomSelect v-model="formData.bankId" required>
                <option value="" disabled>{{ $t("select_bank") }}</option>
                <option
                  v-for="bank in bankList"
                  :key="bank._id"
                  :value="bank._id"
                >
                  {{ bank.bankname }} - {{ bank.ownername }} -
                  {{ bank.bankaccount }}
                </option>
              </CustomSelect>
            </div>

            <!-- Remark (Optional) -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("remark") }}
              </label>
              <input
                v-model="formData.remark"
                type="text"
                :placeholder="$t('remark')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              />
            </div>
          </form>
        </div>

        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            @click="closeModal"
            :disabled="isLoading"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-100 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg lg:hover:bg-orange-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("confirm_withdraw") }}
          </LoadingButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  userData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  if (!isLoading.value) {
    closeModal();
  }
});

const { get, post, patch } = useApiEndpoint();
const currency = useCurrency();
const isLoading = ref(false);
const isLoadingBalances = ref(false);
const isLoadingBanks = ref(false);
const kioskListWithBalances = ref([]);
const bankList = ref([]);

const formData = ref({
  amount: "",
  kioskId: "",
  bankId: "",
  remark: "",
  cashoutRemaining: false,
  cashoutRemark: "",
  customKioskName: "",
});

const cashoutAmount = computed(() => {
  if (!formData.value.cashoutRemaining || !selectedKioskInfo.value) return 0;
  const kioskBalance = Number(selectedKioskInfo.value.balance) || 0;
  const withdrawAmount = Number(formData.value.amount) || 0;
  const remainingBalance = Math.max(0, kioskBalance - withdrawAmount);
  return remainingBalance * transferMultiplier.value;
});

const actualWithdrawAmount = computed(() => {
  const amount = Number(formData.value.amount) || 0;
  const cashout = Number(formData.value.cashoutAmount) || 0;
  return Math.max(0, amount - cashout);
});

const processCashout = async () => {
  if (cashoutAmount.value <= 0) return { success: true };
  try {
    const { data } = await patch(`user/cashout/${props.userData?._id}`, {
      amount: cashoutAmount.value,
      remark: formData.value.cashoutRemark,
      kioskName: selectedKioskInfo.value?.name,
    });
    return data;
  } catch (error) {
    console.error("Error processing cashout:", error);
    return { success: false, error };
  }
};

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "0.00";
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const selectedKioskInfo = computed(() => {
  if (!formData.value.kioskId) return null;
  return kioskListWithBalances.value.find(
    (k) => k._id === formData.value.kioskId
  );
});

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    await Swal.fire({
      icon: "success",
      title: $t("copied"),
      text: text,
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const fetchAllKioskBalances = async () => {
  isLoadingBalances.value = true;
  try {
    const { data } = await post("kiosk/check-all-balances", {
      userId: props.userData?._id,
    });

    if (data.success) {
      kioskListWithBalances.value = data.data
        .filter((kiosk) => kiosk.transferOutAPI)
        .map((kiosk) => ({
          ...kiosk,
          isLoadingBalance: false,
        }));
    }
  } catch (error) {
    console.error("Error fetching kiosk balances:", error);
  } finally {
    isLoadingBalances.value = false;
  }
};

const fetchBankList = async () => {
  try {
    const { data } = await get("banklist");
    if (data.success) {
      bankList.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching bank list:", error);
  }
};

const transferMultiplier = computed(() => {
  if (!selectedKioskInfo.value) return 1;
  const kioskName = selectedKioskInfo.value.name?.toLowerCase() || "";
  if (kioskName.includes("x5")) return 5;
  if (kioskName.includes("x2")) return 2;
  return 1;
});

const actualWithdrawAmountWithMultiplier = computed(() => {
  return Number(formData.value.amount || 0) * transferMultiplier.value;
});

const handleSubmit = async () => {
  if (!formData.value.amount || formData.value.amount <= 0) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_enter_valid_amount"),
    });
    return;
  }

  if (!formData.value.kioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_select_kiosk"),
    });
    return;
  }

  if (!formData.value.bankId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_select_bank"),
    });
    return;
  }

  const isWithoutKiosk = formData.value.kioskId === "without_kiosk";
  const selectedKiosk = isWithoutKiosk ? null : selectedKioskInfo.value;
  const selectedBank = bankList.value.find(
    (b) => b._id === formData.value.bankId
  );

  if (!isWithoutKiosk && !selectedKiosk?.userKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("user_not_registered_kiosk"),
    });
    return;
  }

  // Validate withdraw amount <= kiosk balance
  if (
    !isWithoutKiosk &&
    Number(formData.value.amount) > Number(selectedKiosk.balance)
  ) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("withdraw_exceeds_balance"),
    });
    return;
  }

  // Calculate transfer out amount (full balance if cashout, else just withdraw amount)
  const transferOutAmount = isWithoutKiosk
    ? 0
    : formData.value.cashoutRemaining
    ? Number(selectedKiosk.balance)
    : Number(formData.value.amount);

  try {
    const result = await Swal.fire({
      title: $t("confirm_withdraw"),
      html: `
        <div class="text-left">
          <p><strong>${$t("userid")}:</strong> ${props.userData?.userid}</p>
          ${
            !isWithoutKiosk
              ? `<p><strong>${$t("gameid")}:</strong> ${
                  selectedKiosk.userKioskId
                }</p>`
              : ""
          }
          ${
            !isWithoutKiosk
              ? `<p><strong>${$t("kiosk_balance")}:</strong> ${
                  currency.value
                } ${formatAmount(selectedKiosk.balance)}</p>`
              : ""
          }
          ${
            !isWithoutKiosk
              ? `<p><strong>${$t("transfer_out_amount")}:</strong> ${
                  currency.value
                } ${formatAmount(transferOutAmount)}</p>`
              : ""
          }
          <p><strong>${$t("withdraw_amount")}:</strong> ${
        currency.value
      } ${formatAmount(
        isWithoutKiosk
          ? formData.value.amount
          : actualWithdrawAmountWithMultiplier.value
      )}</p>
          ${
            !isWithoutKiosk && transferMultiplier.value > 1
              ? `<p><strong>${$t("multiplier")}:</strong> x${
                  transferMultiplier.value
                }</p>`
              : ""
          }
          ${
            !isWithoutKiosk && cashoutAmount.value > 0
              ? `<p><strong>${$t("cashout_amount")}:</strong> ${
                  currency.value
                } ${formatAmount(cashoutAmount.value)}</p>`
              : ""
          }
          <p><strong>${$t("kiosk")}:</strong> ${
        isWithoutKiosk
          ? formData.value.customKioskName || $t("without_kiosk")
          : selectedKiosk.name
      }</p>
          <p><strong>${$t("bank")}:</strong> ${selectedBank?.bankname} - ${
        selectedBank?.ownername
      }</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isLoading.value = true;

    // Step 1: Call Kiosk Transfer Out API (full balance if cashout remaining)
    if (!isWithoutKiosk) {
      const transferResponse = await post(
        `${selectedKiosk.transferOutAPI}/${props.userData?._id}`,
        {
          transferAmount: transferOutAmount,
        }
      );

      if (!transferResponse.data.success) {
        await Swal.fire({
          icon: "error",
          title: $t("error"),
          text:
            transferResponse.data.message?.[$locale.value] ||
            transferResponse.data.message?.en ||
            $t("kiosk_transfer_failed"),
        });
        isLoading.value = false;
        return;
      }
    }

    // Step 2: Process CashOut if any
    if (!isWithoutKiosk && cashoutAmount.value > 0) {
      const cashoutResult = await processCashout();
      if (!cashoutResult.success) {
        await Swal.fire({
          icon: "error",
          title: $t("error"),
          text:
            cashoutResult.message?.[$locale.value] ||
            cashoutResult.message?.en ||
            $t("cashout_failed"),
        });
        isLoading.value = false;
        return;
      }
    }

    // Step 3: Submit and auto-approve withdraw (only withdraw amount)
    const { data } = await post("admin-direct-withdraw", {
      userId: props.userData?._id,
      username: props.userData?.username,
      amount: isWithoutKiosk
        ? Number(formData.value.amount)
        : Number(actualWithdrawAmountWithMultiplier.value),
      kioskId: isWithoutKiosk ? null : formData.value.kioskId,
      kioskName: isWithoutKiosk
        ? formData.value.customKioskName || "-"
        : selectedKiosk.name,
      userKioskId: isWithoutKiosk ? "-" : selectedKiosk.userKioskId,
      bankId: formData.value.bankId,
      remark: formData.value.remark,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message?.[$locale.value] || data.message?.en,
        timer: 1500,
      });
      emit("success");
      closeModal();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message?.[$locale.value] || data.message?.en,
      });
    }
  } catch (error) {
    console.error("Error processing withdraw:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  formData.value = {
    amount: "",
    kioskId: "",
    bankId: "",
    remark: "",
    cashoutRemaining: false,
    cashoutRemark: "",
    customKioskName: "",
  };
  kioskListWithBalances.value = [];
  bankList.value = [];
  emit("update:show", false);
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      fetchAllKioskBalances();
      fetchBankList();
    }
  }
);
</script>

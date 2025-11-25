<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <PageLoading v-if="isPageLoading" />
      <div
        class="bg-white rounded-lg w-full max-w-md shadow-xl max-h-[80vh] overflow-auto"
      >
        <div class="flex items-center justify-between p-4 border-b max-md:p-3">
          <h3 class="text-lg font-medium max-md:text-base">
            {{ $t("withdraw_approval") }}
          </h3>
        </div>
        <div class="p-6 max-md:p-4">
          <div
            class="mb-4 border p-3 rounded bg-gray-50 max-md:mb-3 max-md:p-2"
          >
            <p class="text-sm font-medium text-gray-700 max-md:text-xs">
              {{ $t("withdraw_amount") }}: {{ currency }} {{ withdrawAmount }}
            </p>
            <p
              class="text-sm text-gray-600 mt-1 max-md:text-xs max-md:mt-0.5"
              v-if="cashoutAmount > 0"
            >
              {{ $t("actual_withdraw_amount") }}: {{ currency }}
              {{ formatAmount(withdrawAmount - cashoutAmount) }}
            </p>
          </div>
          <div class="mb-4 max-md:mb-3">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("cashout_amount") }} ({{ $t("optional") }})
            </label>
            <div class="flex flex-col">
              <input
                v-model.number="cashoutAmount"
                type="number"
                min="0"
                :max="withdrawAmount"
                step="0.01"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                placeholder="0.00"
              />
              <p
                class="text-xs text-gray-500 mt-1 max-md:text-[10px] max-md:mt-0.5"
              >
                {{ $t("cashout_explanation") }}
              </p>
            </div>
          </div>
          <div v-if="cashoutAmount > 0" class="mb-4 max-md:mb-3">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("cashout_remark") }}
            </label>
            <textarea
              v-model="cashoutRemark"
              rows="2"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_cashout_remark')"
            ></textarea>
          </div>
          <div class="mb-4 max-md:mb-3">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("select_bank_account") }}
            </label>
            <CustomSelect v-model="selectedBank">
              <option value="" disabled>{{ $t("choose_a_bank") }}</option>
              <option v-for="bank in banks" :key="bank._id" :value="bank._id">
                {{ bank.bankname }} - {{ bank.ownername }} -
                {{ $t("balance") }}: {{ currency }}
                {{ formatAmount(bank.currentbalance) }}
              </option>
            </CustomSelect>
          </div>

          <div v-if="paymentGateways.length > 0" class="mb-4 max-md:mb-3">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("select_payment_gateway") }} ({{ $t("optional") }})
            </label>
            <CustomSelect v-model="selectedPaymentGateway">
              <option value="">{{ $t("manual_withdraw") }}</option>
              <option
                v-for="gateway in paymentGateways"
                :key="gateway._id"
                :value="gateway._id"
              >
                {{ gateway.name }}
              </option>
            </CustomSelect>
          </div>

          <div
            v-if="selectedPaymentGateway && availableBankCodes.length > 0"
            class="mb-4 max-md:mb-3"
          >
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("select_withdraw_bank") }}
            </label>
            <CustomSelect v-model="selectedBankCode">
              <option value="" disabled>{{ $t("choose_a_bank") }}</option>
              <option
                v-for="bankCode in availableBankCodes"
                :key="bankCode.bankcode"
                :value="bankCode.bankcode"
              >
                {{ bankCode.bankname }} ({{ bankCode.bankcode }})
              </option>
            </CustomSelect>
          </div>

          <div
            v-if="selectedPaymentGateway"
            class="mb-4 border p-3 rounded bg-blue-50 max-md:mb-3 max-md:p-2"
          >
            <p class="text-sm font-medium text-gray-700 mb-2 max-md:text-xs">
              {{ $t("user_bank_info") }}
            </p>
            <div class="space-y-2 max-md:space-y-1.5">
              <div>
                <label class="block text-xs text-gray-600 mb-1">
                  {{ $t("bank_name") }}
                </label>
                <input
                  type="text"
                  :value="userBankName"
                  disabled
                  class="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">
                  {{ $t("account_holder") }}
                </label>
                <input
                  v-model="accountHolder"
                  type="text"
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  :placeholder="$t('enter_account_holder')"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">
                  {{ $t("account_number") }}
                </label>
                <input
                  v-model="accountNumber"
                  type="text"
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  :placeholder="$t('enter_account_number')"
                />
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2 max-md:text-[10px]">
              {{ $t("withdraw_limit") }}: {{ currency }}
              {{ selectedGateway.minWithdraw || 0 }} - {{ currency }}
              {{ selectedGateway.maxWithdraw || 0 }}
            </p>
          </div>

          <div
            v-if="validationError"
            class="text-red-500 text-sm mb-4 max-md:text-xs max-md:mb-3"
          >
            {{ validationError }}
          </div>
        </div>
        <div
          class="flex justify-end gap-2 px-6 py-4 bg-gray-50 rounded-b-lg max-md:px-4 max-md:py-3 max-md:flex-col-reverse"
        >
          <button
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isButtonLoading"
            @click="handleConfirm"
            :disabled="!selectedBank || !isValidSubmit"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md lg:hover:bg-indigo-700 disabled:bg-gray-400 disabled:hover:bg-gray-400 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            {{ $t("confirm") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { formatAmount } from "~/utils/amountFormatter";
const currency = useCurrency();
const props = defineProps({
  modelValue: Boolean,
  withdrawId: String,
  withdrawAmount: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    required: true,
  },
  userBankName: {
    type: String,
    default: "",
  },
  userAccountNumber: {
    type: String,
    default: "",
  },
  userFullname: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:modelValue", "confirm"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  resetForm();
  emit("update:modelValue", false);
});
const isButtonLoading = ref(false);
const isPageLoading = ref(true);
const { get, patch, post, publicGet } = useApiEndpoint();
const banks = ref([]);
const selectedBank = ref("");
const cashoutAmount = ref(0);
const cashoutRemark = ref("");
const validationError = ref("");
const paymentGateways = ref([]);
const selectedPaymentGateway = ref("");
const selectedBankCode = ref("");
const accountHolder = ref("");
const accountNumber = ref("");

const availableBankCodes = computed(() => {
  if (!selectedPaymentGateway.value) return [];
  const gateway = paymentGateways.value.find(
    (g) => g._id === selectedPaymentGateway.value
  );
  if (!gateway || !gateway.availableBankCodes) return [];
  return gateway.availableBankCodes.filter((code) => code.active === true);
});

const selectedGateway = computed(() => {
  if (!selectedPaymentGateway.value) return null;
  return paymentGateways.value.find(
    (g) => g._id === selectedPaymentGateway.value
  );
});

const selectedBankCodeDetails = computed(() => {
  if (!selectedBankCode.value) return null;
  return availableBankCodes.value.find(
    (code) => code.bankcode === selectedBankCode.value
  );
});

const isValidSubmit = computed(() => {
  if (!selectedBank.value) return false;
  if (cashoutAmount.value < 0) return false;
  if (cashoutAmount.value >= props.withdrawAmount) return false;
  if (selectedPaymentGateway.value && !selectedBankCode.value) return false;
  return true;
});

watch(selectedPaymentGateway, () => {
  selectedBankCode.value = "";
});

const fetchBanks = async () => {
  try {
    const { data } = await get("banklist");
    if (data.success) {
      banks.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
  }
};

const fetchPaymentGateways = async () => {
  try {
    const { data } = await publicGet("payment-gateways");
    if (data.success) {
      paymentGateways.value = data.data.filter(
        (gateway) => gateway.status === true && gateway.autowithdraw === true
      );
    }
  } catch (error) {
    console.error("Error fetching payment gateways:", error);
  }
};

const processCashout = async () => {
  if (cashoutAmount.value <= 0) return { success: true };
  try {
    const { data } = await patch(`user/cashout/${props.userId}`, {
      amount: cashoutAmount.value,
      remark: cashoutRemark.value || "Partial withdraw processed as cashout",
    });
    return data;
  } catch (error) {
    console.error("Error processing cashout:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
    return { success: false };
  }
};

const processAutoWithdraw = async () => {
  if (!selectedGateway.value || !selectedBankCodeDetails.value) {
    return { success: false };
  }
  try {
    const withdrawAPI = selectedGateway.value.withdrawAPI;
    const actualAmount = props.withdrawAmount - cashoutAmount.value;
    const { data } = await post(`${withdrawAPI}/${props.userId}`, {
      amount: actualAmount,
      bankCode: selectedBankCodeDetails.value.bankcode,
      accountHolder: accountHolder.value,
      accountNumber: accountNumber.value,
      bankName: selectedBankCodeDetails.value.bankname,
      transactionId: props.transactionId,
    });

    return data;
  } catch (error) {
    console.error("Error processing auto withdraw:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("auto_withdraw_failed"),
    });
    return { success: false };
  }
};

const resetForm = () => {
  cashoutAmount.value = 0;
  cashoutRemark.value = "";
  selectedBank.value = "";
  selectedPaymentGateway.value = "";
  selectedBankCode.value = "";
  validationError.value = "";
  accountHolder.value = "";
  accountNumber.value = "";
};

const handleConfirm = async () => {
  isButtonLoading.value = true;
  validationError.value = "";
  try {
    if (cashoutAmount.value < 0) {
      validationError.value = $t("cashout_amount_invalid");
      isButtonLoading.value = false;
      return;
    }
    if (cashoutAmount.value >= props.withdrawAmount) {
      validationError.value = $t("cashout_amount_too_large");
      isButtonLoading.value = false;
      return;
    }

    if (selectedPaymentGateway.value && selectedBankCode.value) {
      const actualAmount = props.withdrawAmount - cashoutAmount.value;
      const gateway = selectedGateway.value;

      if (gateway.minWithdraw && actualAmount < gateway.minWithdraw) {
        validationError.value = $t("withdraw_below_minimum", {
          min: gateway.minWithdraw,
        });
        isButtonLoading.value = false;
        return;
      }

      if (gateway.maxWithdraw && actualAmount > gateway.maxWithdraw) {
        validationError.value = $t("withdraw_above_maximum", {
          max: gateway.maxWithdraw,
        });
        isButtonLoading.value = false;
        return;
      }

      const autoWithdrawResult = await processAutoWithdraw();
      if (!autoWithdrawResult.success) {
        validationError.value =
          autoWithdrawResult.message || $t("auto_withdraw_failed");
        isButtonLoading.value = false;
        return;
      }
    }

    emit("confirm", {
      withdrawId: props.withdrawId,
      bankId: selectedBank.value,
      cashoutAmount: cashoutAmount.value,
      paymentGatewayId: selectedPaymentGateway.value || null,
      bankCode: selectedBankCode.value || null,
    });
    cashoutAmount.value = 0;
    cashoutRemark.value = "";
    selectedBank.value = "";
    selectedPaymentGateway.value = "";
    selectedBankCode.value = "";
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Error in confirmation:", error);
    validationError.value = $t("general_error");
  } finally {
    isButtonLoading.value = false;
  }
};

const handleKeydown = (event) => {
  if (
    event.code === "Space" &&
    props.modelValue &&
    selectedBank.value &&
    isValidSubmit.value &&
    !isButtonLoading.value
  ) {
    event.preventDefault();
    handleConfirm();
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      accountHolder.value = props.userFullname;
      accountNumber.value = props.userAccountNumber;
    }
  }
);

onMounted(async () => {
  await Promise.all([fetchBanks(), fetchPaymentGateways()]);
  isPageLoading.value = false;
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

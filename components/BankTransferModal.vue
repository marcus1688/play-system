<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] max-w-full">
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("transfer_between_banks") }}
            </h2>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <!-- From Bank -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("from_bank") }}
              </label>
              <CustomSelect v-model="formData.fromBankId" required>
                <option value="" disabled>{{ $t("select_bank") }}</option>
                <option
                  v-for="bank in availableFromBanks"
                  :key="bank._id"
                  :value="bank._id"
                >
                  {{ bank.bankname }} - {{ bank.ownername }} ({{ currency }}
                  {{ formatAmount(bank.currentbalance) }})
                </option>
              </CustomSelect>
              <p
                v-if="selectedFromBank"
                class="text-sm text-gray-500 mt-1 max-md:text-xs"
              >
                {{ $t("available_balance") }}: {{ currency }}
                {{ formatAmount(selectedFromBank.currentbalance) }}
              </p>
            </div>

            <!-- To Bank -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("to_bank") }}
              </label>
              <CustomSelect v-model="formData.toBankId" required>
                <option value="" disabled>{{ $t("select_bank") }}</option>
                <option
                  v-for="bank in availableToBanks"
                  :key="bank._id"
                  :value="bank._id"
                >
                  {{ bank.bankname }} - {{ bank.ownername }} ({{ currency }}
                  {{ formatAmount(bank.currentbalance) }})
                </option>
              </CustomSelect>
            </div>

            <!-- Amount -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("amount") }}
              </label>
              <input
                v-model.number="formData.amount"
                type="number"
                required
                min="0.01"
                step="0.01"
                :max="selectedFromBank?.currentbalance || 0"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Remark -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("remark") }}
              </label>
              <textarea
                v-model="formData.remark"
                rows="2"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                :placeholder="$t('transfer_remark_placeholder')"
              ></textarea>
            </div>
          </form>
        </div>

        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            type="button"
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("confirm_transfer") }}
          </LoadingButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { formatAmount } from "~/utils/amountFormatter";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  banks: {
    type: Array,
    default: () => [],
  },
  defaultFromBank: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});

const { post } = useApiEndpoint();
const currency = useCurrency();
const isLoading = ref(false);

const formData = ref({
  fromBankId: "",
  toBankId: "",
  amount: "",
  remark: "",
});

const selectedFromBank = computed(() => {
  return props.banks.find((bank) => bank._id === formData.value.fromBankId);
});

const availableFromBanks = computed(() => {
  return props.banks.filter((bank) => bank._id !== formData.value.toBankId);
});

const availableToBanks = computed(() => {
  return props.banks.filter((bank) => bank._id !== formData.value.fromBankId);
});

const handleSubmit = async () => {
  if (!formData.value.fromBankId || !formData.value.toBankId) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("please_select_both_banks"),
    });
    return;
  }

  if (formData.value.fromBankId === formData.value.toBankId) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("cannot_transfer_same_bank"),
    });
    return;
  }

  if (!formData.value.amount || formData.value.amount <= 0) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("please_enter_valid_amount"),
    });
    return;
  }

  if (formData.value.amount > selectedFromBank.value.currentbalance) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("amount_exceeds_balance"),
    });
    return;
  }

  try {
    isLoading.value = true;

    const fromBank = selectedFromBank.value;
    const toBank = props.banks.find(
      (bank) => bank._id === formData.value.toBankId
    );
    const transferRemark =
      formData.value.remark ||
      `Transfer from ${fromBank.bankname} to ${toBank.bankname}`;

    // Step 1: Cash Out from source bank
    const cashOutResponse = await post("cashout", {
      id: formData.value.fromBankId,
      amount: formData.value.amount,
      remark: transferRemark,
    });

    if (!cashOutResponse.data.success) {
      throw new Error(
        cashOutResponse.data.message[$locale.value] ||
          cashOutResponse.data.message.en ||
          "Cash out failed"
      );
    }

    // Step 2: Cash In to destination bank
    const cashInResponse = await post("cashin", {
      id: formData.value.toBankId,
      amount: formData.value.amount,
      remark: transferRemark,
    });

    if (!cashInResponse.data.success) {
      await post("cashin", {
        id: formData.value.fromBankId,
        amount: formData.value.amount,
        remark: `Rollback: ${transferRemark}`,
      });

      throw new Error(
        cashInResponse.data.message[$locale.value] ||
          cashInResponse.data.message.en ||
          "Cash in failed"
      );
    }

    await Swal.fire({
      icon: "success",
      title: $t("success"),
      text: $t("transfer_success_message"),
      timer: 1500,
    });

    emit("success");
    emit("update:show", false);
  } catch (error) {
    console.error("Transfer error:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: error.message || $t("transfer_failed"),
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      formData.value = {
        fromBankId: props.defaultFromBank?._id || "",
        toBankId: "",
        amount: "",
        remark: "",
      };
    }
  }
);
</script>

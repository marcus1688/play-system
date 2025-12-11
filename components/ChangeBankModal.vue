<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("change_bank") }}
            </h2>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <!-- Transaction Info -->
          <div
            class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-md:p-3 max-md:mb-3"
          >
            <div class="space-y-2 text-sm max-md:text-xs">
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t("transaction_id") }}:</span>
                <span class="font-semibold text-gray-800">{{
                  transactionData?.transactionId
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t("type") }}:</span>
                <span
                  class="font-semibold uppercase"
                  :class="
                    transactionData?.transactionType === 'deposit'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  "
                >
                  {{ transactionData?.transactionType }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t("amount") }}:</span>
                <span class="font-semibold text-gray-800">
                  {{ currency }}
                  {{
                    formatAmount(
                      transactionData?.bankAmount || transactionData?.amount
                    )
                  }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ $t("current_bank") }}:</span>
                <span class="font-semibold text-red-600">
                  {{ transactionData?.bankname }} -
                  {{ transactionData?.ownername }} -
                  {{ transactionData?.transfernumber }}
                </span>
              </div>
            </div>
          </div>

          <!-- New Bank Select -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("select_new_bank") }} <span class="text-red-500">*</span>
            </label>
            <CustomSelect v-model="newBankId" required>
              <option value="" disabled>{{ $t("select_bank") }}</option>
              <option
                v-for="bank in availableBanks"
                :key="bank._id"
                :value="bank._id"
              >
                {{ bank.bankname }} - {{ bank.ownername }} -
                {{ bank.bankaccount }}
                ({{ $t("balance") }}: {{ currency }}
                {{ formatAmount(bank.currentbalance) }})
              </option>
            </CustomSelect>

            <!-- New Bank Info -->
            <div
              v-if="selectedNewBank"
              class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg max-md:p-2"
            >
              <div class="text-sm max-md:text-xs">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t("new_bank") }}:</span>
                  <span class="font-bold text-green-600">
                    {{ selectedNewBank.bankname }}
                  </span>
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-gray-600">{{ $t("owner_name") }}:</span>
                  <span class="font-semibold text-gray-800">
                    {{ selectedNewBank.ownername }}
                  </span>
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-gray-600"
                    >{{ $t("current_balance") }}:</span
                  >
                  <span class="font-semibold text-gray-800">
                    {{ currency }}
                    {{ formatAmount(selectedNewBank.currentbalance) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("confirm_change") }}
          </LoadingButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  transactionData: {
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

const { get, post } = useApiEndpoint();
const currency = useCurrency();
const isLoading = ref(false);
const bankList = ref([]);
const newBankId = ref("");

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "0.00";
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const availableBanks = computed(() => {
  return bankList.value.filter(
    (bank) => bank._id !== props.transactionData?.bankid
  );
});

const selectedNewBank = computed(() => {
  if (!newBankId.value) return null;
  return bankList.value.find((b) => b._id === newBankId.value);
});

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

const handleSubmit = async () => {
  if (!newBankId.value) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_select_bank"),
    });
    return;
  }

  try {
    const result = await Swal.fire({
      title: $t("confirm_change_bank"),
      html: `
        <div class="text-left">
          <p><strong>${$t("from")}:</strong> ${
        props.transactionData?.bankname
      }</p>
          <p><strong>${$t("to")}:</strong> ${
        selectedNewBank.value?.bankname
      } - ${selectedNewBank.value?.ownername}</p>
          <p><strong>${$t("amount")}:</strong> ${currency.value} ${formatAmount(
        props.transactionData?.bankAmount || props.transactionData?.amount
      )}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isLoading.value = true;

    const { data } = await post("change-transaction-bank", {
      transactionId: props.transactionData?.transactionId,
      transactionType: props.transactionData?.transactionType,
      newBankId: newBankId.value,
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
    console.error("Error changing bank:", error);
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
  newBankId.value = "";
  bankList.value = [];
  emit("update:show", false);
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      fetchBankList();
    }
  }
);
</script>

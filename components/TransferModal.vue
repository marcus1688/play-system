<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div class="w-2 h-8 bg-blue-600 rounded-full max-md:h-6"></div>
              <h2 class="text-xl font-semibold max-md:text-lg">
                {{ $t("transfer_between_kiosk") }}
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
            <div class="grid grid-cols-3 max-lg:grid-cols-1 gap-4 max-md:gap-2">
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
              <div>
                <div class="text-sm text-gray-500 max-md:text-xs">
                  {{ $t("wallet") }}
                </div>
                <div class="font-semibold text-gray-800 max-md:text-sm">
                  {{ currency }} {{ formatAmount(userData?.wallet) }}
                </div>
              </div>
            </div>
          </div>

          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <!-- From Kiosk (Transfer Out) -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("from_kiosk") }} <span class="text-red-500">*</span>
              </label>
              <CustomSelect v-model="formData.fromKioskId" required>
                <option value="" disabled>{{ $t("select_kiosk") }}</option>
                <option
                  v-for="kiosk in fromKioskList"
                  :key="kiosk._id"
                  :value="kiosk._id"
                >
                  {{ kiosk.name }} - {{ $t("balance") }}:
                  {{ formatAmount(kiosk.balance) }}
                </option>
              </CustomSelect>

              <!-- From Kiosk Info -->
              <div
                v-if="selectedFromKiosk"
                class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg max-md:p-2"
              >
                <div
                  class="flex items-center justify-between text-sm max-md:text-xs"
                >
                  <div>
                    <span class="text-gray-600">{{ $t("balance") }}:</span>
                    <span class="font-bold text-red-600 ml-1">
                      {{ formatAmount(selectedFromKiosk.balance) }}
                      {{ $t("points") }}
                    </span>
                    <span
                      v-if="fromKioskMultiplier > 1"
                      class="text-gray-500 ml-1"
                    >
                      (x{{ fromKioskMultiplier }})
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-600">{{ $t("gameid") }}:</span>
                    <span
                      class="font-bold"
                      :class="
                        selectedFromKiosk.userKioskId
                          ? 'text-gray-800'
                          : 'text-red-500'
                      "
                    >
                      {{
                        selectedFromKiosk.userKioskId || $t("not_registered")
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transfer Arrow -->
            <div class="flex justify-center">
              <Icon
                icon="material-symbols:arrow-downward"
                class="w-8 h-8 text-blue-600"
              />
            </div>

            <!-- To Kiosk (Transfer In) -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("to_kiosk") }} <span class="text-red-500">*</span>
              </label>
              <CustomSelect v-model="formData.toKioskId" required>
                <option value="" disabled>{{ $t("select_kiosk") }}</option>
                <option
                  v-for="kiosk in toKioskList"
                  :key="kiosk._id"
                  :value="kiosk._id"
                  :disabled="kiosk._id === formData.fromKioskId"
                >
                  {{ kiosk.name }} - {{ $t("balance") }}:
                  {{ formatAmount(kiosk.balance) }}
                </option>
              </CustomSelect>

              <!-- To Kiosk Info -->
              <div
                v-if="selectedToKiosk"
                class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg max-md:p-2"
              >
                <div
                  class="flex items-center justify-between text-sm max-md:text-xs"
                >
                  <div>
                    <span class="text-gray-600">{{ $t("balance") }}:</span>
                    <span class="font-bold text-green-600 ml-1">
                      {{ formatAmount(selectedToKiosk.balance) }}
                      {{ $t("points") }}
                    </span>
                    <span
                      v-if="toKioskMultiplier > 1"
                      class="text-gray-500 ml-1"
                    >
                      (x{{ toKioskMultiplier }})
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-600">{{ $t("gameid") }}:</span>
                    <span
                      class="font-bold"
                      :class="
                        selectedToKiosk.userKioskId
                          ? 'text-gray-800'
                          : 'text-red-500'
                      "
                    >
                      {{ selectedToKiosk.userKioskId || $t("not_registered") }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amount -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("transfer_amount") }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.amount"
                type="number"
                step="0.01"
                min="0"
                :max="selectedFromKiosk?.balance || 0"
                :placeholder="$t('enter_amount')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                required
              />
            </div>

            <!-- Transfer Summary -->
            <div
              v-if="formData.amount && selectedFromKiosk && selectedToKiosk"
              class="p-3 bg-blue-50 border border-blue-200 rounded-lg max-md:p-2"
            >
              <div class="text-sm max-md:text-xs">
                <div class="flex justify-between mb-1">
                  <span class="text-gray-600">{{ $t("from") }}:</span>
                  <span class="font-semibold text-red-600">
                    {{ selectedFromKiosk.name }} (-
                    {{ formatAmount(actualTransferOutAmount) }}
                    {{ $t("points") }})
                  </span>
                </div>
                <div class="flex justify-between mb-1">
                  <span class="text-gray-600">{{ $t("to") }}:</span>
                  <span class="font-semibold text-green-600">
                    {{ selectedToKiosk.name }} (+
                    {{ formatAmount(actualTransferInAmount) }}
                    {{ $t("points") }})
                  </span>
                </div>
                <div
                  v-if="fromKioskMultiplier !== toKioskMultiplier"
                  class="flex justify-between pt-2 border-t border-blue-200 mt-2"
                >
                  <span class="text-gray-600">{{ $t("actual_value") }}:</span>
                  <span class="font-bold text-blue-600">
                    {{ currency }} {{ formatAmount(actualTransferValue) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Remark -->
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
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
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
            class="px-4 py-2 bg-blue-600 text-white rounded-lg lg:hover:bg-blue-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("confirm_transfer") }}
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

const { post } = useApiEndpoint();
const currency = useCurrency();
const isLoading = ref(false);
const isLoadingBalances = ref(false);
const kioskListWithBalances = ref([]);

const formData = ref({
  fromKioskId: "",
  toKioskId: "",
  amount: "",
  remark: "",
});

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "0.00";
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// From Kiosk list (must have transferOutAPI)
const fromKioskList = computed(() => {
  return kioskListWithBalances.value.filter((kiosk) => kiosk.transferOutAPI);
});

// To Kiosk list (must have transferInAPI)
const toKioskList = computed(() => {
  return kioskListWithBalances.value.filter((kiosk) => kiosk.transferInAPI);
});

const selectedFromKiosk = computed(() => {
  if (!formData.value.fromKioskId) return null;
  return kioskListWithBalances.value.find(
    (k) => k._id === formData.value.fromKioskId
  );
});

const selectedToKiosk = computed(() => {
  if (!formData.value.toKioskId) return null;
  return kioskListWithBalances.value.find(
    (k) => k._id === formData.value.toKioskId
  );
});

const fetchAllKioskBalances = async () => {
  isLoadingBalances.value = true;
  try {
    const { data } = await post("kiosk/check-all-balances", {
      userId: props.userData?._id,
    });

    if (data.success) {
      kioskListWithBalances.value = data.data.map((kiosk) => ({
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

const fromKioskMultiplier = computed(() => {
  if (!selectedFromKiosk.value) return 1;
  const kioskName = selectedFromKiosk.value.name?.toLowerCase() || "";
  if (kioskName.includes("x5")) return 5;
  if (kioskName.includes("x2")) return 2;
  return 1;
});

const toKioskMultiplier = computed(() => {
  if (!selectedToKiosk.value) return 1;
  const kioskName = selectedToKiosk.value.name?.toLowerCase() || "";
  if (kioskName.includes("x5")) return 5;
  if (kioskName.includes("x2")) return 2;
  return 1;
});

const actualTransferOutAmount = computed(() => {
  return Number(formData.value.amount || 0);
});

const actualTransferInAmount = computed(() => {
  const baseAmount = actualTransferOutAmount.value * fromKioskMultiplier.value;
  return baseAmount / toKioskMultiplier.value;
});

const actualTransferValue = computed(() => {
  return actualTransferOutAmount.value * fromKioskMultiplier.value;
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

  if (!formData.value.fromKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_select_from_kiosk"),
    });
    return;
  }

  if (!formData.value.toKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_select_to_kiosk"),
    });
    return;
  }

  if (formData.value.fromKioskId === formData.value.toKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("cannot_transfer_same_kiosk"),
    });
    return;
  }

  const fromKiosk = selectedFromKiosk.value;
  const toKiosk = selectedToKiosk.value;

  if (!fromKiosk?.userKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("user_not_registered_from_kiosk"),
    });
    return;
  }

  if (!toKiosk?.userKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("user_not_registered_to_kiosk"),
    });
    return;
  }

  if (Number(formData.value.amount) > Number(fromKiosk.balance)) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("transfer_exceeds_balance"),
    });
    return;
  }

  try {
    const result = await Swal.fire({
      title: $t("confirm_transfer"),
      html: `
  <div class="text-left">
    <p><strong>${$t("userid")}:</strong> ${props.userData?.userid}</p>
    <p><strong>${$t("from_kiosk")}:</strong> ${fromKiosk.name}${
        fromKioskMultiplier.value > 1 ? ` (x${fromKioskMultiplier.value})` : ""
      }</p>
    <p><strong>${$t("from_gameid")}:</strong> ${fromKiosk.userKioskId}</p>
    <p><strong>${$t("transfer_out")}:</strong> ${currency.value} ${formatAmount(
        actualTransferOutAmount.value
      )}</p>
    <p><strong>${$t("to_kiosk")}:</strong> ${toKiosk.name}${
        toKioskMultiplier.value > 1 ? ` (x${toKioskMultiplier.value})` : ""
      }</p>
    <p><strong>${$t("to_gameid")}:</strong> ${toKiosk.userKioskId}</p>
    <p><strong>${$t("transfer_in")}:</strong> ${currency.value} ${formatAmount(
        actualTransferInAmount.value
      )}</p>
    <p><strong>${$t("actual_value")}:</strong> ${currency.value} ${formatAmount(
        actualTransferValue.value
      )}</p>
  </div>
  `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });
    if (!result.isConfirmed) return;

    isLoading.value = true;

    // Step 1: Transfer Out from source kiosk
    const transferOutResponse = await post(
      `${fromKiosk.transferOutAPI}/${props.userData?._id}`,
      {
        transferAmount: Number(formData.value.amount),
      }
    );

    if (!transferOutResponse.data.success) {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          transferOutResponse.data.message?.[$locale.value] ||
          transferOutResponse.data.message?.en ||
          $t("transfer_out_failed"),
      });
      isLoading.value = false;
      return;
    }

    // Step 2: Transfer In to destination kiosk
    const transferInResponse = await post(
      `${toKiosk.transferInAPI}/${props.userData?._id}`,
      {
        transferAmount: Number(actualTransferInAmount.value),
      }
    );

    if (!transferInResponse.data.success) {
      // Rollback: Transfer back to source kiosk
      await post(`${fromKiosk.transferInAPI}/${props.userData?._id}`, {
        transferAmount: Number(formData.value.amount),
      });

      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          transferInResponse.data.message?.[$locale.value] ||
          transferInResponse.data.message?.en ||
          $t("transfer_in_failed"),
      });
      isLoading.value = false;
      return;
    }

    // Step 3: Record the transfer
    const { data } = await post("admin-kiosk-transfer", {
      userId: props.userData?._id,
      username: props.userData?.username,
      amount: Number(actualTransferValue.value),
      transferOutAmount: Number(actualTransferOutAmount.value),
      transferInAmount: Number(actualTransferInAmount.value),
      fromKioskId: formData.value.fromKioskId,
      fromKioskName: fromKiosk.name,
      fromUserKioskId: fromKiosk.userKioskId,
      fromMultiplier: fromKioskMultiplier.value,
      toKioskId: formData.value.toKioskId,
      toKioskName: toKiosk.name,
      toUserKioskId: toKiosk.userKioskId,
      toMultiplier: toKioskMultiplier.value,
      remark: formData.value.remark,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text:
          data.message?.[$locale.value] ||
          data.message?.en ||
          $t("transfer_success"),
        timer: 1500,
      });
      emit("success");
      closeModal();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message?.[$locale.value] || data.message?.en,
      });
    }
  } catch (error) {
    console.error("Error processing transfer:", error);
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
    fromKioskId: "",
    toKioskId: "",
    amount: "",
    remark: "",
  };
  kioskListWithBalances.value = [];
  emit("update:show", false);
};

// Reset toKioskId if same as fromKioskId
watch(
  () => formData.value.fromKioskId,
  (newVal) => {
    if (newVal === formData.value.toKioskId) {
      formData.value.toKioskId = "";
    }
  }
);

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      fetchAllKioskBalances();
    }
  }
);
</script>

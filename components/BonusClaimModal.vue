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
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div
                class="w-2 h-8 rounded-full max-md:h-6"
                :class="themeColor"
              ></div>
              <h2 class="text-xl font-semibold max-md:text-lg">
                {{ title }}
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
          <!-- Bonus Info -->
          <div
            class="border rounded-lg p-4 mb-4 max-md:p-3 max-md:mb-3"
            :class="infoBgClass"
          >
            <div class="grid grid-cols-2 gap-4 max-md:gap-2">
              <slot name="info">
                <div>
                  <div class="text-sm text-gray-500 max-md:text-xs">
                    {{ $t("username") }}
                  </div>
                  <div class="font-semibold text-gray-800 max-md:text-sm">
                    {{ bonusData?.username }}
                  </div>
                </div>
              </slot>
            </div>

            <!-- Bonus Amount -->
            <div class="mt-4 pt-4 border-t max-md:mt-3 max-md:pt-3">
              <div class="text-sm text-gray-500 max-md:text-xs">
                {{ $t("bonus_amount") }}
              </div>
              <div
                class="font-bold text-2xl max-md:text-xl"
                :class="amountColor"
              >
                {{ currency }} {{ formatAmount(bonusAmount) }}
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
            <div
              v-if="isLoadingBalances"
              class="flex items-center justify-center py-8"
            >
              <Icon icon="eos-icons:loading" class="w-8 h-8 text-indigo-600" />
            </div>
            <template v-else>
              <CustomSelect v-model="selectedKioskId" required>
                <option value="" disabled>{{ $t("select_kiosk") }}</option>
                <option
                  v-for="kiosk in kioskListWithBalances"
                  :key="kiosk._id"
                  :value="kiosk._id"
                >
                  {{ kiosk.name }} - {{ formatAmount(kiosk.balance) }}
                </option>
              </CustomSelect>

              <!-- Selected Kiosk Info -->
              <div
                v-if="selectedKioskInfo"
                class="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg max-md:p-2"
              >
                <div
                  class="flex items-center justify-between text-sm max-md:text-xs"
                >
                  <div>
                    <span class="text-gray-600"
                      >{{ $t("kiosk_balance") }}:</span
                    >
                    <span class="font-bold text-indigo-600 ml-1">
                      {{ formatAmount(selectedKioskInfo.balance) }}
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
                      {{
                        selectedKioskInfo.userKioskId || $t("not_registered")
                      }}
                    </span>
                    <button
                      v-if="selectedKioskInfo.userKioskId"
                      @click="copyToClipboard(selectedKioskInfo.userKioskId)"
                      class="text-gray-400 lg:hover:text-indigo-600 transition-colors"
                    >
                      <Icon
                        icon="mdi:content-copy"
                        class="w-4 h-4 max-md:w-3 max-md:h-3"
                      />
                    </button>
                  </div>
                </div>

                <!-- Transfer Amount Info (for x2/x5) -->
                <div
                  v-if="transferMultiplier > 1"
                  class="mt-2 pt-2 border-t border-indigo-200"
                >
                  <div class="flex justify-between text-sm max-md:text-xs">
                    <span class="text-gray-600">
                      {{ $t("transfer_amount") }} (x{{ transferMultiplier }}
                      {{ $t("multiplier") }}):
                    </span>
                    <span class="font-bold text-green-600">
                      {{ currency }} {{ formatAmount(actualTransferAmount) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Promotion Select -->
              <div class="mb-4 max-md:mb-3">
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("promotion") }} <span class="text-red-500">*</span>
                </label>
                <CustomSelect v-model="selectedPromotionId" required>
                  <option value="" disabled>
                    {{ $t("select_promotion") }}
                  </option>
                  <option
                    v-for="promo in promotionList"
                    :key="promo._id"
                    :value="promo._id"
                  >
                    {{ promo.maintitleEN }}
                  </option>
                </CustomSelect>
              </div>

              <div
                v-if="kioskListWithBalances.length === 0"
                class="text-center py-8 text-gray-500"
              >
                {{ $t("no_kiosk_available") }}
              </div>
            </template>
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
            @click="handleClaim"
            class="px-4 py-2 text-white rounded-lg max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            :class="buttonColor"
          >
            {{ $t("confirm_claim") }}
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
  bonusData: {
    type: Object,
    default: null,
  },
  bonusAmount: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: "Claim Bonus",
  },
  theme: {
    type: String,
    default: "indigo",
  },
  claimApi: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  if (!isLoading.value) {
    closeModal();
  }
});
const promotionList = ref([]);
const selectedPromotionId = ref("");
const { get, post } = useApiEndpoint();
const currency = useCurrency();
const isLoading = ref(false);
const isLoadingBalances = ref(false);
const kioskListWithBalances = ref([]);
const selectedKioskId = ref("");

const themeColor = computed(() => {
  const colors = {
    purple: "bg-purple-600",
    indigo: "bg-indigo-600",
    green: "bg-green-600",
  };
  return colors[props.theme] || colors.purple;
});

const infoBgClass = computed(() => {
  const classes = {
    purple: "bg-purple-50 border-purple-200",
    indigo: "bg-indigo-50 border-indigo-200",
    green: "bg-green-50 border-green-200",
  };
  return classes[props.theme] || classes.purple;
});

const amountColor = computed(() => {
  const colors = {
    purple: "text-purple-600",
    indigo: "text-indigo-600",
    green: "text-green-600",
  };
  return colors[props.theme] || colors.purple;
});

const buttonColor = computed(() => {
  const colors = {
    purple: "bg-purple-600 lg:hover:bg-purple-500",
    indigo: "bg-indigo-600 lg:hover:bg-indigo-500",
    green: "bg-green-600 lg:hover:bg-green-500",
  };
  return colors[props.theme] || colors.purple;
});

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "0.00";
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const selectedKioskInfo = computed(() => {
  if (!selectedKioskId.value) return null;
  return kioskListWithBalances.value.find(
    (k) => k._id === selectedKioskId.value
  );
});

const transferMultiplier = computed(() => {
  if (!selectedKioskInfo.value) return 1;
  const kioskName = selectedKioskInfo.value.name?.toLowerCase() || "";
  if (kioskName.includes("x5")) return 5;
  if (kioskName.includes("x2")) return 2;
  return 1;
});

const actualTransferAmount = computed(() => {
  return props.bonusAmount / transferMultiplier.value;
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

const fetchPromotions = async () => {
  try {
    const { data } = await get("promotions");
    if (data.success) {
      promotionList.value = data.data;
      autoSelectDefaultPromotion();
    }
  } catch (error) {
    console.error("Error fetching promotions:", error);
  }
};

const autoSelectDefaultPromotion = () => {
  if (!promotionList.value.length) return;

  const titleLower = props.title?.toLowerCase() || "";
  let defaultPromo = null;

  if (titleLower.includes("vip") && titleLower.includes("monthly")) {
    defaultPromo = promotionList.value.find(
      (p) =>
        p.maintitleEN?.toLowerCase().includes("vip") &&
        p.maintitleEN?.toLowerCase().includes("monthly")
    );
  } else if (titleLower.includes("attendance")) {
    defaultPromo = promotionList.value.find((p) =>
      p.maintitleEN?.toLowerCase().includes("attendance")
    );
  } else if (titleLower.includes("loyalty")) {
    defaultPromo = promotionList.value.find((p) =>
      p.maintitleEN?.toLowerCase().includes("loyalty")
    );
  }

  if (defaultPromo) {
    selectedPromotionId.value = defaultPromo._id;
  }
};

const fetchAllKioskBalances = async () => {
  isLoadingBalances.value = true;
  try {
    const { data } = await post("kiosk/check-all-balances", {
      userId: props.bonusData?.userId,
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

const handleClaim = async () => {
  console.log("props.bonusAmount:", props.bonusAmount);
  console.log("actualTransferAmount:", actualTransferAmount.value);
  console.log("transferMultiplier:", transferMultiplier.value);
  if (!selectedKioskId.value) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_select_kiosk"),
    });
    return;
  }

  if (!selectedPromotionId.value) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_select_promotion"),
    });
    return;
  }

  const selectedKiosk = selectedKioskInfo.value;
  const selectedPromotion = promotionList.value.find(
    (p) => p._id === selectedPromotionId.value
  );

  if (!selectedKiosk?.userKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("user_not_registered_kiosk"),
    });
    return;
  }

  try {
    const confirmHtml = `
      <div class="text-left">
        <p><strong>${$t("username")}:</strong> ${props.bonusData?.username}</p>
        <p><strong>${$t("kiosk")}:</strong> ${selectedKiosk.name}</p>
        <p><strong>${$t("gameid")}:</strong> ${selectedKiosk.userKioskId}</p>
        <p><strong>${$t("promotion")}:</strong> ${
      $locale.value === "zh"
        ? selectedPromotion?.maintitle
        : selectedPromotion?.maintitleEN
    }</p>
        <p><strong>${$t("bonus_amount")}:</strong> ${
      currency.value
    } ${formatAmount(props.bonusAmount)}</p>
        ${
          transferMultiplier.value > 1
            ? `<p><strong>${$t("transfer_amount")}:</strong> ${
                currency.value
              } ${formatAmount(actualTransferAmount.value)} (x${
                transferMultiplier.value
              })</p>`
            : ""
        }
      </div>
    `;

    const result = await Swal.fire({
      title: $t("confirm_claim"),
      html: confirmHtml,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isLoading.value = true;

    // Step 1: Call Kiosk Transfer In API
    const transferResponse = await post(
      `${selectedKiosk.transferInAPI}/${props.bonusData?.userId}`,
      {
        transferAmount: Number(actualTransferAmount.value),
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

    // Step 2: Call Claim API (mark as claimed)
    const claimPayload = {
      vipMonthlyBonusId: props.bonusData?._id,
      kioskId: selectedKioskId.value,
      kioskName: selectedKiosk.name,
      bonusAmount: Number(props.bonusAmount),
      transferAmount: Number(actualTransferAmount.value),
    };
    const claimResponse = await post(props.claimApi, claimPayload);
    if (!claimResponse.data.success) {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          claimResponse.data.message?.[$locale.value] ||
          claimResponse.data.message?.en,
      });
      isLoading.value = false;
      return;
    }

    // Step 3: Call admin-direct-bonus API (create BonusLog)
    const { data } = await post("admin-direct-bonus", {
      userId: props.bonusData?.userId,
      username: props.bonusData?.username,
      kioskId: selectedKioskId.value,
      kioskName: selectedKiosk.name,
      promotionId: selectedPromotionId.value,
      amount: Number(props.bonusAmount),
      remark: props.title,
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
        icon: "error",
        title: $t("error"),
        text: data.message?.[$locale.value] || data.message?.en,
      });
    }
  } catch (error) {
    console.error("Error claiming bonus:", error);
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
  selectedKioskId.value = "";
  selectedPromotionId.value = "";
  kioskListWithBalances.value = [];
  promotionList.value = [];
  emit("update:show", false);
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow && props.bonusData?.userId) {
      fetchAllKioskBalances();
      fetchPromotions();
    }
  }
);
</script>

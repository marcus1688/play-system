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
              <div class="w-2 h-8 bg-green-600 rounded-full max-md:h-6"></div>
              <h2 class="text-xl font-semibold max-md:text-lg">
                {{ $t("deposit") }}
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

          <!-- Kiosk Balance List -->
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
            <div
              v-else
              class="grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-2"
            >
              <div
                v-for="kiosk in kioskListWithBalances"
                :key="kiosk._id"
                @click="selectKiosk(kiosk)"
                class="border rounded-lg p-4 cursor-pointer transition-all max-md:p-3"
                :class="[
                  formData.kioskId === kiosk._id
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                    : 'border-gray-200 lg:hover:border-indigo-300 lg:hover:bg-indigo-50/50',
                ]"
              >
                <div class="flex items-center justify-between mb-2 max-md:mb-1">
                  <span class="font-semibold text-gray-800 max-md:text-sm">
                    {{ kiosk.name }}
                  </span>
                  <Icon
                    v-if="formData.kioskId === kiosk._id"
                    icon="mdi:check-circle"
                    class="w-5 h-5 text-indigo-600 max-md:w-4 max-md:h-4"
                  />
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm max-md:text-xs">
                  <div>
                    <div class="text-gray-500">{{ $t("kiosk_balance") }}</div>
                    <div class="font-bold text-indigo-600">
                      <span v-if="kiosk.isLoadingBalance">
                        <Icon icon="eos-icons:loading" class="w-4 h-4" />
                      </span>
                      <span v-else>
                        {{ formatAmount(kiosk.balance) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div class="text-gray-500">{{ $t("gameid") }}</div>
                    <div
                      class="font-bold flex items-center gap-1"
                      :class="
                        kiosk.userKioskId ? 'text-gray-800' : 'text-red-500'
                      "
                    >
                      <span>{{
                        kiosk.userKioskId || $t("not_registered")
                      }}</span>
                      <button
                        v-if="kiosk.userKioskId"
                        @click.stop="copyToClipboard(kiosk.userKioskId)"
                        class="text-gray-400 lg:hover:text-indigo-600 transition-colors"
                      >
                        <Icon
                          icon="mdi:content-copy"
                          class="w-4 h-4 max-md:w-3 max-md:h-3"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="!isLoadingBalances && kioskListWithBalances.length === 0"
              class="text-center py-8 text-gray-500"
            >
              {{ $t("no_kiosk_available") }}
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
                {{ $t("deposit_amount") }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.amount"
                type="number"
                step="0.01"
                min="0"
                :placeholder="$t('enter_amount')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                required
              />
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

            <!-- Promotion Select (Optional) -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("promotion_optional") }}
              </label>
              <CustomSelect v-model="formData.promotionId">
                <option value="">{{ $t("without_promotion") }}</option>
                <option
                  v-for="promo in promotionList"
                  :key="promo._id"
                  :value="promo._id"
                >
                  {{
                    $i18n.locale === "zh" ? promo.maintitle : promo.maintitleEN
                  }}
                </option>
              </CustomSelect>
              <!-- Promotion Info -->
              <div
                v-if="selectedPromotion"
                class="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg max-md:p-2 max-md:mt-1.5"
              >
                <div class="text-sm max-md:text-xs">
                  <div class="flex justify-between mb-1">
                    <span class="text-gray-600">{{ $t("bonus_type") }}:</span>
                    <span class="font-semibold text-indigo-600">
                      {{ selectedPromotion.claimtype }}
                    </span>
                  </div>
                  <div
                    v-if="selectedPromotion.claimtype === 'Percentage'"
                    class="flex justify-between mb-1"
                  >
                    <span class="text-gray-600"
                      >{{ $t("bonus_percentage") }}:</span
                    >
                    <span class="font-semibold text-indigo-600">
                      {{ selectedPromotion.bonuspercentage }}%
                    </span>
                  </div>
                  <div
                    v-if="selectedPromotion.claimtype === 'Exact'"
                    class="flex justify-between mb-1"
                  >
                    <span class="text-gray-600">{{ $t("bonus_amount") }}:</span>
                    <span class="font-semibold text-indigo-600">
                      {{ currency }}
                      {{ formatAmount(selectedPromotion.bonusexact) }}
                    </span>
                  </div>
                  <div
                    v-if="selectedPromotion.maxbonus > 0"
                    class="flex justify-between mb-1"
                  >
                    <span class="text-gray-600">{{ $t("max_bonus") }}:</span>
                    <span class="font-semibold text-indigo-600">
                      {{ currency }}
                      {{ formatAmount(selectedPromotion.maxbonus) }}
                    </span>
                  </div>
                  <div
                    v-if="calculatedBonus > 0"
                    class="flex justify-between pt-2 border-t border-indigo-200 mt-2"
                  >
                    <span class="text-gray-700 font-medium"
                      >{{ $t("estimated_bonus") }}:</span
                    >
                    <span class="font-bold text-green-600">
                      {{ currency }} {{ formatAmount(calculatedBonus) }}
                    </span>
                  </div>
                  <div
                    v-if="calculatedBonus > 0 && formData.amount"
                    class="flex justify-between mt-1"
                  >
                    <span class="text-gray-700 font-medium"
                      >{{ $t("total_deposit") }}:</span
                    >
                    <span class="font-bold text-indigo-600">
                      {{ currency }}
                      {{
                        formatAmount(Number(formData.amount) + calculatedBonus)
                      }}
                    </span>
                  </div>
                </div>
              </div>
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
            class="px-4 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("confirm_deposit") }}
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

const { get, post } = useApiEndpoint();
const currency = useCurrency();
const isLoading = ref(false);
const isLoadingBalances = ref(false);
const kioskListWithBalances = ref([]);
const bankList = ref([]);
const promotionList = ref([]);

const formData = ref({
  amount: "",
  kioskId: "",
  bankId: "",
  promotionId: "",
  remark: "",
});

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

const selectedPromotion = computed(() => {
  if (!formData.value.promotionId) return null;
  return promotionList.value.find((p) => p._id === formData.value.promotionId);
});

const calculatedBonus = computed(() => {
  if (!selectedPromotion.value || !formData.value.amount) return 0;

  const amount = Number(formData.value.amount);
  let bonus = 0;

  if (selectedPromotion.value.claimtype === "Percentage") {
    bonus =
      (amount * parseFloat(selectedPromotion.value.bonuspercentage)) / 100;
    if (
      selectedPromotion.value.maxbonus > 0 &&
      bonus > selectedPromotion.value.maxbonus
    ) {
      bonus = selectedPromotion.value.maxbonus;
    }
  } else if (selectedPromotion.value.claimtype === "Exact") {
    bonus = parseFloat(selectedPromotion.value.bonusexact);
    if (
      selectedPromotion.value.maxbonus > 0 &&
      bonus > selectedPromotion.value.maxbonus
    ) {
      bonus = selectedPromotion.value.maxbonus;
    }
  }

  return bonus;
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
    console.log(data);
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

const fetchPromotionList = async () => {
  try {
    const { data } = await get("getdepositpromotion");
    if (data.success) {
      promotionList.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching promotion list:", error);
  }
};

const selectKiosk = (kiosk) => {
  if (!kiosk.userKioskId) {
    Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("user_not_registered_kiosk"),
    });
    return;
  }
  formData.value.kioskId = kiosk._id;
};

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

  const selectedKiosk = selectedKioskInfo.value;

  if (!selectedKiosk?.userKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("user_not_registered_kiosk"),
    });
    return;
  }

  const selectedBank = bankList.value.find(
    (b) => b._id === formData.value.bankId
  );

  try {
    const result = await Swal.fire({
      title: $t("confirm_deposit"),
      html: `
        <div class="text-left">
          <p><strong>${$t("userid")}:</strong> ${props.userData?.userid}</p>
          <p><strong>${$t("gameid")}:</strong> ${selectedKiosk.userKioskId}</p>
          <p><strong>${$t("amount")}:</strong> ${currency.value} ${formatAmount(
        formData.value.amount
      )}</p>
          <p><strong>${$t("kiosk")}:</strong> ${selectedKiosk.name}</p>
          <p><strong>${$t("bank")}:</strong> ${selectedBank?.bankname}</p>
          ${
            selectedPromotion.value
              ? `<p><strong>${$t("promotion")}:</strong> ${
                  $locale.value === "zh"
                    ? selectedPromotion.value.maintitle
                    : selectedPromotion.value.maintitleEN
                }</p>`
              : ""
          }
          ${
            calculatedBonus.value > 0
              ? `<p><strong>${$t("bonus")}:</strong> ${
                  currency.value
                } ${formatAmount(calculatedBonus.value)}</p>`
              : ""
          }
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isLoading.value = true;

    // Step 1: Check promotion eligibility (if selected)
    if (formData.value.promotionId) {
      try {
        const checkResponse = await post("checkpromotion", {
          promotionId: formData.value.promotionId,
          depositAmount: Number(formData.value.amount),
          userid: props.userData?._id,
          username: props.userData?.username,
        });

        if (!checkResponse.data.success) {
          await Swal.fire({
            icon: "info",
            title: $t("info"),
            text:
              checkResponse.data.message?.[$locale.value] ||
              checkResponse.data.message?.en,
          });
          isLoading.value = false;
          return;
        }
      } catch (error) {
        console.error("Error checking promotion:", error);
        await Swal.fire({
          icon: "error",
          title: $t("error"),
          text: $t("promotion_check_failed"),
        });
        isLoading.value = false;
        return;
      }
    }

    // Step 2: Call Kiosk Transfer In API
    const totalTransferAmount =
      Number(formData.value.amount) + calculatedBonus.value;

    const transferResponse = await post(
      `${selectedKiosk.transferInAPI}/${props.userData?._id}`,
      {
        transferAmount: totalTransferAmount,
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

    // Step 3: Submit and auto-approve deposit
    const { data } = await post("admin-direct-deposit", {
      userId: props.userData?._id,
      username: props.userData?.username,
      amount: Number(formData.value.amount),
      kioskId: formData.value.kioskId,
      kioskName: selectedKiosk.name,
      userKioskId: selectedKiosk.userKioskId,
      bankId: formData.value.bankId,
      promotionId: formData.value.promotionId || null,
      bonusAmount: calculatedBonus.value || 0,
      remark: formData.value.remark,
    });

    if (data.success) {
      // Step 4: Submit bonus if promotion selected
      if (formData.value.promotionId && calculatedBonus.value > 0) {
        try {
          await post("submitdepositbonus", {
            userid: props.userData?._id,
            username: props.userData?.username,
            promotionId: formData.value.promotionId,
            depositId: data.depositId,
            depositAmount: Number(formData.value.amount),
            kioskName: selectedKiosk.name,
          });
        } catch (bonusError) {
          console.error("Error submitting bonus:", bonusError);
        }
      }

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
    console.error("Error processing deposit:", error);
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
    promotionId: "",
    remark: "",
  };
  kioskListWithBalances.value = [];
  emit("update:show", false);
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      fetchAllKioskBalances();
      fetchBankList();
      fetchPromotionList();
    }
  }
);
</script>

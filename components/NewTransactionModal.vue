<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <div class="fixed inset-0 bg-black bg-opacity-50" />

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 max-md:p-3">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            class="max-md:w-full"
          >
            <DialogPanel
              class="md:w-[30rem] transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all max-w-full max-md:p-4"
            >
              <!-- Header -->
              <DialogTitle
                class="text-xl font-semibold text-gray-900 mb-4 max-md:text-lg max-md:mb-3"
              >
                <div class="flex items-center gap-4 max-md:gap-3">
                  <div
                    class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"
                  ></div>
                  <h2 class="text-xl font-semibold max-md:text-lg">
                    {{ $t("new_transaction") }}
                  </h2>
                </div>
              </DialogTitle>

              <!-- Steps indicator -->
              <div class="mb-6 max-md:mb-4">
                <div class="flex items-center justify-between">
                  <template v-for="(step, index) in steps" :key="index">
                    <div
                      :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0 max-md:w-7 max-md:h-7 max-md:text-xs',
                        currentStep > index
                          ? 'bg-green-500 text-white'
                          : currentStep === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700',
                      ]"
                    >
                      {{ index + 1 }}
                    </div>
                    <div
                      v-if="index < steps.length - 1"
                      class="flex-1 h-1 mx-2 max-md:mx-1"
                      :class="
                        currentStep > index ? 'bg-green-500' : 'bg-gray-200'
                      "
                    />
                  </template>
                </div>
                <div
                  class="flex items-center justify-between mt-1 max-md:mt-0.5"
                >
                  <div
                    v-for="(step, index) in steps"
                    :key="index"
                    class="text-sm text-gray-600 text-center max-md:text-[10px] max-md:leading-tight"
                    style="width: 32px"
                  >
                    {{ $i18n.locale === "zh" ? step.zh : step.en }}
                  </div>
                </div>
              </div>

              <!-- Step 1: Transaction Type -->
              <div v-if="currentStep === 0">
                <div
                  class="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:gap-2"
                >
                  <button
                    v-for="type in transactionTypes"
                    :key="type.value"
                    @click="selectType(type.value)"
                    class="p-4 border rounded-lg lg:hover:border-blue-500 transition-colors max-md:p-3"
                    :class="
                      selectedType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : ''
                    "
                  >
                    <div
                      class="flex flex-col items-center gap-2 max-md:flex-row max-md:justify-center"
                    >
                      <Icon
                        :icon="type.icon"
                        class="w-8 h-8 max-md:w-6 max-md:h-6"
                        :class="type.iconClass"
                      />
                      <span class="font-medium max-md:text-sm">{{
                        $i18n.locale === "zh" ? type.labelCN : type.label
                      }}</span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Step 2: User Search -->
              <div v-else-if="currentStep === 1">
                <div class="space-y-4 max-md:space-y-3">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("username") }}
                    </label>
                    <div class="flex gap-2 max-md:flex-col">
                      <input
                        v-model="username"
                        type="text"
                        class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-md:px-2 max-md:py-1.5 max-md:text-sm"
                        :placeholder="$t('enter_username_to_search')"
                      />
                      <LoadingButton
                        :loading="isSearchButtonLoading"
                        @click="searchUser"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg lg:hover:bg-blue-600 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
                      >
                        {{ $t("search") }}
                      </LoadingButton>
                    </div>
                  </div>

                  <!-- User Info -->
                  <div
                    v-if="userInfo"
                    class="p-4 bg-gray-50 rounded-lg max-md:p-3"
                  >
                    <div
                      class="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:gap-2"
                    >
                      <div>
                        <div class="text-sm text-gray-600 max-md:text-xs">
                          {{ $t("full_name") }}
                        </div>
                        <div
                          class="font-medium max-md:text-sm break-words whitespace-normal"
                        >
                          {{ userInfo.fullname }}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm text-gray-600 max-md:text-xs">
                          {{ $t("balance") }}
                        </div>
                        <div class="font-medium max-md:text-sm">
                          {{ currency }} {{ userInfo.balance.toFixed(2) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm text-gray-600 max-md:text-xs">
                          {{ $t("vip_level") }}
                        </div>
                        <div class="font-medium max-md:text-sm">
                          {{ userInfo.viplevel }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 3: Transaction Details -->
              <div v-else-if="currentStep === 2">
                <div
                  v-if="['deposit', 'withdraw', `bonus`].includes(selectedType)"
                  class="space-y-4 max-md:space-y-3"
                >
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{
                        selectedType === "bonus"
                          ? $t("promotion")
                          : $t("bank_name")
                      }}
                    </label>
                    <!-- Deposit bank select -->
                    <CustomSelect
                      v-if="selectedType === 'deposit'"
                      v-model="formData.bankid"
                    >
                      <option value="" disabled>{{ $t("select_bank") }}</option>
                      <option
                        v-for="bank in bankList"
                        :key="bank.id"
                        :value="bank._id"
                      >
                        {{ bank.bankname }} - {{ bank.ownername }} -
                        {{ bank.bankaccount }}
                      </option>
                    </CustomSelect>

                    <!-- Deposit Promotion Select -->
                    <div
                      v-if="selectedType === 'deposit'"
                      class="mt-2 max-md:mt-1.5"
                    >
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                      >
                        {{ $t("promotion_optional") }}
                      </label>
                      <CustomSelect v-model="formData.promotionId">
                        <option value="" disabled>
                          {{ $t("select_promotion") }}
                        </option>
                        <option value="">{{ $t("without_promotion") }}</option>
                        <option
                          v-for="promo in depositPromotion"
                          :key="promo._id"
                          :value="promo._id"
                        >
                          {{
                            $i18n.locale === "zh"
                              ? promo.maintitle
                              : promo.maintitleEN
                          }}
                        </option>
                      </CustomSelect>
                    </div>

                    <!-- Withdraw bank select -->
                    <CustomSelect
                      v-if="selectedType === 'withdraw'"
                      v-model="formData.bankid"
                    >
                      <option value="" disabled>
                        {{ $t("select_user_bank") }}
                      </option>
                      <option
                        v-for="bank in userBankList"
                        :key="bank._id"
                        :value="bank._id"
                      >
                        {{ bank.bankname }} - {{ bank.name }} -
                        {{ bank.banknumber }}
                      </option>
                    </CustomSelect>
                    <!-- Promotion select -->
                    <CustomSelect
                      v-if="selectedType === 'bonus'"
                      v-model="formData.bankid"
                    >
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

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{
                        selectedType === "deposit"
                          ? $t("deposit_amount")
                          : selectedType === "withdraw"
                          ? $t("withdraw_amount")
                          : selectedType === "bonus"
                          ? $t("bonus_amount")
                          : ""
                      }}
                    </label>
                    <input
                      v-model="formData.amount"
                      type="number"
                      class="w-full px-4 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                      :placeholder="$t('enter_amount')"
                    />
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div
                class="mt-6 flex justify-end gap-3 max-md:mt-4 max-md:gap-2 max-md:flex-col-reverse"
              >
                <button
                  @click="closeModal"
                  class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:order-3"
                >
                  {{ $t("cancel") }}
                </button>
                <button
                  v-if="currentStep > 0"
                  @click="prevStep"
                  class="px-4 py-2 bg-gray-100 rounded-lg lg:hover:bg-gray-200 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:order-2"
                >
                  {{ $t("back") }}
                </button>
                <button
                  v-if="currentStep < 2"
                  @click="nextStep"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg lg:hover:bg-blue-600 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:order-1"
                  :disabled="!canProceed"
                >
                  {{ $t("next") }}
                </button>
                <LoadingButton
                  v-else
                  :loading="isButtonLoading"
                  @click="handleSubmit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg lg:hover:bg-blue-600 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:order-1"
                >
                  {{ $t("submit") }}
                </LoadingButton>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { Icon } from "@iconify/vue";
import Swal from "sweetalert2";
import { useApiEndpoint } from "~/composables/useApiEndpoint";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const depositPromotion = ref([]);
const userBankList = ref([]);
const promotionList = ref([]);
const emit = defineEmits(["close", "submit"]);
const { post, get, publicGet } = useApiEndpoint();
const currency = useCurrency();
const isButtonLoading = ref(false);
const isSearchButtonLoading = ref(false);
const steps = [
  { en: "Type", zh: "类型" },
  { en: "User", zh: "用户" },
  { en: "Details", zh: "详情" },
];
const currentStep = ref(0);
const selectedType = ref("");
const username = ref("");
const userInfo = ref(null);
const bankList = ref([]);

const formData = ref({
  userid: "",
  bankid: "",
  username: "",
  amount: "",
  transactionType: "",
  remark: "",
  promotionId: "",
});

const transactionTypes = [
  {
    value: "deposit",
    label: "Deposit",
    labelCN: "存款",
    icon: "mingcute:bank-fill",
    iconClass: "text-green-500",
  },
  {
    value: "withdraw",
    label: "Withdraw",
    labelCN: "提款",
    icon: "mingcute:wallet-4-fill",
    iconClass: "text-red-500",
  },
  {
    value: "bonus",
    label: "Bonus",
    labelCN: "优惠",
    icon: "mingcute:gift-2-fill",
    iconClass: "text-blue-500",
  },
];

const fetchDepositPromotion = async () => {
  try {
    const { data } = await get("getdepositpromotion");
    if (data.success) {
      depositPromotion.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching deposit promotions:", error);
  }
};

const fetchBankList = async () => {
  try {
    const { data } = await get("banklist");
    if (data.success) {
      bankList.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
  }
};

const fetchUserBankList = async () => {
  try {
    if (!formData.value.username) return;
    const { data } = await get(`user/bankaccounts/${formData.value.username}`);
    if (data.success) {
      userBankList.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching user banks:", error);
  }
};

const fetchPromotionList = async () => {
  try {
    const { data } = await get("promotions");
    if (data.success) {
      promotionList.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching promotions:", error);
  }
};

const searchUser = async () => {
  isSearchButtonLoading.value = true;
  try {
    const { data } = await publicGet(`search/${username.value}`);
    if (data.success) {
      userInfo.value = data.data;
      formData.value.userid = data.data._id;
      formData.value.username = data.data.username;
      switch (selectedType.value) {
        case "deposit":
          await fetchBankList();
          await fetchDepositPromotion();
          break;
        case "withdraw":
          await fetchUserBankList();
          break;
        case "bonus":
          await fetchPromotionList();
          break;
      }
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en || data.message,
      });
    }
  } catch (error) {
    console.error("Failed to search user:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        error.message ||
        $t("network_error"),
    });
  }
  isSearchButtonLoading.value = false;
};

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return selectedType.value !== "";
  }
  if (currentStep.value === 1) {
    return userInfo.value !== null;
  }
  return true;
});

const selectType = (type) => {
  selectedType.value = type;
  formData.value = {
    userid: "",
    bankid: "",
    username: "",
    amount: "",
    transactionType: type,
    remark: "",
  };
};

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    if (currentStep.value === 2 || currentStep.value === 1) {
      userInfo.value = null;
      username.value = "";
      formData.value.userid = "";
      formData.value.username = "";
      formData.value.amount = "";
      formData.value.bankid = "";
      formData.value.promotionId = "";

      bankList.value = [];
      userBankList.value = [];
      depositPromotion.value = [];
      promotionList.value = [];
    }

    currentStep.value--;
  }
};

const handleSubmit = async () => {
  isButtonLoading.value = true;
  try {
    let endpoint;
    switch (formData.value.transactionType) {
      case "deposit":
        endpoint = "deposit";
        break;
      case "withdraw":
        endpoint = "withdraw";
        break;
      case "bonus":
        endpoint = "bonus";
        break;
    }

    if (
      formData.value.transactionType === "deposit" &&
      formData.value.promotionId
    ) {
      try {
        const response = await post("checkpromotion", {
          promotionId: formData.value.promotionId,
          depositAmount: Number(formData.value.amount),
          ...formData.value,
        });
        if (!response.data.success) {
          await Swal.fire({
            icon: "info",
            title: $t("info"),
            text:
              response.data.message[$locale.value] || response.data.message.en,
          });
          isButtonLoading.value = false;
          return;
        }
      } catch (error) {
        console.error("Error checking promotion:", error);
        await Swal.fire({
          icon: "error",
          title: $t("error"),
          text:
            error.response?.data?.message?.[$locale.value] ||
            error.response?.data?.message?.en ||
            $t("network_error"),
        });
        isButtonLoading.value = false;
        return;
      }
    }

    const response = await post(`${endpoint}`, formData.value);

    if (response.data.success) {
      if (
        formData.value.transactionType === "deposit" &&
        formData.value.promotionId
      ) {
        try {
          const bonusResponse = await post("submitdepositbonus", {
            promotionId: formData.value.promotionId,
            depositAmount: formData.value.amount,
            depositId: response.data.depositId,
            ...formData.value,
          });

          if (!bonusResponse.data.success) {
            console.warn(
              "Bonus application failed:",
              bonusResponse.data.message
            );
          }
        } catch (bonusError) {
          console.error("Error submitting bonus:", bonusError);
        }
      }
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
      emit("submit", response.data.data);
      closeModal();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text:
          response.data.message[$locale.value] ||
          response.data.message.en ||
          response.data.message,
      });
    }
  } catch (error) {
    console.error(`Failed to submit ${formData.value.transactionType}:`, error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        error.message ||
        $t("network_error"),
    });
  }
  isButtonLoading.value = false;
};

const closeModal = () => {
  emit("close");
  currentStep.value = 0;
  selectedType.value = "";
  username.value = "";
  userInfo.value = null;
  formData.value = {
    userid: "",
    bankid: "",
    username: "",
    amount: "",
    depositAmount: "",
    transactionType: "deposit",
    remark: "",
    promotionId: "",
  };
};

watch(
  () => formData.value.bankid,
  async (newBankId) => {
    if (selectedType.value === "bonus" && newBankId) {
      const selectedPromotion = promotionList.value.find(
        (promo) => promo._id === newBankId
      );
      if (selectedPromotion && selectedPromotion.claimtype === "Exact") {
        formData.value.amount = selectedPromotion.bonusexact;
      } else {
        formData.value.amount = "";
      }
    }
  }
);
</script>

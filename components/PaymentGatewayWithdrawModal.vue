<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <div class="fixed inset-0 bg-black bg-opacity-50" />

      <div
        class="fixed inset-0 flex items-center justify-center p-4 max-md:p-3"
      >
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          class="max-md:w-full w-full max-w-[40rem]"
        >
          <DialogPanel
            class="h-[70vh] max-h-[800px] transform rounded-2xl bg-white shadow-xl transition-all flex flex-col overflow-hidden"
          >
            <div class="flex-shrink-0 p-6 border-b max-md:p-4">
              <DialogTitle
                class="text-xl font-semibold text-gray-900 max-md:text-lg"
              >
                <div class="flex items-center gap-4 max-md:gap-3">
                  <div
                    class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"
                  ></div>
                  <h2 class="text-xl font-semibold max-md:text-lg">
                    {{ $t("gateway_withdraw") }}
                  </h2>
                </div>
              </DialogTitle>
            </div>

            <div class="flex-1 overflow-y-auto p-6 max-md:p-4">
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

              <!-- Step 1: User Search -->
              <div v-if="currentStep === 0">
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
                        @keyup.enter="searchUser"
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
                        <div class="font-medium max-md:text-sm">
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

              <div v-else-if="currentStep === 1">
                <div class="space-y-4 max-md:space-y-3">
                  <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
                    <div class="flex items-center gap-3 mb-2">
                      <img
                        v-if="gateway?.logo"
                        :src="gateway.logo"
                        :alt="gateway.name"
                        class="w-12 h-12 object-contain rounded max-md:w-10 max-md:h-10"
                      />
                      <div>
                        <p class="text-sm text-gray-600 max-md:text-xs">
                          {{ $t("payment_gateway") }}
                        </p>
                        <p class="text-lg font-semibold max-md:text-base">
                          {{ gateway?.name }}
                        </p>
                      </div>
                    </div>
                    <div class="mt-3 pt-3 border-t">
                      <p class="text-sm text-gray-600 max-md:text-xs">
                        {{ $t("gateway_balance") }}
                      </p>
                      <p
                        class="text-xl font-bold max-md:text-lg"
                        :class="
                          gatewayBalance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        "
                      >
                        {{ formatCurrency(gatewayBalance) }}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("withdraw_amount") }}
                    </label>
                    <input
                      v-model.number="formData.amount"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      :max="gatewayBalance"
                      class="w-full px-4 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                      :placeholder="$t('enter_withdraw_amount')"
                    />
                    <p
                      class="text-sm text-gray-500 mt-1 max-md:text-xs max-md:mt-0.5"
                    >
                      {{ $t("minimum_withdraw") }}:
                      {{ formatCurrency(gateway?.minWithdraw || 0) }} -
                      {{ $t("maximum_withdraw") }}:
                      {{ formatCurrency(gateway?.maxWithdraw || 0) }}
                    </p>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("user_bank_account") }}
                    </label>
                    <CustomSelect
                      v-model="selectedBankId"
                      @change="handleBankChange"
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
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("available_banks") }}
                    </label>
                    <div class="relative">
                      <div
                        @click="toggleBankDropdown"
                        class="w-full px-3 py-2 border rounded-lg cursor-pointer bg-white flex items-center justify-between max-md:px-2 max-md:py-1.5 max-md:text-sm"
                      >
                        <span
                          :class="
                            formData.bankName
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          "
                          class="truncate flex-1 mr-2"
                          :title="formData.bankName"
                        >
                          {{ formData.bankName || $t("select_bank") }}
                        </span>
                        <Icon
                          icon="mingcute:down-line"
                          class="w-5 h-5 transition-transform flex-shrink-0 max-md:w-4 max-md:h-4"
                          :class="showBankDropdown ? 'rotate-180' : ''"
                        />
                      </div>

                      <Teleport to="body">
                        <div
                          v-if="showBankDropdown"
                          class="fixed z-[60] bg-white border rounded-lg shadow-2xl flex flex-col overflow-hidden"
                          :style="dropdownStyle"
                        >
                          <div
                            class="p-3 border-b bg-white flex-shrink-0 max-md:p-2"
                          >
                            <input
                              ref="bankSearchInput"
                              v-model="bankSearchQuery"
                              type="text"
                              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-md:px-2 max-md:py-1.5 max-md:text-sm"
                              :placeholder="$t('search_bank')"
                              @click.stop
                            />
                            <p class="text-xs text-gray-500 mt-1">
                              {{ filteredBankCodes.length }}
                              {{ $t("banks_available") }}
                            </p>
                          </div>

                          <div class="overflow-y-auto flex-1">
                            <div
                              v-for="bank in filteredBankCodes"
                              :key="bank.bank_code"
                              @click="selectBankCode(bank)"
                              class="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 transition-colors max-md:px-3 max-md:py-2"
                            >
                              <div
                                class="font-medium text-sm max-md:text-xs break-words"
                              >
                                {{ bank.bank_name }}
                              </div>
                              <div
                                class="text-xs text-gray-500 mt-1 max-md:text-[10px]"
                              >
                                {{ $t("code") }}: {{ bank.bank_code }}
                              </div>
                            </div>

                            <div
                              v-if="filteredBankCodes.length === 0"
                              class="px-4 py-12 text-center text-gray-500 max-md:px-3 max-md:py-8 max-md:text-sm"
                            >
                              <Icon
                                icon="mingcute:search-3-line"
                                class="w-12 h-12 mx-auto mb-2 text-gray-400 max-md:w-10 max-md:h-10"
                              />
                              {{ $t("no_banks_found") }}
                            </div>
                          </div>
                        </div>
                      </Teleport>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                      >
                        {{ $t("account_holder_name") }}
                      </label>
                      <input
                        v-model="formData.accountHolder"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                        :placeholder="$t('enter_account_holder')"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                      >
                        {{ $t("account_number") }}
                      </label>
                      <input
                        v-model="formData.accountNumber"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                        :placeholder="$t('enter_account_number')"
                      />
                    </div>
                  </div>

                  <div
                    v-if="formData.bankCode"
                    class="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100 max-md:p-3"
                  >
                    <div class="flex items-start gap-3">
                      <div class="bg-indigo-600 rounded-full p-2 flex-shrink-0">
                        <Icon
                          icon="mingcute:bank-fill"
                          class="w-5 h-5 text-white max-md:w-4 max-md:h-4"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-xs text-indigo-600 font-medium mb-1 max-md:text-[10px]"
                        >
                          {{ $t("selected_bank") }}
                        </p>
                        <p
                          class="font-semibold text-gray-900 text-sm leading-tight max-md:text-xs break-words"
                        >
                          {{ formData.bankName }}
                        </p>
                        <div class="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            class="inline-flex items-center px-2 py-1 bg-white rounded-md text-xs max-md:text-[10px]"
                          >
                            <Icon
                              icon="mingcute:hashtag-line"
                              class="w-3 h-3 mr-1 text-gray-500"
                            />
                            <span class="text-gray-700 font-mono">{{
                              formData.bankCode
                            }}</span>
                          </span>
                          <button
                            @click="clearBankSelection"
                            class="inline-flex items-center px-2 py-1 bg-red-100 text-red-600 rounded-md text-xs hover:bg-red-200 transition-colors max-md:text-[10px]"
                          >
                            <Icon
                              icon="mingcute:close-line"
                              class="w-3 h-3 mr-1"
                            />
                            {{ $t("change") }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex-shrink-0 p-6 border-t bg-gray-50 max-md:p-4">
              <div
                class="flex justify-end gap-3 max-md:gap-2 max-md:flex-col-reverse"
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
                  v-if="currentStep < 1"
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
                  :disabled="!isValidWithdraw"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg lg:hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:order-1"
                >
                  {{ $t("confirm_withdraw") }}
                </LoadingButton>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

const props = defineProps({
  isOpen: Boolean,
  gateway: {
    type: Object,
    default: null,
  },
});

const bankSearchInput = ref(null);
const dropdownTrigger = ref(null);
const dropdownStyle = ref({});
const dropdownMaxHeight = ref("400px");

const emit = defineEmits(["close", "success"]);
const { publicGet, publicPost, get, post } = useApiEndpoint();
const currency = useCurrency();

const isButtonLoading = ref(false);
const isSearchButtonLoading = ref(false);

const steps = [
  { en: "User", zh: "用户" },
  { en: "Details", zh: "详情" },
];

const currentStep = ref(0);
const username = ref("");
const userInfo = ref(null);
const userBankList = ref([]);
const selectedBankId = ref("");

const bankSearchQuery = ref("");
const showBankDropdown = ref(false);

const formData = ref({
  amount: "",
  bankName: "",
  bankCode: "",
  accountHolder: "",
  accountNumber: "",
});

const gatewayBalance = computed(() => props.gateway?.balance || 0);

const balanceAfterWithdraw = computed(() => {
  const amount = Number(formData.value.amount) || 0;
  return gatewayBalance.value - amount;
});

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return userInfo.value !== null;
  }
  return true;
});

// ✅ Get bank codes directly from gateway prop
const bankCodes = computed(() => {
  if (!props.gateway?.availableBankCodes) {
    return [];
  }

  return props.gateway.availableBankCodes
    .filter((bank) => bank.active)
    .map((bank) => ({
      bank_code: bank.bankcode,
      bank_name: bank.bankname,
    }));
});

const filteredBankCodes = computed(() => {
  if (!bankSearchQuery.value) {
    return bankCodes.value;
  }

  const query = bankSearchQuery.value.toLowerCase();
  const filtered = bankCodes.value.filter(
    (bank) =>
      bank.bank_name.toLowerCase().includes(query) ||
      bank.bank_code.toLowerCase().includes(query)
  );

  return filtered;
});

const toggleBankDropdown = (event) => {
  dropdownTrigger.value = event.currentTarget;
  showBankDropdown.value = !showBankDropdown.value;

  if (showBankDropdown.value) {
    calculateDropdownPosition();
    nextTick(() => {
      bankSearchInput.value?.focus();
    });
  }
};

const calculateDropdownPosition = () => {
  if (!dropdownTrigger.value) return;

  const trigger = dropdownTrigger.value;
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const dropdownWidth = window.innerWidth < 768 ? viewportWidth - 32 : 600;

  let left = rect.left;

  // Prevent horizontal overflow
  if (left + dropdownWidth > viewportWidth - 16) {
    left = viewportWidth - dropdownWidth - 16;
  }

  if (left < 16) {
    left = 16;
  }

  const top = rect.bottom + 8;

  // ✅ Calculate safe max height
  const spaceBelow = viewportHeight - top - 20;
  const maxHeight = Math.min(500, spaceBelow);

  dropdownMaxHeight.value = `${maxHeight}px`;

  dropdownStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${dropdownWidth}px`,
    // ✅ Add max-height to the style object
    maxHeight: `${maxHeight}px`,
  };
};

const selectBankCode = (bank) => {
  formData.value.bankName = bank.bank_name;
  formData.value.bankCode = bank.bank_code;
  showBankDropdown.value = false;
  bankSearchQuery.value = "";
};

const handleClickOutside = (event) => {
  if (
    !event.target.closest(".relative") &&
    !event.target.closest('[class*="fixed z-[60]"]')
  ) {
    showBankDropdown.value = false;
    bankSearchQuery.value = "";
  }
};

const handleResize = () => {
  if (showBankDropdown.value) {
    calculateDropdownPosition();
  }
};

const handleBankChange = () => {
  const selectedBank = userBankList.value.find(
    (bank) => bank._id === selectedBankId.value
  );
  if (selectedBank) {
    formData.value.accountHolder = selectedBank.name;
    formData.value.accountNumber = selectedBank.banknumber;
  }
};

const isValidWithdraw = computed(() => {
  if (!formData.value.amount) return false;
  if (
    !formData.value.bankName ||
    !formData.value.bankCode ||
    !formData.value.accountHolder ||
    !formData.value.accountNumber
  )
    return false;

  const amount = Number(formData.value.amount);
  if (amount <= 0 || amount > gatewayBalance.value) return false;
  if (props.gateway?.minWithdraw && amount < props.gateway.minWithdraw)
    return false;
  if (props.gateway?.maxWithdraw && amount > props.gateway.maxWithdraw)
    return false;

  return true;
});

const formatCurrency = (value) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.value,
  }).format(value || 0);
  return formatted.replace(/^(A?\$)/, "$1 ");
};

const clearBankSelection = () => {
  formData.value.bankName = "";
  formData.value.bankCode = "";
  bankSearchQuery.value = "";
};

const searchUser = async () => {
  isSearchButtonLoading.value = true;
  try {
    const { data } = await publicGet(`search/${username.value}`);
    if (data.success) {
      userInfo.value = data.data;
      await fetchUserBankList();
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
  } finally {
    isSearchButtonLoading.value = false;
  }
};

const fetchUserBankList = async () => {
  try {
    if (!userInfo.value?.username) return;
    const { data } = await get(`user/bankaccounts/${userInfo.value.username}`);
    if (data.success) {
      userBankList.value = data.data;
      if (data.data.length > 0) {
        selectedBankId.value = data.data[0]._id;
        handleBankChange();
      }
    }
  } catch (error) {
    console.error("Error fetching user banks:", error);
  }
};

const nextStep = () => {
  if (currentStep.value < 1) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    if (currentStep.value === 1) {
      userInfo.value = null;
      username.value = "";
      userBankList.value = [];
      selectedBankId.value = "";
      bankSearchQuery.value = "";
      formData.value = {
        amount: "",
        bankName: "",
        bankCode: "",
        accountHolder: "",
        accountNumber: "",
      };
    }
    currentStep.value--;
  }
};

const handleSubmit = async () => {
  if (!isValidWithdraw.value) return;

  const result = await Swal.fire({
    title: $t("withdraw_confirmation_title"),
    text: $t("withdraw_confirmation_text"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: $t("confirm"),
    cancelButtonText: $t("cancel"),
  });

  if (!result.isConfirmed) return;

  isButtonLoading.value = true;
  try {
    const { data } = await post(
      `${props.gateway.withdrawAPI}/${userInfo.value._id}`,
      {
        userId: userInfo.value._id,
        username: userInfo.value.username,
        amount: Number(formData.value.amount),
        bankName: formData.value.bankName,
        bankCode: formData.value.bankCode,
        accountHolder: formData.value.accountHolder,
        accountNumber: formData.value.accountNumber,
      }
    );

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
        showConfirmButton: false,
      });

      emit("success");
      closeModal();
    }
  } catch (error) {
    console.error("Error withdrawing from gateway:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value = false;
  }
};

const closeModal = () => {
  emit("close");
  currentStep.value = 0;
  username.value = "";
  userInfo.value = null;
  userBankList.value = [];
  selectedBankId.value = "";
  bankSearchQuery.value = "";
  formData.value = {
    amount: "",
    bankName: "",
    bankCode: "",
    accountHolder: "",
    accountNumber: "",
  };
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleResize, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleResize, true);
});
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }
}
</style>

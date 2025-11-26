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
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                    : 'border-gray-200 lg:hover:border-green-300 lg:hover:bg-green-50/50',
                ]"
              >
                <div class="flex items-center justify-between mb-2 max-md:mb-1">
                  <span class="font-semibold text-gray-800 max-md:text-sm">
                    {{ kiosk.name }}
                  </span>
                  <Icon
                    v-if="formData.kioskId === kiosk._id"
                    icon="mdi:check-circle"
                    class="w-5 h-5 text-green-600 max-md:w-4 max-md:h-4"
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
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                required
              />
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
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
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

const { get, post, publicPost } = useApiEndpoint();
const currency = useCurrency();
const isLoading = ref(false);
const isLoadingBalances = ref(false);
const kioskListWithBalances = ref([]);

const formData = ref({
  amount: "",
  kioskId: "",
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

  const selectedKiosk = selectedKioskInfo.value;

  if (!selectedKiosk?.userKioskId) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("user_not_registered_kiosk"),
    });
    return;
  }

  try {
    const result = await Swal.fire({
      title: $t("confirm_deposit"),
      html: `
        <div class="text-left">
          <p><strong>${$t("userid")}:</strong> ${props.userData?.userid}</p>
          <p><strong>${$t("user_kiosk_id")}:</strong> ${
        selectedKiosk.userKioskId
      }</p>
          <p><strong>${$t("amount")}:</strong> ${currency.value} ${formatAmount(
        formData.value.amount
      )}</p>
          <p><strong>${$t("kiosk")}:</strong> ${selectedKiosk.name}</p>
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
    const transferResponse = await post(
      `${selectedKiosk.transferInAPI}/${props.userData?._id}`,
      {
        transferAmount: Number(formData.value.amount),
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
    const { data } = await post("admin-direct-deposit", {
      userId: props.userData?._id,
      username: props.userData?.username,
      amount: Number(formData.value.amount),
      kioskId: formData.value.kioskId,
      kioskName: selectedKiosk.name,
      userKioskId: selectedKiosk.userKioskId,
      remark: formData.value.remark || "Admin Direct Deposit",
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("success");
      closeModal();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
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

const closeModal = () => {
  formData.value = {
    amount: "",
    kioskId: "",
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
    }
  }
);
</script>

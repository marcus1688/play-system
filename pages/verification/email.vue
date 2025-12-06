<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("email_management") }}
        </h1>
      </div>
    </div>

    <div
      class="grid grid-cols-3 max-xl:grid-cols-2 gap-6 mb-6 max-lg:grid-cols-1 max-md:gap-4 max-md:mb-4"
    >
      <!-- Email Status Card -->
      <div class="bg-white p-6 rounded-lg shadow max-md:p-4">
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="text-lg font-medium text-gray-800 mb-2 max-md:text-base max-md:mb-1.5"
            >
              {{ $t("email_status") }}
            </h2>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("enable_disable_email_service") }}
            </p>
          </div>
          <BaseToggleSwitch
            v-model="emailStatus"
            @update:modelValue="updateEmailStatus"
          />
        </div>
        <div class="mt-4 max-md:mt-3">
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium max-md:px-2 max-md:py-2 max-md:text-xs',
              emailStatus
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800',
            ]"
          >
            {{ emailStatus ? $t("active") : $t("deactivated") }}
          </span>
        </div>
      </div>

      <!-- Current Balance Card -->
      <div class="bg-white p-6 rounded-lg shadow max-md:p-4">
        <div class="flex items-center justify-between mb-4 max-md:mb-3">
          <div>
            <h2 class="text-lg font-medium text-gray-800 max-md:text-base">
              {{ $t("current_balance") }}
            </h2>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("available_email_credits") }}
            </p>
          </div>
          <div class="flex items-center gap-2 max-md:gap-1">
            <button
              @click="refreshBalance"
              class="p-2 text-indigo-600 lg:hover:text-indigo-500 max-md:p-1.5"
            >
              <Icon
                icon="heroicons:arrow-path"
                class="w-5 h-5 max-md:w-4 max-md:h-4"
              />
            </button>
            <button
              v-if="adminUserData.role === 'superadmin'"
              @click="showUpdateBalanceModal = true"
              class="p-2 text-indigo-600 lg:hover:text-indigo-500 max-md:p-1.5"
            >
              <Icon
                icon="heroicons:pencil-square"
                class="w-5 h-5 max-md:w-4 max-md:h-4"
              />
            </button>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 max-md:text-2xl">
          ${{ currentBalance }}
        </div>
      </div>

      <!-- Minimum Balance Card -->
      <div class="bg-white p-6 rounded-lg shadow max-md:p-4">
        <div class="flex items-center justify-between mb-4 max-md:mb-3">
          <div>
            <h2 class="text-lg font-medium text-gray-800 max-md:text-base">
              {{ $t("minimum_balance_alert") }}
            </h2>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("set_minimum_balance_threshold") }}
            </p>
          </div>
          <button
            @click="handleUpdateMinBalance"
            class="p-2 text-indigo-600 lg:hover:text-indigo-500 max-md:p-1.5"
          >
            <Icon
              icon="heroicons:pencil-square"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
        </div>
        <div class="text-3xl font-bold text-gray-900 max-md:text-2xl">
          ${{ minBalance.toFixed(2) }}
        </div>
      </div>

      <!-- Email Pricing Card -->
      <div class="bg-white p-6 rounded-lg shadow max-md:p-4">
        <div class="flex justify-between items-start mb-4 max-md:mb-3">
          <div>
            <h2 class="text-lg font-medium text-gray-800 max-md:text-base">
              {{ $t("email_pricing") }}
            </h2>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("current_rate_per_email") }}
            </p>
          </div>
          <div class="flex items-center gap-2 max-md:gap-1">
            <button
              @click="refreshPricing"
              class="p-2 text-indigo-600 lg:hover:text-indigo-500 max-md:p-1.5"
            >
              <Icon
                icon="heroicons:arrow-path"
                class="w-5 h-5 max-md:w-4 max-md:h-4"
              />
            </button>
            <button
              v-if="adminUserData.role === 'superadmin'"
              @click="showUpdatePricingModal = true"
              class="p-2 text-indigo-600 lg:hover:text-indigo-500 max-md:p-1.5"
            >
              <Icon
                icon="heroicons:pencil-square"
                class="w-5 h-5 max-md:w-4 max-md:h-4"
              />
            </button>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 max-md:text-2xl">
          ${{ emailPrice }}/{{ $t("email") }}
        </div>
        <p class="text-sm text-gray-500 mt-2 max-md:text-xs max-md:mt-1.5">
          {{ $t("last_updated") }}: {{ formatDate(lastPriceUpdate) }}
        </p>
      </div>
    </div>

    <!-- Modals -->
    <EmailBalanceModal
      v-model:show="showUpdateBalanceModal"
      :current-balance="currentBalance"
      @submit="handleBalanceUpdate"
    />

    <EmailMinBalanceModal
      v-model:show="showMinBalanceModal"
      :current-min-balance="minBalance"
      @submit="handleMinBalanceSubmit"
    />

    <EmailPricingModal
      v-model:show="showUpdatePricingModal"
      :current-price="emailPrice"
      @submit="handlePricingUpdate"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

// State
const showMinBalanceModal = ref(false);
const showUpdateBalanceModal = ref(false);
const showUpdatePricingModal = ref(false);
const minBalance = ref(0);
const adminUserData = useState("adminUserData");
const isPageLoading = ref(true);
const emailStatus = ref(false);
const currentBalance = ref(0);
const emailPrice = ref(0);
const lastPriceUpdate = ref(new Date());
const { get, put } = useApiEndpoint();

const fetchData = async () => {
  try {
    const balanceResponse = await get("email-balance");
    if (balanceResponse.data.success) {
      currentBalance.value = balanceResponse.data.data.balance;
      emailStatus.value = balanceResponse.data.data.status;
      minBalance.value = balanceResponse.data.data.minBalance;
    }

    const pricingResponse = await get("email-pricing");
    if (pricingResponse.data.success) {
      emailPrice.value = pricingResponse.data.data.pricing;
      lastPriceUpdate.value = new Date();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch email data",
    });
  } finally {
    isPageLoading.value = false;
  }
};

const updateEmailStatus = async () => {
  try {
    const response = await put("email-status");
    if (response.data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
    } else {
      emailStatus.value = !emailStatus.value;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    emailStatus.value = !emailStatus.value;
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const handleBalanceUpdate = async (data) => {
  try {
    const response = await put("email-balance", {
      operation: data.operation,
      amount: data.amount,
    });

    if (response.data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
      await fetchData();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const handlePricingUpdate = async (data) => {
  try {
    const response = await put("email-pricing", {
      pricing: data.price,
    });

    if (response.data.success) {
      emailPrice.value = data.price;
      lastPriceUpdate.value = new Date();
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const refreshBalance = async () => {
  try {
    isPageLoading.value = true;
    const response = await get("email-balance");
    if (response.data.success) {
      currentBalance.value = response.data.data.balance;
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isPageLoading.value = false;
  }
};

const refreshPricing = async () => {
  try {
    isPageLoading.value = true;
    const response = await get("email-pricing");
    if (response.data.success) {
      emailPrice.value = response.data.data.pricing;
      lastPriceUpdate.value = new Date();
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isPageLoading.value = false;
  }
};

// Min balance management
const handleUpdateMinBalance = () => {
  showMinBalanceModal.value = true;
};

const handleMinBalanceSubmit = async ({ minBalance: newMinBalance }) => {
  try {
    const response = await put("email-min-balance", {
      minBalance: Number(newMinBalance),
    });
    if (response.data.success) {
      minBalance.value = Number(newMinBalance);
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

onMounted(() => {
  fetchData();
});

useHead({
  title: "Play System | Verification Email",
});
</script>

<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("payment_gateway_withdraw") }}
        </h1>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-md:gap-4">
      <div
        v-for="gateway in gateways"
        :key="gateway._id"
        class="bg-white rounded-lg shadow-lg p-6 max-md:p-4"
      >
        <div class="flex items-center gap-4 mb-4 max-md:gap-3 max-md:mb-3">
          <img
            v-if="gateway.logo"
            :src="gateway.logo"
            :alt="gateway.name"
            class="w-16 h-16 object-contain rounded max-md:w-12 max-md:h-12"
          />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 max-md:text-base">
              {{ gateway.name }}
            </h3>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("gateway_balance") }}
            </p>
          </div>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg mb-4 max-md:p-3 max-md:mb-3">
          <p class="text-sm text-gray-600 mb-1 max-md:text-xs">
            {{ $t("available_balance") }}
          </p>
          <p
            class="text-2xl font-bold max-md:text-xl"
            :class="gateway.balance >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ formatCurrency(gateway.balance || 0) }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4 max-md:gap-2 max-md:mb-3">
          <div class="bg-blue-50 p-3 rounded max-md:p-2">
            <p class="text-xs text-gray-600 mb-1">
              {{ $t("minimum_withdraw") }}
            </p>
            <p class="text-sm font-semibold text-gray-800 max-md:text-xs">
              {{ formatCurrency(gateway.minWithdraw || 0) }}
            </p>
          </div>
          <div class="bg-blue-50 p-3 rounded max-md:p-2">
            <p class="text-xs text-gray-600 mb-1">
              {{ $t("maximum_withdraw") }}
            </p>
            <p class="text-sm font-semibold text-gray-800 max-md:text-xs">
              {{ formatCurrency(gateway.maxWithdraw || 0) }}
            </p>
          </div>
        </div>

        <button
          @click="handleWithdraw(gateway)"
          :disabled="!gateway.balance || gateway.balance <= 0"
          class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          {{ $t("withdraw") }}
        </button>
      </div>

      <div
        v-if="gateways.length === 0"
        class="col-span-full flex flex-col items-center justify-center py-20 max-md:py-12"
      >
        <img
          src="/images/empty2.png"
          alt="Empty State"
          class="w-32 h-auto opacity-80 mb-4 max-md:w-24"
        />
        <p class="text-gray-500 max-md:text-sm">
          {{ $t("no_gateways_available") }}
        </p>
      </div>
    </div>

    <PaymentGatewayWithdrawModal
      :is-open="showWithdrawModal"
      :gateway="selectedGateway"
      @close="showWithdrawModal = false"
      @success="handleWithdrawSuccess"
    />
  </div>
</template>

<script setup>
const isPageLoading = ref(true);
const { publicGet } = useApiEndpoint();
const currency = useCurrency();

const gateways = ref([]);
const showWithdrawModal = ref(false);
const selectedGateway = ref(null);

const formatCurrency = (value) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.value,
  }).format(value);
  return formatted.replace(/^(A?\$)/, "$1 ");
};

const handleWithdraw = (gateway) => {
  selectedGateway.value = gateway;
  showWithdrawModal.value = true;
};

const handleWithdrawSuccess = () => {
  fetchGateways();
};

const fetchGateways = async () => {
  try {
    const { data } = await publicGet("payment-gateways");
    if (data.success) {
      gateways.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching payment gateways:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("network_error"),
    });
  }
};

onMounted(async () => {
  await fetchGateways();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Payment Gateway Withdraw",
});
</script>

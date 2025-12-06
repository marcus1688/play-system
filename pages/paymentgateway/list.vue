<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <PaymentGatewayBalanceModal
      v-model:show="showBalanceModal"
      :gateway="selectedGateway"
      @success="fetchGateways"
    />
    <!-- Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("payment_gateway_list") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-between p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_gateway')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="gateway in paginatedGateways"
              :key="gateway._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ gateway.name }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <img
                  v-if="gateway.logo"
                  :src="gateway.logo"
                  alt="Gateway Logo"
                  class="w-32 h-auto mx-auto max-md:w-24"
                />
                <p v-else>-</p>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatCurrency(gateway.minDeposit) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatCurrency(gateway.maxDeposit) }}
              </td>
              <!-- ✅ NEW: Balance Column -->
              <td
                class="px-6 py-4 text-sm font-semibold max-md:px-3 max-md:py-3 max-md:text-xs"
                :class="
                  gateway.balance >= 0 ? 'text-green-600' : 'text-red-600'
                "
              >
                {{ formatCurrency(gateway.balance || 0) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ gateway.remark || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ gateway.order || 0 }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="gateway.status"
                    @update:modelValue="() => handleStatusChange(gateway)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ gateway.status ? $t("active") : $t("inactive") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <!-- ✅ NEW: Adjust Balance Button -->
                  <button
                    @click="handleAdjustBalance(gateway)"
                    class="px-3 py-1 bg-green-600 text-white rounded lg:hover:bg-green-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("adjust") }}
                  </button>
                  <button
                    @click="handleEdit(gateway)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[gateway._id]"
                    @click="handleDelete(gateway)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>

            <tr
              v-if="paginatedGateways.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                :colspan="tableHeaders.length"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_payment_gateways_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedGateways.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- Payment Gateway Modal -->
    <PaymentGatewayModal
      v-model:show="showGatewayModal"
      :initial-data="editingGateway"
      @success="fetchGateways"
    />
  </div>
</template>

<script setup>
const router = useRouter();
const localePath = useLocalePath();
const isButtonLoading = ref({});
const isPageLoading = ref(true);
const tableHeaders = [
  { key: "name", label: "Name", labelCN: "名称" },
  { key: "logo", label: "Logo", labelCN: "标志" },
  { key: "minDeposit", label: "Min Deposit", labelCN: "最低充值" },
  { key: "maxDeposit", label: "Max Deposit", labelCN: "最高充值" },
  { key: "balance", label: "Balance", labelCN: "余额" }, // ✅ NEW
  { key: "remark", label: "Remark", labelCN: "备注" },
  { key: "order", label: "Order", labelCN: "顺序" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const { publicGet, publicDelete: del, publicPatch } = useApiEndpoint();
const gateways = ref([]);
const showGatewayModal = ref(false);
const showBalanceModal = ref(false); // ✅ NEW
const editingGateway = ref(null);
const selectedGateway = ref(null); // ✅ NEW
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const currency = useCurrency();

const formatCurrency = (value) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.value,
  }).format(value);
  return formatted.replace(/^(A?\$)/, "$1 ");
};

const filteredGateways = computed(() => {
  let filtered = [...gateways.value];

  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (gateway) =>
        gateway.name.toLowerCase().includes(searchTerm) ||
        (gateway.remark && gateway.remark.toLowerCase().includes(searchTerm))
    );
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredGateways.value.length / itemsPerPage.value)
);

const paginatedGateways = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredGateways.value.slice(start, end);
});

const handleCreate = () => {
  router.push(localePath("/paymentgateway/create"));
};

const handleEdit = (gateway) => {
  router.push(localePath(`/paymentgateway/${gateway._id}`));
};

// ✅ NEW: Handle Balance Adjustment
const handleAdjustBalance = (gateway) => {
  selectedGateway.value = gateway;
  showBalanceModal.value = true;
};

const handleStatusChange = async (gateway) => {
  try {
    const { data } = await publicPatch(
      `payment-gateways/${gateway._id}/toggle`
    );
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchGateways();
    } else {
      gateway.status = !gateway.status;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    gateway.status = !gateway.status;
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

const handleDelete = async (gateway) => {
  isButtonLoading.value[gateway._id] = true;
  try {
    const result = await Swal.fire({
      title: $t("delete_confirmation"),
      text: $t("delete_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm_delete"),
      cancelButtonText: $t("cancel"),
    });

    if (result.isConfirmed) {
      const { data } = await del(`payment-gateways/${gateway._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchGateways();
      }
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value[gateway._id] = false;
  }
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

const fetchGateways = async () => {
  try {
    const { data } = await publicGet("payment-gateways");
    if (data.success) {
      gateways.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching payment gateways:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch payment gateways",
    });
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchGateways();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Payment Gateway",
});
</script>

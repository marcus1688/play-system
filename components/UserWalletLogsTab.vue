<template>
  <div
    class="bg-white rounded-lg shadow min-w-[500px] min-h-[400px] overflow-x-auto max-md:min-w-0 max-md:min-h-[300px]"
  >
    <PageLoading v-if="isPageLoading" />
    <div class="p-4 border-b max-md:p-3">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4 max-md:gap-2">
          <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
          <h3 class="text-lg font-semibold max-md:text-base">
            {{ $t("wallet_logs") }}
          </h3>
        </div>
        <div v-if="['localhost', 'bm8my', 'bm8sg'].includes(getCompanyId())">
          <button
            @click="clearTurnover"
            :disabled="isClearingTurnover"
            class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors max-md:px-3 max-md:py-1.5 max-md:text-xs"
          >
            <span v-if="isClearingTurnover">{{ $t("clearing") }}...</span>
            <span v-else>{{ $t("clear_turnover") }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Date Filter -->
    <div class="p-4 max-md:p-3">
      <div class="flex justify-between gap-4 max-xl:flex-col max-md:gap-3">
        <div
          class="flex items-center gap-2 max-md:flex-col max-md:items-stretch"
        >
          <BaseDatePicker
            v-model="dateRange.startDate"
            :placeholder="$t('start_date')"
            :is-start-date="true"
            :other-date="dateRange.endDate"
            @update:otherDate="dateRange.endDate = null"
          />
          <span class="text-gray-500 max-md:hidden">-</span>
          <BaseDatePicker
            v-model="dateRange.endDate"
            :placeholder="$t('end_date')"
            :is-start-date="false"
            :other-date="dateRange.startDate"
          />
        </div>
        <DateFilterButtons ref="dateFilterRef" v-model="dateRange" />
      </div>
    </div>

    <div>
      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("no") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("amount") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("transaction_type") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("status") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("remark") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("time") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="log in paginatedLogs"
              :key="log._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.no }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ currency }} {{ log.amount }}
              </td>
              <td
                class="px-6 py-4 text-sm uppercase max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <span :class="getTransactionTypeClass(log.transactiontype)">
                  {{ log.transactiontype }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm uppercase max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <span :class="getStatusClass(log.status)">
                  {{ log.status }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.promotionnameEN || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.time }}
              </td>
            </tr>
            <tr
              v-if="paginatedLogs.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="7"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:py-3"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  <span class="max-md:text-xs">{{
                    $t("no_wallet_logs_found")
                  }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedLogs.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";
import moment from "moment-timezone";

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const { get, post } = useApiEndpoint();
const isPageLoading = ref(true);
const walletLogs = ref([]);
const currency = useCurrency();
const isClearingTurnover = ref(false);
const { getCompanyId } = useCompany();

const fetchWalletLogs = async () => {
  try {
    isPageLoading.value = true;
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }
    const response = await get(
      `userwalletlog/${props.userId}?${params.toString()}`
    );
    if (response.data.success) {
      walletLogs.value = response.data.data.map((log, index) => ({
        ...log,
        no: index + 1,
        time: formatDate(log.createdAt || log.transactiontime),
      }));
    }
  } catch (error) {
    console.error("Error fetching wallet logs:", error);
  } finally {
    isPageLoading.value = false;
  }
};

const dateRange = ref({
  startDate: null,
  endDate: null,
});

const currentPage = ref(1);
const perPage = ref(10);

const filteredLogs = computed(() => {
  let filtered = [...walletLogs.value];
  if (dateRange.value.startDate && dateRange.value.endDate) {
    filtered = filtered.filter((item) => {
      const itemDate = moment(item.createdAt || item.transactiontime).tz(
        "Asia/Kuala_Lumpur"
      );
      const startDate = moment(dateRange.value.startDate)
        .tz("Asia/Kuala_Lumpur")
        .startOf("day");
      const endDate = moment(dateRange.value.endDate)
        .tz("Asia/Kuala_Lumpur")
        .endOf("day");
      return itemDate.isBetween(startDate, endDate, null, "[]");
    });
  }
  return filtered;
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredLogs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / perPage.value);
});

const getTransactionTypeClass = (type) => {
  if (!type) return "bg-gray-100 text-gray-800 px-2 py-1 rounded";

  const typeLC = type.toLowerCase();

  if (typeLC.includes("deposit")) {
    return "bg-green-100 text-green-800 px-2 py-1 rounded";
  } else if (typeLC.includes("withdraw")) {
    return "bg-red-100 text-red-800 px-2 py-1 rounded";
  } else if (typeLC.includes("rebate")) {
    return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
  } else if (typeLC.includes("bonus")) {
    return "bg-purple-100 text-purple-800 px-2 py-1 rounded";
  } else if (
    typeLC.includes("agent commission") ||
    typeLC.includes("commission")
  ) {
    return "bg-indigo-100 text-indigo-800 px-2 py-1 rounded";
  } else if (typeLC.includes("others")) {
    return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
  } else {
    return "bg-amber-100 text-amber-800 px-2 py-1 rounded";
  }
};
const getStatusClass = (status) => {
  if (!status) return "bg-gray-100 text-gray-800 px-2 py-1 rounded";

  const classes = {
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    success: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
  };

  return `${
    classes[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  } px-2 py-1 rounded`;
};

const clearTurnover = async () => {
  try {
    const result = await Swal.fire({
      icon: "warning",
      title: $t("confirm"),
      text:
        $t("clear_turnover_confirm") ||
        "Are you sure you want to clear turnover requirements for this user?",
      showCancelButton: true,
      confirmButtonText: $t("confirm") || "Confirm",
      cancelButtonText: $t("cancel") || "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) {
      return;
    }
    isClearingTurnover.value = true;
    const response = await post(`user/${props.userId}/clear-turnover`);
    if (response.data.success) {
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
    console.error("Error clearing turnover:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isClearingTurnover.value = false;
  }
};

watch(
  [() => dateRange.value.startDate, () => dateRange.value.endDate],
  ([newStartDate, newEndDate], [oldStartDate, oldEndDate]) => {
    if (
      newStartDate &&
      newEndDate &&
      (newStartDate !== oldStartDate || newEndDate !== oldEndDate)
    ) {
      currentPage.value = 1;
      fetchWalletLogs();
    }
  }
);

onMounted(async () => {
  await fetchWalletLogs();
  isPageLoading.value = false;
});
</script>

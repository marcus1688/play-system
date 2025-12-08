<template>
  <div
    class="bg-white rounded-lg shadow min-w-[500px] min-h-[400px] overflow-x-auto max-md:min-w-0 max-md:min-h-[300px]"
  >
    <div class="p-4 border-b max-md:p-3">
      <div class="flex items-center gap-4 max-md:gap-2">
        <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
        <h3 class="text-lg font-semibold max-md:text-base">
          {{ $t("wallet_transfer_logs") }}
        </h3>
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
        <table class="w-full whitespace-nowrap text-center">
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
                {{ $t("username") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("game") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("transaction_type") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("amount") }}
              </th>

              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("game_balance") }}
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
                {{ log.username }}
              </td>
              <td
                class="px-6 py-4 text-sm flex justify-center items-center max-md:px-3 max-md:py-2"
              >
                <button
                  class="text-blue-600 lg:hover:text-blue-800 underline bg-transparent px-2 py-1 rounded text-sm max-md:px-1 max-md:py-2 max-md:text-xs"
                  @click="fetchBackendLink(log.gamename)"
                >
                  {{ log.gamename }}
                </button>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <span :class="getTransactionTypeClass(log.transactiontype)">
                  {{ log.transactiontype }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.amount }} {{ $t("points") }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.gamebalance }} {{ $t("points") }}
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.remark }}
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
                colspan="10"
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
        v-model="pagination.page"
        :totalPages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
});
const isButtonLoading = ref({});
const { get, post } = useApiEndpoint();
const logs = ref([]);
const isPageLoading = ref(false);
const currency = useCurrency();

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
      `user/${props.userId}/gamewalletlog?${params.toString()}`
    );
    if (response.data.success) {
      logs.value = response.data.data.map((log, index) => ({
        ...log,
        no: index + 1,
        time: formatDate(log.createdAt),
      }));
    }
  } catch (error) {
    console.error("Error fetching wallet logs:", error);
  } finally {
    isPageLoading.value = false;
  }
};

const fetchBackendLink = async (gameName) => {
  try {
    const response = await get(`kiosk/backend-link/${gameName}`);
    if (response.data.success) {
      const backendLink = response.data.data.backendLink;
      if (props.userData) {
        try {
          const textToCopy = props.userData.gameId || props.userData.username;
          if (textToCopy) {
            await navigator.clipboard.writeText(textToCopy);
          }
        } catch (copyError) {
          console.error("Failed to copy game ID:", copyError);
        }
      }
      window.open(backendLink, "_blank");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    console.error("Error fetching backend link:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("failed_to_fetch_backend_link"),
    });
  }
};

const dateRange = ref({
  startDate: null,
  endDate: null,
});

const pagination = ref({
  page: 1,
  perPage: 10,
});

const filters = ref({
  gameType: "",
  transactionType: "",
});

const games = computed(() => {
  return [...new Set(props.logs.map((log) => log.game))];
});

const filteredLogs = computed(() => {
  let filtered = [...logs.value];
  if (dateRange.value.startDate && dateRange.value.endDate) {
    filtered = filtered.filter((log) => {
      const logDate = new Date(log.createdAt);
      return (
        logDate >= new Date(dateRange.value.startDate) &&
        logDate <= new Date(dateRange.value.endDate)
      );
    });
  }
  return filtered;
});

const paginatedLogs = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.perPage;
  const end = start + pagination.value.perPage;
  return filteredLogs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / pagination.value.perPage);
});

const getTransactionTypeClass = (type) => {
  return type.toLowerCase().includes("in")
    ? "bg-green-100 text-green-800 px-2 py-1 rounded"
    : "bg-blue-100 text-blue-800 px-2 py-1 rounded";
};

const revertTransaction = async (logId) => {
  isButtonLoading.value[logId] = true;
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
    if (!result.isConfirmed) return;
    const { data } = await post(`revertgamewallet/${logId}`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        showConfirmButton: true,
      });
      fetchWalletLogs();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Revert failed:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("revert_failed"),
    });
  } finally {
    isButtonLoading.value[logId] = false;
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
      pagination.value.page = 1;
      fetchWalletLogs();
    }
  }
);

onMounted(() => {
  fetchWalletLogs();
});
</script>

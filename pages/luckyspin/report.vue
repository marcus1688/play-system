<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("lucky_spin_report") }}
        </h1>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid grid-cols-2 items-center gap-6 mb-6 max-2xl:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >{{ $t("date") }}:</label
          >
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
        </div>
        <DateFilterButtons ref="dateFilterRef" v-model="dateRange" />
      </div>

      <div
        class="flex items-center justify-between max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <button
          v-if="
            adminUserData?.role === 'superadmin' ||
            adminUserData?.role === 'admin'
          "
          @click="handleExport"
          :disabled="isExporting || filteredTransactions.length === 0"
          class="px-6 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          <Icon
            :icon="
              isExporting ? 'eos-icons:loading' : 'material-symbols:download'
            "
            class="max-md:w-4 max-md:h-4"
          />
          {{ $t("export_to_excel") }}
        </button>
        <div v-else></div>
        <BaseResetButton @click="handleReset" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-between p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4">
          <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:hidden"></div>
          <span class="text-xl font-semibold max-md:hidden">{{
            $t("report_details")
          }}</span>
        </div>
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch v-model="searchQuery" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap max-md:px-3 max-md:py-2"
              >
                {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="log in paginatedLogs"
              :key="log.id"
              class="lg:hover:bg-gray-50 text-center"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.playerusername }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.playerfullname }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.winning }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.beforefreespin }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.afterfreespin }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(log.createdAt) }}
              </td>
            </tr>
            <tr
              v-if="paginatedLogs.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="6"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_records_found") }}
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
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import moment from "moment-timezone";
import { formatDate } from "~/utils/dateFormatter";
import { Icon } from "@iconify/vue";

const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const tableHeaders = [
  { key: "username", label: "Username", labelCN: "用户名" },
  { key: "fullname", label: "Full Name", labelCN: "全名" },
  { key: "winning", label: "Winning", labelCN: "奖品" },
  { key: "beforefreespin", label: "Before Free Spin", labelCN: "旋转前" },
  { key: "afterfreespin", label: "After Free Spin", labelCN: "旋转后" },
  { key: "createdat", label: "Created At", labelCN: "创建时间" },
];

const currentPage = ref(1);
const itemsPerPage = ref(10);
const luckySpinLogs = ref([]);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);
const searchQuery = ref("");
const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
};

const filteredTransactions = computed(() => {
  if (!luckySpinLogs.value) return [];
  let filtered = [...luckySpinLogs.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.playerusername.toLowerCase().includes(searchTerm) ||
        item.playerfullname.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
);

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value
    .slice(start, end)
    .map((transaction, index) => ({
      ...transaction,
      no: start + index + 1,
    }));
});

const fetchLuckySpinLogs = async () => {
  const params = new URLSearchParams();
  if (dateRange.value.startDate) {
    params.append("startDate", dateRange.value.startDate);
  }
  if (dateRange.value.endDate) {
    params.append("endDate", dateRange.value.endDate);
  }
  try {
    const { get } = useApiEndpoint();
    const { data } = await get(`getLuckySpinLog?${params.toString()}`);
    luckySpinLogs.value = data.luckyspinlog;
  } catch (error) {
    console.error("Failed to fetch lucky spin logs:", error);
  }
};

const handleExport = async () => {
  try {
    const hasExportPermission =
      adminUserData.value?.role === "superadmin" ||
      adminUserData.value?.role === "admin";
    if (!hasExportPermission) {
      Swal.fire({
        icon: "error",
        title: $t("permission_denied"),
        text: $t("export_permission_required"),
      });
      return;
    }
    if (filteredTransactions.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = filteredTransactions.value.map((log, index) => ({
      no: index + 1,
      username: log.playerusername,
      fullname: log.playerfullname,
      winning: log.winning,
      beforeFreeSpin: log.beforefreespin,
      afterFreeSpin: log.afterfreespin,
      createdAt: formatDate(log.createdAt),
    }));
    let filename = "lucky_spin_report";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    }
    const result = await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("lucky_spin_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        username: { header: $t("username"), width: 20 },
        fullname: { header: $t("full_name"), width: 20 },
        winning: { header: $t("winning"), width: 20 },
        beforeFreeSpin: { header: $t("before_free_spin"), width: 15 },
        afterFreeSpin: { header: $t("after_free_spin"), width: 15 },
        createdAt: { header: $t("created_at"), width: 20 },
      },
      formatter: (value, key) => {
        return value;
      },
      beforeExport: () => {},
      afterExport: (success) => {
        if (success) {
          Swal.fire({
            icon: "success",
            title: $t("export_success"),
            text: $t("file_downloaded_successfully"),
            timer: 1500,
          });
        }
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    Swal.fire({
      icon: "error",
      title: $t("export_failed"),
      text: error.message,
    });
  }
};

watch(
  dateRange,
  () => {
    if (dateRange.value.startDate && dateRange.value.endDate) {
      currentPage.value = 1;
      fetchLuckySpinLogs();
    }
  },
  { deep: true }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchLuckySpinLogs();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Lucky Spin Report",
});
</script>

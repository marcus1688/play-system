<template>
  <div>
    <BonusClaimModal
      v-model:show="showClaimModal"
      :bonus-data="selectedBonus"
      :bonus-amount="selectedBonus?.bonusPoints || 0"
      :title="$t('attendancebonus')"
      claim-api="attendance-bonus/claim"
      claim-id-field="attendanceBonusId"
      @success="handleClaimSuccess"
    />
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("attendance_bonus_report") }}
          </h1>
        </div>
      </div>
      <button
        @click="handleManualRun"
        :disabled="isManualRunning"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 max-md:px-3 max-md:py-1.5 max-md:text-sm"
      >
        <Icon
          :icon="isManualRunning ? 'eos-icons:loading' : 'mdi:play-circle'"
          class="w-5 h-5 max-md:w-4 max-md:h-4"
        />
        <span class="max-sm:hidden">{{ $t("manual_run") }}</span>
      </button>
    </div>

    <!-- Filter Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid grid-cols-2 items-center gap-6 mb-6 max-2xl:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
          >
            {{ $t("date") }}:
          </label>
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
        class="flex justify-between max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <button
          v-if="
            adminUserData?.role === 'superadmin' ||
            adminUserData?.role === 'admin'
          "
          @click="handleExport"
          :disabled="isExporting || filteredRecords.length === 0"
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
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <BaseSearch
          v-model="searchQuery"
          :placeholder="$t('search_username')"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="header.sortable ? handleSort(header.key) : null"
              >
                <div class="flex items-center justify-center gap-1">
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                  <Icon
                    v-if="header.sortable"
                    :icon="
                      sortConfig.key === header.key
                        ? sortConfig.direction === 'asc'
                          ? 'material-symbols:arrow-upward'
                          : 'material-symbols:arrow-downward'
                        : 'material-symbols:unfold-more'
                    "
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(record, index) in paginatedRecords"
              :key="record._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ record.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ record.userid }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ record.username }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ record.weekLabel }}
              </td>
              <!-- Daily Deposits -->
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <Icon
                  :icon="
                    record.dailyDeposits?.monday
                      ? 'mdi:check-circle'
                      : 'mdi:close-circle'
                  "
                  :class="
                    record.dailyDeposits?.monday
                      ? 'text-green-500'
                      : 'text-red-400'
                  "
                  class="w-5 h-5 max-md:w-4 max-md:h-4"
                />
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <Icon
                  :icon="
                    record.dailyDeposits?.tuesday
                      ? 'mdi:check-circle'
                      : 'mdi:close-circle'
                  "
                  :class="
                    record.dailyDeposits?.tuesday
                      ? 'text-green-500'
                      : 'text-red-400'
                  "
                  class="w-5 h-5 max-md:w-4 max-md:h-4"
                />
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <Icon
                  :icon="
                    record.dailyDeposits?.wednesday
                      ? 'mdi:check-circle'
                      : 'mdi:close-circle'
                  "
                  :class="
                    record.dailyDeposits?.wednesday
                      ? 'text-green-500'
                      : 'text-red-400'
                  "
                  class="w-5 h-5 max-md:w-4 max-md:h-4"
                />
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <Icon
                  :icon="
                    record.dailyDeposits?.thursday
                      ? 'mdi:check-circle'
                      : 'mdi:close-circle'
                  "
                  :class="
                    record.dailyDeposits?.thursday
                      ? 'text-green-500'
                      : 'text-red-400'
                  "
                  class="w-5 h-5 max-md:w-4 max-md:h-4"
                />
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <Icon
                  :icon="
                    record.dailyDeposits?.friday
                      ? 'mdi:check-circle'
                      : 'mdi:close-circle'
                  "
                  :class="
                    record.dailyDeposits?.friday
                      ? 'text-green-500'
                      : 'text-red-400'
                  "
                  class="w-5 h-5 max-md:w-4 max-md:h-4"
                />
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <Icon
                  :icon="
                    record.dailyDeposits?.saturday
                      ? 'mdi:check-circle'
                      : 'mdi:close-circle'
                  "
                  :class="
                    record.dailyDeposits?.saturday
                      ? 'text-green-500'
                      : 'text-red-400'
                  "
                  class="w-5 h-5 max-md:w-4 max-md:h-4"
                />
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <Icon
                  :icon="
                    record.dailyDeposits?.sunday
                      ? 'mdi:check-circle'
                      : 'mdi:close-circle'
                  "
                  :class="
                    record.dailyDeposits?.sunday
                      ? 'text-green-500'
                      : 'text-red-400'
                  "
                  class="w-5 h-5 max-md:w-4 max-md:h-4"
                />
              </td>
              <td
                class="px-6 py-4 text-sm font-semibold max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ record.totalDaysDeposited }}/7
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium max-md:px-1.5 max-md:py-0.5 max-md:text-[10px]',
                    record.isFullAttendance
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ record.isFullAttendance ? $t("yes") : $t("no") }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm font-bold max-md:px-3 max-md:py-3 max-md:text-xs"
                :class="
                  record.bonusPoints > 0 ? 'text-indigo-600' : 'text-gray-400'
                "
              >
                {{ currency }} {{ record.bonusPoints }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="!record.claimed && record.isFullAttendance"
                    @click="openClaimModal(record)"
                    class="px-3 py-1.5 text-sm bg-indigo-600 text-white lg:hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm lg:hover:shadow-md max-md:px-2 max-md:py-1 max-md:text-xs"
                  >
                    {{ $t("claim") }}
                  </button>
                  <span
                    v-else-if="record.claimed"
                    class="px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed max-md:px-2 max-md:py-1 max-md:text-xs"
                  >
                    {{ $t("claimed") }}
                  </span>
                  <span
                    v-else
                    class="px-3 py-1.5 text-sm bg-gray-200 text-gray-500 rounded-lg max-md:px-2 max-md:py-1 max-md:text-xs"
                  >
                    {{ $t("not_eligible") }}
                  </span>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ record.claimedBy || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ record.claimedAt ? formatDate(record.claimedAt) : "-" }}
              </td>
            </tr>
            <tr
              v-if="paginatedRecords.length === 0"
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
                  {{ $t("no_records_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedRecords.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";
import { Icon } from "@iconify/vue";
import moment from "moment-timezone";

const currency = useCurrency();
const isPageLoading = ref(true);
const isManualRunning = ref(false);
const isClaimingBonus = ref({});
const { get, post } = useApiEndpoint();
const { isExporting, exportToExcel } = useExportExcel();
const adminUserData = useState("adminUserData");
const showClaimModal = ref(false);
const selectedBonus = ref(null);
const records = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);

const sortConfig = ref({
  key: null,
  direction: "asc",
});

const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号", sortable: false },
  { key: "userid", label: "User ID", labelCN: "用户ID", sortable: true },
  { key: "username", label: "Username", labelCN: "用户名", sortable: true },
  { key: "weekLabel", label: "Week", labelCN: "周期", sortable: true },
  { key: "monday", label: "Mon", labelCN: "周一", sortable: false },
  { key: "tuesday", label: "Tue", labelCN: "周二", sortable: false },
  { key: "wednesday", label: "Wed", labelCN: "周三", sortable: false },
  { key: "thursday", label: "Thu", labelCN: "周四", sortable: false },
  { key: "friday", label: "Fri", labelCN: "周五", sortable: false },
  { key: "saturday", label: "Sat", labelCN: "周六", sortable: false },
  { key: "sunday", label: "Sun", labelCN: "周日", sortable: false },
  { key: "totalDaysDeposited", label: "Days", labelCN: "天数", sortable: true },
  { key: "isFullAttendance", label: "Full", labelCN: "全勤", sortable: true },
  {
    key: "bonusAmount",
    label: "Bonus Amount",
    labelCN: "奖金金额",
    sortable: true,
  },
  { key: "action", label: "Action", labelCN: "操作", sortable: true },
  { key: "claimedBy", label: "Process By", labelCN: "处理人", sortable: true },
  {
    key: "claimedAt",
    label: "Claim Date",
    labelCN: "领取日期",
    sortable: true,
  },
];

const handleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

const fetchRecords = async () => {
  try {
    isPageLoading.value = true;
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }

    const { data } = await get(`attendance-bonus?${params.toString()}`);
    if (data.success) {
      records.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching attendance bonus records:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("failed_to_load_records"),
    });
  } finally {
    isPageLoading.value = false;
  }
};

const filteredRecords = computed(() => {
  let result = [...records.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (record) =>
        record.username.toLowerCase().includes(query) ||
        record.userid?.toLowerCase().includes(query)
    );
  }

  if (sortConfig.value.key) {
    result.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];

      if (sortConfig.value.key === "claimedAt") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      if (sortConfig.value.key === "isFullAttendance") {
        aVal = a.isFullAttendance ? 1 : 0;
        bVal = b.isFullAttendance ? 1 : 0;
      }

      if (sortConfig.value.key === "action") {
        const getPriority = (record) => {
          if (!record.claimed && record.isFullAttendance) return 2;
          if (record.claimed) return 1;
          return 0;
        };
        aVal = getPriority(a);
        bVal = getPriority(b);
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });
  }

  return result;
});

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRecords.value.slice(start, end).map((record, index) => ({
    ...record,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredRecords.value.length / itemsPerPage.value)
);

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
  fetchRecords();
};

const handleManualRun = async () => {
  try {
    const result = await Swal.fire({
      title: $t("confirm_manual_run"),
      text: $t("manual_run_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isManualRunning.value = true;
    const { data } = await post("attendance-bonus/manual-run");

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchRecords();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error running manual calculation:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("manual_run_failed"),
    });
  } finally {
    isManualRunning.value = false;
  }
};

const claimBonus = async (attendanceBonusId) => {
  try {
    const result = await Swal.fire({
      title: $t("confirm_claim"),
      text: $t("claim_attendance_bonus_confirmation"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isClaimingBonus.value[attendanceBonusId] = true;
    const { data } = await post("attendance-bonus/claim", {
      attendanceBonusId,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchRecords();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error claiming bonus:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("claim_failed"),
    });
  } finally {
    isClaimingBonus.value[attendanceBonusId] = false;
  }
};

const openClaimModal = (record) => {
  selectedBonus.value = record;
  showClaimModal.value = true;
};

const handleClaimSuccess = () => {
  fetchRecords();
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

    if (filteredRecords.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }

    const exportData = filteredRecords.value.map((record, index) => ({
      no: index + 1,
      userid: record.userid || "-",
      username: record.username,
      weekLabel: record.weekLabel,
      monday: record.dailyDeposits?.monday ? "✓" : "✗",
      tuesday: record.dailyDeposits?.tuesday ? "✓" : "✗",
      wednesday: record.dailyDeposits?.wednesday ? "✓" : "✗",
      thursday: record.dailyDeposits?.thursday ? "✓" : "✗",
      friday: record.dailyDeposits?.friday ? "✓" : "✗",
      saturday: record.dailyDeposits?.saturday ? "✓" : "✗",
      sunday: record.dailyDeposits?.sunday ? "✓" : "✗",
      totalDaysDeposited: `${record.totalDaysDeposited}/7`,
      isFullAttendance: record.isFullAttendance ? "Yes" : "No",
      bonusPoints: record.bonusPoints,
      claimed: record.claimed ? "Claimed" : "Pending",
      claimedBy: record.claimedBy || "-",
      claimedAt: record.claimedAt ? formatDate(record.claimedAt) : "-",
    }));

    const columns = {
      no: { header: "No", width: 8 },
      userid: { header: "User ID", width: 12 },
      username: { header: "Username", width: 15 },
      weekLabel: { header: "Week", width: 25 },
      monday: { header: "Mon", width: 8 },
      tuesday: { header: "Tue", width: 8 },
      wednesday: { header: "Wed", width: 8 },
      thursday: { header: "Thu", width: 8 },
      friday: { header: "Fri", width: 8 },
      saturday: { header: "Sat", width: 8 },
      sunday: { header: "Sun", width: 8 },
      totalDaysDeposited: { header: "Days", width: 10 },
      isFullAttendance: { header: "Full Attendance", width: 15 },
      bonusPoints: { header: "Points", width: 10 },
      claimed: { header: "Status", width: 12 },
      claimedBy: { header: "Process By", width: 15 },
      claimedAt: { header: "Claim Date", width: 18 },
    };

    let filename = "attendance_bonus_report";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    }

    await exportToExcel({
      data: exportData,
      filename,
      sheetName: "Attendance Bonus",
      columns,
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
  [() => dateRange.value.startDate, () => dateRange.value.endDate],
  ([newStartDate, newEndDate], [oldStartDate, oldEndDate]) => {
    if (
      newStartDate &&
      newEndDate &&
      (newStartDate !== oldStartDate || newEndDate !== oldEndDate)
    ) {
      currentPage.value = 1;
      fetchRecords();
    }
  }
);

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(async () => {
  const now = moment().tz("Asia/Kuala_Lumpur");
  const lastMonday = now.clone().subtract(1, "week").startOf("isoWeek");
  const lastSunday = now.clone().subtract(1, "week").endOf("isoWeek");
  dateRange.value.startDate = lastMonday.toDate();
  dateRange.value.endDate = lastSunday.toDate();
});

useHead({
  title: "Play System | Attendance Bonus Report",
});
</script>

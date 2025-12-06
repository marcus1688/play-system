<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <BonusClaimModal
      v-model:show="showClaimModal"
      :bonus-data="selectedBonus"
      :bonus-amount="selectedBonus?.bonusAmount || 0"
      :title="$t('vipmonthlybonus')"
      claim-api="vip-monthly-bonus/claim"
      claim-id-field="vipMonthlyBonusId"
      @success="handleClaimSuccess"
    />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("vip_monthly_bonus_report") }}
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
                {{ record.monthLabel }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium max-md:px-1.5 max-md:py-0.5 max-md:text-[10px]',
                    getVipClass(record.viplevel),
                  ]"
                >
                  {{ record.viplevel || "-" }}
                </span>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium max-md:px-1.5 max-md:py-0.5 max-md:text-[10px]',
                    getVipClass(record.thisMonthVip),
                  ]"
                >
                  {{ record.thisMonthVip || "-" }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm font-bold max-md:px-3 max-md:py-3 max-md:text-xs"
                :class="
                  record.bonusAmount > 0 ? 'text-indigo-600' : 'text-gray-400'
                "
              >
                {{ currency }} {{ formatAmount(record.bonusAmount) }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="!record.claimed && record.bonusAmount > 0"
                    @click="openClaimModal(record)"
                    class="px-3 py-1.5 text-sm bg-indigo-600 text-white lg:hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm lg:hover:shadow-md max-md:px-2 max-md:py-1 max-md:text-xs"
                  >
                    <Icon
                      v-if="isClaimingBonus[record._id]"
                      icon="eos-icons:loading"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    <span v-else>{{ $t("claim") }}</span>
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
  { key: "monthLabel", label: "Month", labelCN: "月份", sortable: true },
  { key: "viplevel", label: "VIP Level", labelCN: "VIP等级", sortable: true },
  {
    key: "thisMonthVip",
    label: "This Month VIP",
    labelCN: "本月VIP",
    sortable: true,
  },
  {
    key: "bonusAmount",
    label: "Bonus Amount",
    labelCN: "奖金金额",
    sortable: true,
  },
  { key: "action", label: "Action", labelCN: "操作", sortable: false },
  { key: "claimedBy", label: "Process By", labelCN: "处理人", sortable: true },
  {
    key: "claimedAt",
    label: "Claim Date",
    labelCN: "领取日期",
    sortable: true,
  },
];

const getVipClass = (level) => {
  if (!level) return "bg-gray-100 text-gray-600";
  const classes = {
    VIP1: "bg-amber-100 text-amber-800",
    VIP2: "bg-orange-100 text-orange-800",
    VIP3: "bg-blue-100 text-blue-800",
    VIP4: "bg-indigo-100 text-indigo-800",
    VIP5: "bg-purple-100 text-purple-800",
    VIP6: "bg-pink-100 text-pink-800",
    VIP7: "bg-red-100 text-red-800",
    VIP8: "bg-yellow-100 text-yellow-800",
  };
  return classes[level] || "bg-gray-100 text-gray-600";
};

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "0.00";
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append(
        "startDate",
        new Date(dateRange.value.startDate).toISOString()
      );
    }
    if (dateRange.value.endDate) {
      params.append("endDate", new Date(dateRange.value.endDate).toISOString());
    }

    const { data } = await get(`vip-monthly-bonus?${params.toString()}`);
    if (data.success) {
      records.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching VIP monthly bonus records:", error);
  }
};

const filteredRecords = computed(() => {
  let result = [...records.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((record) =>
      record.username.toLowerCase().includes(query)
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
      text: $t("vip_monthly_bonus_manual_run_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isManualRunning.value = true;
    const { data } = await post("vip-monthly-bonus/manual-run");

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

const claimBonus = async (vipMonthlyBonusId) => {
  try {
    const result = await Swal.fire({
      title: $t("confirm_claim"),
      text: $t("claim_vip_monthly_bonus_confirmation"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isClaimingBonus.value[vipMonthlyBonusId] = true;
    const { data } = await post("vip-monthly-bonus/claim", {
      vipMonthlyBonusId,
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
    isClaimingBonus.value[vipMonthlyBonusId] = false;
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
      username: record.username,
      monthLabel: record.monthLabel,
      viplevel: record.viplevel || "-",
      thisMonthVip: record.thisMonthVip || "-",
      bonusAmount: record.bonusAmount,
      status: record.claimed ? "Claimed" : "Pending",
      claimedBy: record.claimedBy || "-",
      claimedAt: record.claimedAt ? formatDate(record.claimedAt) : "-",
    }));

    const columns = {
      no: { header: "No", width: 8 },
      username: { header: "Username", width: 15 },
      monthLabel: { header: "Month", width: 15 },
      viplevel: { header: "VIP Level", width: 12 },
      thisMonthVip: { header: "This Month VIP", width: 15 },
      bonusAmount: { header: "Bonus Amount", width: 15 },
      status: { header: "Status", width: 12 },
      claimedBy: { header: "Process By", width: 15 },
      claimedAt: { header: "Claim Date", width: 18 },
    };

    let filename = "vip_monthly_bonus_report";
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
      sheetName: "VIP Monthly Bonus",
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

const openClaimModal = (record) => {
  selectedBonus.value = record;
  showClaimModal.value = true;
};

const handleClaimSuccess = () => {
  fetchRecords();
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
  dateRange.value.startDate = now.clone().startOf("month").toDate();
  dateRange.value.endDate = now.clone().endOf("month").toDate();

  await fetchRecords();
  isPageLoading.value = false;
});
useHead({
  title: "Play System | VIP Monthly Bonus Report",
});
</script>

<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("promo_code_report") }}
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
          :disabled="isExporting || filteredPromoClaims.length === 0"
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

    <!-- Report Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_username')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center">
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
              v-for="claim in paginatedClaims"
              :key="claim._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ claim.username }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ claim.code }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ claim.amount }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    claim.rewardType === 'luckySpinPoints'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{
                    claim.rewardType === "luckySpinPoints"
                      ? $i18n.locale === "zh"
                        ? "幸运转盘积分"
                        : "Lucky Spin Points"
                      : $i18n.locale === "zh"
                      ? "钱包"
                      : "Wallet"
                  }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(claim.createdAt) }}
              </td>
            </tr>
            <tr
              v-if="paginatedClaims.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="5"
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
        v-if="paginatedClaims.length !== 0"
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

const currency = useCurrency();
const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const { get } = useApiEndpoint();
const tableHeaders = [
  { key: "username", label: "Username", labelCN: "用户名" },
  { key: "code", label: "Code", labelCN: "促销码" },
  { key: "amount", label: "Amount", labelCN: "金额" },
  { key: "rewardType", label: "Reward Type", labelCN: "奖励类型" },
  { key: "claimedAt", label: "Claimed At", labelCN: "领取时间" },
];
const promoClaims = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);

const totalItems = computed(() => promoClaims.value.length);

const filteredPromoClaims = computed(() => {
  let filtered = [...promoClaims.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter((claim) =>
      claim.username.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredPromoClaims.value.length / itemsPerPage.value)
);
const paginatedClaims = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPromoClaims.value
    .slice(start, end)
    .map((promoclaim, index) => ({
      ...promoclaim,
    }));
});

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
  fetchPromoClaims();
};

const fetchPromoClaims = async () => {
  const params = new URLSearchParams();
  if (dateRange.value.startDate) {
    params.append("startDate", dateRange.value.startDate);
  }
  if (dateRange.value.endDate) {
    params.append("endDate", dateRange.value.endDate);
  }
  try {
    const { data } = await get(`promoclaimsadmin?${params.toString()}`);
    if (data.success) {
      promoClaims.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching claim history:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load claim history",
    });
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
    if (filteredPromoClaims.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = filteredPromoClaims.value.map((claim, index) => ({
      no: index + 1,
      username: claim.username,
      code: claim.code,
      amount: claim.amount,
      rewardType:
        claim.rewardType === "luckySpinPoints"
          ? $i18n.locale === "zh"
            ? "幸运转盘积分"
            : "Lucky Spin Points"
          : $i18n.locale === "zh"
          ? "钱包"
          : "Wallet",
      claimedAt: formatDate(claim.createdAt),
    }));
    const totalAmount = exportData.reduce(
      (acc, claim) => acc + parseFloat(claim.amount || 0),
      0
    );
    exportData.push({
      no: "",
      username: $t("total"),
      code: "",
      amount: totalAmount.toFixed(2),
      rewardType: "",
      claimedAt: "",
    });
    let filename = "promo_code_report";
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
      sheetName: $t("promo_code_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        username: { header: $t("username"), width: 20 },
        code: { header: $t("code"), width: 15 },
        amount: { header: $t("amount"), width: 15 },
        rewardType: { header: $t("reward_type"), width: 20 },
        claimedAt: { header: $t("claimed_at"), width: 20 },
      },
      formatter: (value, key) => {
        if (key === "amount" && typeof value === "number") {
          return value.toFixed(2);
        }
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
      fetchPromoClaims();
    }
  },
  { deep: true }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchPromoClaims();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Promo Code Report",
});
</script>

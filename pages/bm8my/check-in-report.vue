<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("checkin_report") }}
        </h1>
      </div>
    </div>

    <div
      class="grid grid-cols-4 max-xl:grid-cols-2 max-md:grid-cols-1 gap-4 mb-6 max-md:gap-3 max-md:mb-4"
    >
      <div class="bg-white p-4 rounded-lg shadow max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("total_users") }}
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-1 max-md:text-xl">
              {{ stats.totalUsers }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center max-md:w-10 max-md:h-10"
          >
            <Icon
              icon="mdi:account-group"
              class="w-6 h-6 text-blue-600 max-md:w-5 max-md:h-5"
            />
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("today_checkins") }}
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-1 max-md:text-xl">
              {{ stats.todayCheckins }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center max-md:w-10 max-md:h-10"
          >
            <Icon
              icon="mdi:calendar-check"
              class="w-6 h-6 text-green-600 max-md:w-5 max-md:h-5"
            />
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("active_streaks") }}
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-1 max-md:text-xl">
              {{ stats.activeStreaks }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center max-md:w-10 max-md:h-10"
          >
            <Icon
              icon="mdi:fire"
              class="w-6 h-6 text-orange-600 max-md:w-5 max-md:h-5"
            />
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow max-md:p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("pending_rewards") }}
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-1 max-md:text-xl">
              {{ stats.pendingRewards }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center max-md:w-10 max-md:h-10"
          >
            <Icon
              icon="mdi:gift"
              class="w-6 h-6 text-purple-600 max-md:w-5 max-md:h-5"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid grid-cols-3 gap-4 mb-6 max-lg:grid-cols-1 max-md:gap-3 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
          >
            {{ $t("search_username") }}
          </label>
          <input
            v-model="filters.username"
            type="text"
            :placeholder="$t('search_username')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-md:px-2 max-md:py-1.5 max-md:text-sm"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
          >
            {{ $t("min_streak") }}
          </label>
          <input
            v-model.number="filters.minStreak"
            type="number"
            min="0"
            :placeholder="$t('min_streak')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-md:px-2 max-md:py-1.5 max-md:text-sm"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
          >
            {{ $t("sort_by") }}
          </label>
          <CustomSelect v-model="filters.sortBy">
            <option value="streak">{{ $t("streak_high_to_low") }}</option>
            <option value="total">{{ $t("total_checkins") }}</option>
            <option value="recent">{{ $t("recent_checkin") }}</option>
          </CustomSelect>
        </div>
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
          :disabled="isExporting || filteredCheckins.length === 0"
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
        <button
          @click="handleReset"
          class="px-6 py-2 bg-gray-500 text-white rounded-lg lg:hover:bg-gray-600 flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          <Icon icon="mdi:refresh" class="max-md:w-4 max-md:h-4" />
          {{ $t("reset") }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
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
              v-for="checkin in paginatedCheckins"
              :key="checkin._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ checkin.username }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 inline-flex items-center gap-1"
                >
                  <Icon icon="mdi:fire" class="w-4 h-4" />
                  {{ checkin.currentStreak }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ checkin.totalCheckins }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(checkin.lastCheckIn) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ checkin.monthlyCheckInsCount }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    checkin.pendingRewardsCount > 0
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ checkin.pendingRewardsCount }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <button
                  @click="viewDetails(checkin)"
                  class="px-3 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-700 text-xs max-md:px-2"
                >
                  {{ $t("view_details") }}
                </button>
              </td>
            </tr>
            <tr
              v-if="paginatedCheckins.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="7"
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
        v-if="paginatedCheckins.length !== 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="showDetailsModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeDetailsModal"
      >
        <div
          class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div class="p-6 border-b max-md:p-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-900 max-md:text-lg">
                {{ $t("checkin_details") }}: {{ selectedCheckin?.username }}
              </h3>
              <button
                @click="closeDetailsModal"
                class="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="mdi:close" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="p-6 max-md:p-4" v-if="selectedCheckin">
            <div class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-gray-900">
                  {{ $t("monthly_checkins") }}
                </h4>
                <select
                  v-model="selectedMonth"
                  class="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option
                    v-for="month in monthOptions"
                    :key="month.value"
                    :value="month.value"
                  >
                    {{ $i18n.locale === "zh" ? month.labelCN : month.label }}
                  </option>
                </select>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="grid grid-cols-7 gap-2">
                  <div
                    v-for="day in currentMonthDays"
                    :key="day"
                    :class="[
                      'aspect-square flex items-center justify-center rounded text-sm',
                      isCheckedIn(day)
                        ? 'bg-green-500 text-white font-semibold'
                        : 'bg-white text-gray-400',
                    ]"
                  >
                    {{ day }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="
                selectedCheckin.pendingRewards &&
                selectedCheckin.pendingRewards.length > 0
              "
            >
              <h4 class="font-semibold text-gray-900 mb-3">
                {{ $t("pending_rewards") }}
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(reward, index) in selectedCheckin.pendingRewards"
                  :key="index"
                  class="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900 uppercase">
                      {{ reward.rewardType }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatDate(reward.scheduledDistribution) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-purple-600">
                      MYR {{ reward.amount }}
                    </p>
                    <span
                      :class="[
                        'text-xs px-2 py-0.5 rounded',
                        reward.distributed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{
                        reward.distributed ? $t("distributed") : $t("pending")
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import moment from "moment-timezone";
import { formatDate } from "~/utils/dateFormatter";
import { Icon } from "@iconify/vue";

const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const { get } = useApiEndpoint();

const tableHeaders = [
  { key: "username", label: "Username", labelCN: "用户名" },
  { key: "currentStreak", label: "Current Streak", labelCN: "连续签到" },
  { key: "totalCheckins", label: "Total Check-ins", labelCN: "总签到次数" },
  { key: "lastCheckIn", label: "Last Check-in", labelCN: "最后签到" },
  { key: "monthlyCheckIns", label: "This Month", labelCN: "本月签到" },
  { key: "pendingRewards", label: "Pending Rewards", labelCN: "待发放奖励" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const checkins = ref([]);
const filters = ref({
  username: "",
  minStreak: 0,
  sortBy: "streak",
});
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showDetailsModal = ref(false);
const selectedCheckin = ref(null);
const selectedMonth = ref(moment().tz("Asia/Kuala_Lumpur").month());

const stats = computed(() => {
  const today = moment().tz("Asia/Kuala_Lumpur").startOf("day");
  const todayCheckins = checkins.value.filter((c) =>
    moment(c.lastCheckIn).tz("Asia/Kuala_Lumpur").isSameOrAfter(today)
  );
  const activeStreaks = checkins.value.filter((c) => c.currentStreak > 0);
  const pendingRewards = checkins.value.reduce(
    (sum, c) =>
      sum + (c.pendingRewards?.filter((r) => !r.distributed).length || 0),
    0
  );

  return {
    totalUsers: checkins.value.length,
    todayCheckins: todayCheckins.length,
    activeStreaks: activeStreaks.length,
    pendingRewards,
  };
});

const filteredCheckins = computed(() => {
  let filtered = [...checkins.value];

  if (filters.value.username) {
    const searchTerm = filters.value.username.toLowerCase();
    filtered = filtered.filter((c) =>
      c.username.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.value.minStreak > 0) {
    filtered = filtered.filter(
      (c) => c.currentStreak >= filters.value.minStreak
    );
  }
  if (filters.value.sortBy === "streak") {
    filtered.sort((a, b) => b.currentStreak - a.currentStreak);
  } else if (filters.value.sortBy === "total") {
    filtered.sort((a, b) => b.totalCheckins - a.totalCheckins);
  } else if (filters.value.sortBy === "recent") {
    filtered.sort((a, b) => new Date(b.lastCheckIn) - new Date(a.lastCheckIn));
  }

  return filtered.map((c) => {
    const currentMonth = moment().tz("Asia/Kuala_Lumpur").month();
    const monthlyDays = c.monthlyCheckIns?.[currentMonth] || [];
    return {
      ...c,
      monthlyCheckInsCount: monthlyDays.length,
      pendingRewardsCount:
        c.pendingRewards?.filter((r) => !r.distributed).length || 0,
    };
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredCheckins.value.length / itemsPerPage.value)
);

const paginatedCheckins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredCheckins.value.slice(start, end);
});

const currentMonthDays = computed(() => {
  const year = moment().tz("Asia/Kuala_Lumpur").year();
  const daysInMonth = moment()
    .tz("Asia/Kuala_Lumpur")
    .year(year)
    .month(selectedMonth.value)
    .daysInMonth();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
});

const isCheckedIn = (day) => {
  if (!selectedCheckin.value) return false;
  const monthlyDays =
    selectedCheckin.value.monthlyCheckIns?.[selectedMonth.value] || [];
  return monthlyDays.includes(day);
};

const viewDetails = (checkin) => {
  selectedCheckin.value = checkin;
  selectedMonth.value = moment().tz("Asia/Kuala_Lumpur").month();
  showDetailsModal.value = true;
};

const monthOptions = computed(() => {
  const months = [];
  for (let i = 0; i <= 11; i++) {
    months.push({
      value: i,
      label: moment().month(i).format("MMMM"),
      labelCN: moment().month(i).locale("zh-cn").format("MMMM"),
    });
  }
  return months;
});

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedCheckin.value = null;
};

const handleReset = () => {
  filters.value = {
    username: "",
    minStreak: 0,
    sortBy: "streak",
  };
  currentPage.value = 1;
  fetchCheckins();
};

const fetchCheckins = async () => {
  try {
    const { data } = await get("checkins");
    if (data.success) {
      checkins.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load check-in records",
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
    if (filteredCheckins.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }

    const exportData = filteredCheckins.value.map((checkin, index) => ({
      no: index + 1,
      username: checkin.username,
      currentStreak: checkin.currentStreak,
      totalCheckins: checkin.totalCheckins,
      lastCheckIn: formatDate(checkin.lastCheckIn),
      monthlyCheckIns: checkin.monthlyCheckInsCount,
      pendingRewards: checkin.pendingRewardsCount,
    }));

    const filename = `checkin_report_${moment().format("YYYY-MM-DD")}`;

    await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("checkin_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        username: { header: $t("username"), width: 20 },
        currentStreak: { header: $t("current_streak"), width: 15 },
        totalCheckins: { header: $t("total_checkins"), width: 15 },
        lastCheckIn: { header: $t("last_checkin"), width: 20 },
        monthlyCheckIns: { header: $t("this_month"), width: 15 },
        pendingRewards: { header: $t("pending_rewards"), width: 15 },
      },
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
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

onMounted(async () => {
  await fetchCheckins();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Check-in Report",
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

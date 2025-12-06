<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("mission_management") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_mission')"
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
              v-for="mission in paginatedMissions"
              :key="mission._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ $i18n.locale === "zh" ? mission.titleCN : mission.title }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    mission.missionType === 'totalTurnover'
                      ? 'bg-blue-100 text-blue-800'
                      : mission.missionType === 'withdrawCount'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800',
                  ]"
                >
                  {{ getMissionTypeLabel(mission.missionType) }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ mission.targetValue }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ mission.rewardPoints }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ mission.sortOrder }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="mission.isActive"
                    @update:modelValue="() => handleStatusChange(mission)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ mission.isActive ? $t("active") : $t("inactive") }}
                  </span>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(mission.createdAt) }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:flex-col"
                >
                  <button
                    @click="handleEdit(mission)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <button
                    @click="handleDelete(mission)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </button>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedMissions.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="8"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_missions_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        v-if="paginatedMissions.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <BM8-MissionModal
      v-model:show="showMissionModal"
      :initial-data="editingMission"
      @success="fetchMissions"
    />
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";

const isPageLoading = ref(true);
const { get, patch, del } = useApiEndpoint();

const tableHeaders = [
  { key: "title", label: "Title", labelCN: "标题" },
  { key: "missionType", label: "Type", labelCN: "类型" },
  { key: "targetValue", label: "Target", labelCN: "目标值" },
  { key: "rewardPoints", label: "Reward Points", labelCN: "奖励积分" },
  { key: "sortOrder", label: "Order", labelCN: "排序" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "createdAt", label: "Created At", labelCN: "创建时间" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const editingMission = ref(null);
const missions = ref([]);
const showMissionModal = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filteredMissions = computed(() => {
  let filtered = [...missions.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (mission) =>
        mission.title.toLowerCase().includes(searchTerm) ||
        mission.titleCN.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredMissions.value.length / itemsPerPage.value)
);

const paginatedMissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredMissions.value.slice(start, end);
});

const handleTypeChange = () => {
  currentPage.value = 1;
};

const getMissionTypeLabel = (type) => {
  const types = {
    totalTurnover: $locale.value === "zh" ? "总流水" : "Total Turnover",
    withdrawCount: $locale.value === "zh" ? "提款次数" : "Withdraw Count",
    depositCount: $locale.value === "zh" ? "存款次数" : "Deposit Count",
  };
  return types[type] || type;
};

const fetchMissions = async () => {
  try {
    const { data } = await get("missions");
    if (data.success) {
      missions.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching missions:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load missions",
    });
  }
};

const handleCreate = () => {
  editingMission.value = null;
  showMissionModal.value = true;
};

const handleEdit = (mission) => {
  editingMission.value = mission;
  showMissionModal.value = true;
};

const handleStatusChange = async (mission) => {
  try {
    const { data } = await patch(`missions/${mission._id}/toggle`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchMissions();
    } else {
      mission.isActive = !mission.isActive;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    mission.isActive = !mission.isActive;
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

const handleDelete = async (mission) => {
  const result = await Swal.fire({
    title: $t("confirm_delete"),
    text: $t("delete_mission_confirm"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: $t("yes_delete"),
    cancelButtonText: $t("cancel"),
  });

  if (result.isConfirmed) {
    try {
      const { data } = await del(`missions/${mission._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchMissions();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Error deleting mission:", error);
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          error.response?.data?.message?.[$locale.value] ||
          error.response?.data?.message?.en ||
          $t("network_error"),
      });
    }
  }
};

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchMissions();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Mission ",
});
</script>

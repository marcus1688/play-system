<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("game_list") }}
        </h1>
      </div>
      <div class="flex items-center gap-2 max-md:w-full max-md:flex-wrap">
        <button
          v-if="selectedGames.length > 0"
          @click="handleBatchAction"
          class="px-4 py-2 bg-orange-600 text-white rounded lg:hover:bg-orange-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          {{ $t("batch_action") }} ({{ selectedGames.length }})
        </button>
        <BaseCreateButton @click="handleCreate" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <div
          class="flex items-center gap-4 w-[25rem] max-md:w-full max-md:gap-2 max-md:flex-col"
        >
          <CustomSelect
            v-model="selectedProvider"
            @change="handleTypeChange"
            class="w-full"
          >
            <option value="">{{ $t("all_providers") }}</option>
            <option
              v-for="provider in providers"
              :key="provider"
              :value="provider"
            >
              {{ provider }}
            </option>
          </CustomSelect>

          <CustomSelect
            v-model="filterStatus"
            @change="handleTypeChange"
            class="w-full"
          >
            <option value="">{{ $t("all_status") }}</option>
            <option value="hot">{{ $t("hot_games") }}</option>
            <option value="maintenance">{{ $t("maintenance") }}</option>
            <option value="active">{{ $t("active") }}</option>
            <option value="slotgame">{{ $t("slot_games") }}</option>
          </CustomSelect>
        </div>

        <!-- Search -->
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_game')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                <input
                  type="checkbox"
                  @change="toggleSelectAll"
                  :checked="isAllSelected"
                  class="rounded"
                />
              </th>
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
              v-for="game in paginatedGames"
              :key="game._id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <input
                  type="checkbox"
                  v-model="selectedGames"
                  :value="game._id"
                  class="rounded"
                />
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ game.gameID }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div>{{ game.gameNameEN }}</div>
                <div class="text-xs text-gray-500">{{ game.gameNameCN }}</div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex justify-center gap-2">
                  <img
                    v-if="game.imageUrlEN"
                    :src="game.imageUrlEN"
                    :alt="game.gameNameEN"
                    class="w-28 h-auto object-cover rounded max-md:w-20"
                  />
                  <!-- <img
                    v-if="game.imageUrlCN"
                    :src="game.imageUrlCN"
                    :alt="game.gameNameCN"
                    class="w-16 h-16 object-cover rounded"
                  /> -->
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ game.provider || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ game.rtpRate || "-" }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="game.hot"
                    @update:modelValue="() => handleHotStatusChange(game)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ game.hot ? $t("hot") : $t("normal") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="game.maintenance"
                    @update:modelValue="
                      () => handleMaintenanceStatusChange(game)
                    "
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ game.maintenance ? $t("maintenance") : $t("active") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="game.isslotgame"
                    @update:modelValue="() => handleSlotGameStatusChange(game)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ game.isslotgame ? $t("slot_game") : $t("regular_game") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 text-nowrap max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="handleEdit(game)"
                    class="px-3 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <button
                    v-if="adminUserData.role === 'superadmin'"
                    @click="handleDelete(game)"
                    class="px-3 py-2 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </button>
                </div>
              </td>
            </tr>

            <tr
              v-if="paginatedGames.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                :colspan="tableHeaders.length + 1"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_games_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedGames.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <GamelistModal
      v-model:show="showGameModal"
      :initial-data="editingGame"
      @success="fetchGames"
    />
  </div>
</template>

<script setup>
const adminUserData = useState("adminUserData");
const isPageLoading = ref(true);
const tableHeaders = [
  { key: "gameID", label: "Game ID", labelCN: "游戏ID" },
  { key: "name", label: "Game Name", labelCN: "游戏名称" },
  { key: "images", label: "Images", labelCN: "图片" },
  { key: "provider", label: "Provider", labelCN: "提供商" },
  { key: "rtp", label: "RTP Rate", labelCN: "RTP率" },
  { key: "hot", label: "Hot Status", labelCN: "热门状态" },
  { key: "maintenance", label: "Maintenance", labelCN: "维护状态" },
  { key: "isslotgame", label: "Slot Game", labelCN: "老虎机游戏" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const { publicGet, publicDelete: destroy, publicPatch } = useApiEndpoint();
const games = ref([]);
const showGameModal = ref(false);
const editingGame = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const providers = ref([]);
const selectedProvider = ref("");
const filterStatus = ref("");
const selectedGames = ref([]);

const filteredGames = computed(() => {
  let filtered = [...games.value];
  if (selectedProvider.value) {
    filtered = filtered.filter(
      (game) => game.provider === selectedProvider.value
    );
  }
  if (filterStatus.value) {
    switch (filterStatus.value) {
      case "hot":
        filtered = filtered.filter((game) => game.hot);
        break;
      case "maintenance":
        filtered = filtered.filter((game) => game.maintenance);
        break;
      case "active":
        filtered = filtered.filter((game) => !game.maintenance);
        break;
      case "slotgame":
        filtered = filtered.filter((game) => game.isslotgame);
        break;
    }
  }
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (game) =>
        game.gameNameEN?.toLowerCase().includes(searchTerm) ||
        game.gameNameCN?.toLowerCase().includes(searchTerm) ||
        game.gameID?.toLowerCase().includes(searchTerm) ||
        game.provider?.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredGames.value.length / itemsPerPage.value)
);

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredGames.value.slice(start, end);
});

const isAllSelected = computed(() => {
  return (
    paginatedGames.value.length > 0 &&
    paginatedGames.value.every((game) => selectedGames.value.includes(game._id))
  );
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedGames.value = selectedGames.value.filter(
      (id) => !paginatedGames.value.find((game) => game._id === id)
    );
  } else {
    const pageIds = paginatedGames.value.map((game) => game._id);
    selectedGames.value = [...new Set([...selectedGames.value, ...pageIds])];
  }
};

const handleBatchAction = async () => {
  const { value: action } = await Swal.fire({
    title: $t("batch_action"),
    input: "select",
    inputOptions: {
      hot_on: $t("set_hot"),
      hot_off: $t("unset_hot"),
      maintenance_on: $t("set_maintenance"),
      maintenance_off: $t("unset_maintenance"),
      isslotgame_on: $t("set_slot_game"),
      isslotgame_off: $t("unset_slot_game"),
    },
    inputPlaceholder: $t("select_action"),
    showCancelButton: true,
    confirmButtonText: $t("confirm"),
    cancelButtonText: $t("cancel"),
  });
  if (action) {
    try {
      const [field, value] = action.split("_");
      const { data } = await publicPatch("gamelist/batch", {
        gameIds: selectedGames.value,
        action:
          field === "hot"
            ? "hot"
            : field === "maintenance"
            ? "maintenance"
            : "isslotgame",
        value: value === "on",
      });
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        selectedGames.value = [];
        await fetchGames();
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
    }
  }
};

const handleCreate = () => {
  editingGame.value = null;
  showGameModal.value = true;
};

const handleEdit = (game) => {
  editingGame.value = game;
  showGameModal.value = true;
};

const handleHotStatusChange = async (game) => {
  try {
    const { data } = await publicPatch(`gamelist/${game._id}/toggle-hot`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchGames();
    } else {
      game.hot = !game.hot;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    game.hot = !game.hot;
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

const handleMaintenanceStatusChange = async (game) => {
  try {
    const { data } = await publicPatch(
      `gamelist/${game._id}/toggle-maintenance`
    );
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchGames();
    } else {
      game.maintenance = !game.maintenance;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    game.maintenance = !game.maintenance;
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

const handleSlotGameStatusChange = async (game) => {
  try {
    const { data } = await publicPatch(`gamelist/${game._id}/toggle-slotgame`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchGames();
    } else {
      game.isslotgame = !game.isslotgame;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    game.isslotgame = !game.isslotgame;
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

const handleDelete = async (game) => {
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
      const { data } = await destroy(`gamelist/${game._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchGames();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
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
  }
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

const fetchGames = async () => {
  try {
    const { data } = await publicGet("gamelist");
    if (data.success) {
      games.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching games:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch games",
    });
  }
};

const fetchProviders = async () => {
  try {
    const { data } = await publicGet("gamelist/providers");
    if (data.success) {
      providers.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching providers:", error);
  }
};

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchGames();
  await fetchProviders();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Game List",
});
</script>

<style scoped></style>

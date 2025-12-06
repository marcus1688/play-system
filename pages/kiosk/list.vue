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
          {{ $t("kiosk_list") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <div
          class="flex items-center gap-4 w-[25rem] max-md:w-full max-md:gap-2"
        >
          <CustomSelect
            v-model="selectedCategory"
            @change="handleTypeChange"
            class="w-full"
          >
            <option value="">{{ $t("all_categories") }}</option>
            <option
              v-for="category in categories"
              :key="category._id"
              :value="category._id"
            >
              {{ category.name }}
            </option>
          </CustomSelect>
        </div>
        <!-- 原有的搜索框 -->
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_kiosk')"
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
              v-for="kiosk in paginatedKiosks"
              :key="kiosk._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ kiosk.categoryId?.name }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ kiosk.name }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <img
                    v-if="kiosk.logo"
                    :src="kiosk.logo"
                    alt="Game Logo"
                    class="w-32 h-auto max-md:w-24"
                  />
                  <span v-else class="text-sm text-gray-600 max-md:text-xs"
                    >N/A</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 hidden">
                <div class="justify-center flex">
                  <img
                    v-if="kiosk.icon"
                    :src="kiosk.icon"
                    alt="Game Icon"
                    class="w-32 h-auto max-md:w-24"
                  />
                  <span v-else class="text-sm text-gray-600 max-md:text-xs"
                    >N/A</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 hidden">
                <div class="justify-center flex">
                  <img
                    v-if="kiosk.banner"
                    :src="kiosk.banner"
                    alt="Game Banner"
                    class="w-64 h-auto max-md:w-40"
                  />
                  <span v-else class="text-sm text-gray-600 max-md:text-xs"
                    >N/A</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="kiosk.isActive"
                    @update:modelValue="() => handleStatusChange(kiosk)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ kiosk.isActive ? $t("active") : $t("inactive") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="kiosk.isHotGame"
                    @update:modelValue="() => handleHotGameStatusChange(kiosk)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ kiosk.isHotGame ? $t("hot") : $t("normal") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 text-nowrap max-md:gap-1 max-md:flex-col"
                >
                  <button
                    v-if="adminUserData.role === 'superadmin'"
                    @click="handleEdit(kiosk)"
                    class="px-3 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <button
                    @click="handleMaintenanceSchedule(kiosk)"
                    class="px-3 py-2 bg-orange-600 text-white rounded lg:hover:bg-orange-500 text-sm max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("maintenance") }}
                  </button>
                  <button
                    v-if="adminUserData.role === 'superadmin'"
                    @click="handleDelete(kiosk)"
                    class="px-3 py-2 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </button>
                </div>
              </td>

              <td class="max-md:px-3 max-md:py-3">
                <div
                  v-if="
                    kiosk.maintenance?.deactivateAt &&
                    kiosk.maintenance?.activateAt
                  "
                  class="text-xs bg-yellow-100 border border-yellow-200 rounded-md p-2"
                >
                  <div class="text-yellow-600 mt-1">
                    <div>
                      <div
                        class="flex items-center justify-center gap-1 text-yellow-700"
                      >
                        <Icon
                          icon="mdi:wrench"
                          class="w-4 h-4 max-md:w-3 max-md:h-3"
                        />
                        <span class="font-medium max-md:text-[10px]"
                          >{{ $t("maintenance_period") }}:</span
                        >
                      </div>
                      <span class="max-md:text-[10px]">
                        {{ formatDate(kiosk.maintenance.deactivateAt) }} -
                        {{ formatDate(kiosk.maintenance.activateAt) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  class="flex justify-center text-xs max-md:text-[10px]"
                  v-else
                >
                  -
                </div>
              </td>
            </tr>

            <tr
              v-if="paginatedKiosks.length === 0"
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
                  {{ $t("no_kiosks_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedKiosks.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- Kiosk Modals -->
    <KioskModal
      v-model:show="showKioskModal"
      :initial-data="editingKiosk"
      @success="fetchKiosks"
    />

    <!-- Kiosk Maintenance Schedule Modal -->
    <KioskMaintenanceScheduleModal
      v-model:show="showMaintenanceModal"
      :kiosk="selectedKiosk"
      @success="fetchKiosks"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const adminUserData = useState("adminUserData");
const isPageLoading = ref(true);
const tableHeaders = [
  { key: "category", label: "Category", labelCN: "分类" },
  { key: "name", label: "Name", labelCN: "名称" },
  { key: "logo", label: "Logo", labelCN: "标志" },
  // { key: "icon", label: "Icon", labelCN: "图标" },
  // { key: "banner", label: "Banner", labelCN: "横幅" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "hotgames", label: "Hot Games", labelCN: "热门游戏" },
  { key: "actions", label: "Actions", labelCN: "操作" },
  { key: "remark", label: "Remark", labelCN: "备注" },
];

const { publicGet, publicDelete: destroy, publicPatch } = useApiEndpoint();
const kiosks = ref([]);
const showKioskModal = ref(false);
const editingKiosk = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showMaintenanceModal = ref(false);
const selectedKiosk = ref(null);
const categories = ref([]);
const selectedCategory = ref("");

const handleMaintenanceSchedule = (kiosk) => {
  selectedKiosk.value = kiosk;
  showMaintenanceModal.value = true;
};

const filteredKiosks = computed(() => {
  let filtered = [...kiosks.value];

  if (selectedCategory.value) {
    filtered = filtered.filter(
      (kiosk) => kiosk.categoryId?._id === selectedCategory.value
    );
  }

  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (kiosk) =>
        kiosk.name.toLowerCase().includes(searchTerm) ||
        kiosk.categoryId?.name.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredKiosks.value.length / itemsPerPage.value)
);

const paginatedKiosks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredKiosks.value.slice(start, end).map((kiosks, index) => ({
    ...kiosks,
  }));
});

const handleCreate = () => {
  editingKiosk.value = null;
  showKioskModal.value = true;
};

const handleEdit = (kiosk) => {
  editingKiosk.value = kiosk;
  showKioskModal.value = true;
};

const handleStatusChange = async (kiosk) => {
  try {
    const { data } = await publicPatch(`kiosks/${kiosk._id}/toggle`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchKiosks();
    } else {
      kiosk.isActive = !kiosk.isActive;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    kiosk.isActive = !kiosk.isActive;
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

const handleHotGameStatusChange = async (kiosk) => {
  try {
    const { data } = await publicPatch(`kiosks/${kiosk._id}/toggle-hot-game`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchKiosks();
    } else {
      kiosk.isHotGame = !kiosk.isHotGame;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    kiosk.isHotGame = !kiosk.isHotGame;
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

const handleDelete = async (kiosk) => {
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
      const { data } = await destroy(`kiosks/${kiosk._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchKiosks();
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

const handleKickSingle = async (kiosk) => {
  try {
    const { data } = await post(`kiosks/${kiosk._id}/kick-single`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: "User Kicked Successfully",
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to kick user",
    });
  }
};

const handleKickAll = async (kiosk) => {
  try {
    const { data } = await post(`kiosks/${kiosk._id}/kick-all`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: "All Users Kicked Successfully",
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to kick users",
    });
  }
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

const fetchKiosks = async () => {
  try {
    const { data } = await publicGet("kiosks");
    if (data.success) {
      kiosks.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching kiosks:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch kiosks",
    });
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await publicGet("kioskcategories");
    if (data.success) {
      categories.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch categories",
    });
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchKiosks();
  await fetchCategories();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Kiosk",
});
</script>

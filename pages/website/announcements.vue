<template>
  <div>
    <PageLoading v-if="isPageLoading" />

    <!-- Announcement Categories Section -->
    <div class="mb-8 max-md:mb-6">
      <!-- Header Section -->
      <div
        class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
      >
        <div class="flex items-center gap-4 max-md:gap-3">
          <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("announcement_categories") }}
          </h1>
        </div>
        <BaseCreateButton @click="handleCreateCategory" />
      </div>

      <!-- Categories Table -->
      <div class="bg-white rounded-lg shadow">
        <div class="overflow-x-auto">
          <table class="w-full text-center text-nowrap">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("name") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("actions") }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="category in categories"
                :key="category._id"
                class="lg:hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ category.name }}
                </td>
                <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                  <div class="flex items-center justify-center gap-2">
                    <LoadingButton
                      :loading="isCategoryButtonLoading[category._id]"
                      @click="handleDeleteCategory(category)"
                      class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs"
                    >
                      {{ $t("delete") }}
                    </LoadingButton>
                  </div>
                </td>
              </tr>
              <tr
                v-if="categories.length === 0"
                class="h-[200px] max-md:h-[150px]"
              >
                <td
                  colspan="2"
                  class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
                >
                  <div class="flex flex-col gap-8 items-center max-md:gap-4">
                    <img
                      src="/images/empty2.png"
                      alt="Empty State"
                      class="w-32 h-auto opacity-80 max-md:w-24"
                    />
                    {{ $t("no_categories_found") }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Announcements Section -->
    <div>
      <!-- Header Section -->
      <div
        class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
      >
        <div class="flex items-center gap-4 max-md:gap-3">
          <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("announcements") }}
          </h1>
        </div>
        <BaseCreateButton @click="handleCreateAnnouncement" />
      </div>

      <!-- Table Section -->
      <div class="bg-white rounded-lg shadow">
        <div
          class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-stretch"
        >
          <div class="flex items-center gap-4 w-[25rem] max-md:w-full">
            <CustomSelect
              v-model="selectedCategory"
              @change="handleTypeChange"
              class="w-full"
            >
              <option value="">{{ $t("all") }}</option>
              <option
                v-for="category in categories"
                :key="category._id"
                :value="category.name"
              >
                {{ category.name }}
              </option>
            </CustomSelect>
          </div>
          <div class="flex items-center gap-4 max-md:w-full">
            <BaseSearch
              v-model="searchQuery"
              :placeholder="$t('search_announcement')"
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
                v-for="announcement in paginatedAnnouncements"
                :key="announcement._id"
                class="lg:hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ announcement.titleEN }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ announcement.titleCN }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ announcement.category }}
                </td>
                <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                  <div
                    class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                  >
                    <BaseToggleSwitch
                      v-model="announcement.isVisible"
                      @update:modelValue="
                        () => handleVisibilityChange(announcement)
                      "
                    />
                    <span class="text-sm text-gray-600 max-md:text-xs">
                      {{
                        announcement.isVisible ? $t("visible") : $t("hidden")
                      }}
                    </span>
                  </div>
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ formatDate(announcement.createdAt) }}
                </td>
                <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                  <div
                    class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                  >
                    <button
                      @click="handleEditAnnouncement(announcement)"
                      class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("edit") }}
                    </button>
                    <LoadingButton
                      :loading="isButtonLoading[announcement._id]"
                      @click="handleDeleteAnnouncement(announcement)"
                      class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("delete") }}
                    </LoadingButton>
                  </div>
                </td>
              </tr>
              <tr
                v-if="paginatedAnnouncements.length === 0"
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
                    {{ $t("no_announcements_found") }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <BasePagination
          v-if="paginatedAnnouncements.length > 0"
          v-model="currentPage"
          :total-pages="totalPages"
        />
      </div>

      <!-- Category Modal -->
      <AnnouncementCategoryModal
        v-model:show="showCategoryModal"
        :initial-data="editingCategory"
        @success="fetchCategories"
      />

      <!-- Announcement Modal -->
      <AnnouncementModal
        v-model:show="showAnnouncementModal"
        :initial-data="editingAnnouncement"
        :categories="categories"
        @success="fetchAnnouncements"
      />
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";
import AnnouncementModal from "~/components/AnnouncementModal.vue";
import AnnouncementCategoryModal from "~/components/AnnouncementCategoryModal.vue";

const isCategoryButtonLoading = ref({});
const isButtonLoading = ref({});
const isPageLoading = ref(true);
const { get, delete: destroy, patch } = useApiEndpoint();

const tableHeaders = [
  { key: "titleEN", label: "Title (EN)", labelCN: "标题 (英文)" },
  { key: "titleCN", label: "Title (CN)", labelCN: "标题 (中文)" },
  { key: "category", label: "Category", labelCN: "类别" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "createdAt", label: "Created At", labelCN: "创建时间" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

// Shared state
const categories = ref([]);

// Category state
const showCategoryModal = ref(false);
const editingCategory = ref(null);

// Announcement state
const announcements = ref([]);
const showAnnouncementModal = ref(false);
const editingAnnouncement = ref(null);
const searchQuery = ref("");
const selectedCategory = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Computed properties
const filteredAnnouncements = computed(() => {
  let filtered = [...announcements.value];

  if (selectedCategory.value) {
    filtered = filtered.filter(
      (announcement) => announcement.category === selectedCategory.value
    );
  }

  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (announcement) =>
        announcement.titleEN.toLowerCase().includes(searchTerm) ||
        announcement.titleCN.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredAnnouncements.value.length / itemsPerPage.value)
);

const paginatedAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAnnouncements.value.slice(start, end);
});

// Category handlers
const handleCreateCategory = () => {
  editingCategory.value = null;
  showCategoryModal.value = true;
};

const handleDeleteCategory = async (category) => {
  isCategoryButtonLoading.value[category._id] = true;
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
      const { data } = await destroy(`categories/${category._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await Promise.all([fetchCategories(), fetchAnnouncements()]);
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
  } finally {
    isCategoryButtonLoading.value[category._id] = false;
  }
};

// Announcement handlers
const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleCreateAnnouncement = () => {
  editingAnnouncement.value = null;
  showAnnouncementModal.value = true;
};

const handleEditAnnouncement = (announcement) => {
  editingAnnouncement.value = announcement;
  showAnnouncementModal.value = true;
};

const handleDeleteAnnouncement = async (announcement) => {
  isButtonLoading.value[announcement._id] = true;
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
      const { data } = await destroy(`announcements/${announcement._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchAnnouncements();
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
  } finally {
    isButtonLoading.value[announcement._id] = false;
  }
};

const handleVisibilityChange = async (announcement) => {
  try {
    const { data } = await patch(
      `announcements/${announcement._id}/visibility`
    );
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchAnnouncements();
    } else {
      announcement.isVisible = !announcement.isVisible;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    announcement.isVisible = !announcement.isVisible;
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

// Data fetching
const fetchCategories = async () => {
  try {
    const { data } = await get("categories");
    if (data.success) {
      categories.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch categories",
    });
  }
};

const fetchAnnouncements = async () => {
  try {
    const { data } = await get("announcements");
    if (data.success) {
      announcements.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching announcements:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch announcements",
    });
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchAnnouncements()]);
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Announcements",
});
</script>

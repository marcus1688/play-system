<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("carousel_list") }}
          </h1>
        </div>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search')"
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
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
              >
                <div class="flex items-center justify-center gap-1">
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                  <div v-if="header.sortable">
                    <Icon
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
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="carousel in paginatedCarousels"
              :key="carousel._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ carousel.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ carousel.name }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <img
                    v-if="carousel.link"
                    :src="carousel.link"
                    alt="Carousel"
                    class="h-auto w-64 object-cover rounded max-md:w-40"
                    @click="viewImage(carousel)"
                    style="cursor: pointer"
                  />
                  <span v-else class="text-sm text-gray-500 max-md:text-xs">{{
                    $t("no_image")
                  }}</span>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ carousel.order }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <BaseToggleSwitch
                    v-model="carousel.status"
                    @update:modelValue="toggleActive(carousel)"
                  />
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="editCarousel(carousel)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[carousel._id]"
                    @click="deleteCarousel(carousel)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedCarousels.length === 0"
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
                  {{ $t("no_carousels_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedCarousels.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- Carousel Modal -->
    <CarouselModal
      v-model:show="showCarouselModal"
      :initial-data="editingCarousel"
      @success="fetchCarousels"
    />

    <!-- Image Preview Modal -->
    <ImagePreviewModal
      v-model:show="showImageModal"
      :image-url="selectedImageUrl"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const isButtonLoading = ref({});
const isPageLoading = ref(true);
const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号" },
  { key: "name", label: "Name", labelCN: "名称", sortable: true },
  { key: "link", label: "Image", labelCN: "图片" },
  { key: "order", label: "Order", labelCN: "顺序", sortable: true },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const carousels = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showCarouselModal = ref(false);
const showImageModal = ref(false);
const editingCarousel = ref(null);
const selectedImageUrl = ref("");
const { get, patch, publicDelete: del } = useApiEndpoint();

const sortConfig = ref({
  key: "order",
  direction: "asc",
});

const filteredCarousels = computed(() => {
  let filtered = [...carousels.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((carousel) =>
      carousel.name.toLowerCase().includes(query)
    );
  }
  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (typeof aVal === "string" && !isNaN(aVal)) aVal = parseFloat(aVal);
      if (typeof bVal === "string" && !isNaN(bVal)) bVal = parseFloat(bVal);
      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal === bVal) return 0;
      if (aVal == null && bVal != null) return direction;
      if (aVal != null && bVal == null) return -direction;
      return aVal > bVal ? direction : -direction;
    });
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredCarousels.value.length / itemsPerPage.value)
);

const paginatedCarousels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredCarousels.value.slice(start, end).map((carousel, index) => ({
    ...carousel,
    no: start + index + 1,
  }));
});

const handleSort = (key) => {
  if (!tableHeaders.find((h) => h.key === key).sortable) return;
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

const fetchCarousels = async () => {
  try {
    const { data } = await get("carousel");
    if (data.success) {
      carousels.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching carousels:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load carousels",
    });
  }
};

const handleCreate = () => {
  editingCarousel.value = null;
  showCarouselModal.value = true;
};

const editCarousel = (carousel) => {
  editingCarousel.value = carousel;
  showCarouselModal.value = true;
};

const toggleActive = async (carousel) => {
  try {
    const { data } = await patch("updatecarouselstatus", {
      id: carousel._id,
      status: carousel.status,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchCarousels();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    carousel.status = !carousel.status;
    console.error("Error toggling status:", error);
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

const viewImage = (carousel) => {
  if (carousel.link) {
    selectedImageUrl.value = carousel.link;
    showImageModal.value = true;
  }
};

const deleteCarousel = async (carousel) => {
  isButtonLoading.value[carousel._id] = true;
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
    try {
      const { data } = await del(`deletecarousel/${carousel._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchCarousels();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Error deleting carousel:", error);
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
  isButtonLoading.value[carousel._id] = false;
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchCarousels();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Carousel",
});
</script>

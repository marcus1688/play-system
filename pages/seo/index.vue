<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("seo_pages") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch v-model="searchQuery" :placeholder="$t('search_pages')" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("page_type") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("content_blocks") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("status") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("last_updated") }}
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
              v-for="page in paginatedPages"
              :key="page._id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  class="text-sm font-medium text-gray-900 uppercase max-md:text-xs"
                  >{{ page.pageType }}</span
                >
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex justify-center items-center">
                  <span class="text-sm text-gray-500 max-md:text-xs"
                    >{{ page.contentBlocks?.length || 0 }}
                    {{ $t("blocks") }}</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex justify-center items-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="page.isVisible"
                    @update:modelValue="() => handleVisibilityChange(page)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ page.isVisible ? $t("visible") : $t("hidden") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span class="text-sm text-gray-500 max-md:text-xs">
                  {{ formatDate(page.updatedAt) }}
                </span>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex justify-center items-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <NuxtLinkLocale
                    :to="`/seo/${page._id}`"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full max-md:text-center"
                  >
                    {{ $t("edit_content") }}
                  </NuxtLinkLocale>
                  <LoadingButton
                    :loading="isButtonLoading[page._id]"
                    @click="handleDelete(page)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedPages.length === 0"
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
                  {{ $t("no_seo_pages_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedPages.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <SeoPageModal
      v-model:show="showModal"
      :initial-data="editingPage"
      @success="fetchPages"
    />
  </div>
</template>

<script setup>
const router = useRouter();
const { get, post, put, delete: del, patch } = useApiEndpoint();
const isButtonLoading = ref({});
const isPageLoading = ref(true);
const pages = ref([]);
const showModal = ref(false);
const editingPage = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filteredPages = computed(() => {
  let filtered = pages.value;
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase();
    filtered = filtered.filter((page) =>
      page.pageType.toLowerCase().includes(term)
    );
  }
  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredPages.value.length / itemsPerPage.value) || 1;
});

const paginatedPages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPages.value.slice(start, end);
});

const fetchPages = async () => {
  try {
    isPageLoading.value = true;
    const { data } = await get("seo-pages");
    if (data.success) {
      pages.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching SEO pages:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load SEO pages",
    });
  } finally {
    isPageLoading.value = false;
  }
};

const handleCreate = () => {
  editingPage.value = null;
  showModal.value = true;
};

const navigateToEdit = (pageId) => {
  router.push(`/seo/${pageId}`);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleVisibilityChange = async (page) => {
  try {
    const { data } = await patch(`seo-pages/${page._id}/visibility`, {
      isVisible: page.isVisible,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchPages();
    } else {
      page.isVisible = !page.isVisible;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    page.isVisible = !page.isVisible;
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

const handleDelete = async (page) => {
  isButtonLoading.value[page._id] = true;
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
      const { data } = await del(`seo-pages/${page._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        const prevPage = currentPage.value;
        await fetchPages();
        const newTotalPages =
          Math.ceil(filteredPages.value.length / itemsPerPage.value) || 1;
        if (prevPage > newTotalPages) {
          currentPage.value = Math.max(1, newTotalPages);
        }
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
    isButtonLoading.value[page._id] = false;
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchPages();
});

useHead({
  title: "Play System | SEO",
});
</script>

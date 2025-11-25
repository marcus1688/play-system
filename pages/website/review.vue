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
          {{ $t("website_review") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="overflow-x-auto rounded-lg">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
              >
                {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="review in paginatedReviews"
              :key="review.id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="space-y-1">
                  <div class="text-sm max-md:text-xs">
                    <span class="font-medium">{{ $t("english") }}:</span>
                    <div>{{ review.titleEN }}</div>
                  </div>
                  <div class="text-sm max-md:text-xs">
                    <span class="font-medium">{{ $t("chinese") }}:</span>
                    <div>{{ review.titleCN }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="space-y-1">
                  <div class="text-sm max-md:text-xs">
                    <span class="font-medium">{{ $t("english") }}:</span>
                    <div>{{ review.descriptionEN }}</div>
                  </div>
                  <div class="text-sm max-md:text-xs">
                    <span class="font-medium">{{ $t("chinese") }}:</span>
                    <div>{{ review.descriptionCN }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex items-center">
                  <span class="text-yellow-400 mr-1 max-md:text-sm">★</span>
                  <span class="max-md:text-xs">{{ review.rating }}/5</span>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ review.author }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ review.createdAt ? formatDate(review.createdAt) : "-" }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center gap-2 max-md:gap-1.5 max-md:flex-col max-md:items-start"
                >
                  <BaseToggleSwitch
                    v-model="review.isVisible"
                    @update:modelValue="handleVisibilityChange(review)"
                  />
                  <span
                    class="text-sm text-gray-600 text-nowrap max-md:text-xs"
                  >
                    {{ review.isVisible ? $t("visible") : $t("hidden") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center gap-2 text-nowrap max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="handleEdit(review)"
                    class="px-3 py-1 bg-blue-600 text-white rounded lg:hover:bg-blue-500 max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>

                  <LoadingButton
                    :loading="isButtonLoading[review._id]"
                    @click="handleDelete(review)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination v-model="currentPage" :total-pages="totalPages" />

      <!-- Review Modal -->
      <ReviewModal
        v-model:show="showModal"
        :initial-data="selectedReview"
        @success="fetchReviews"
      />
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";

const isButtonLoading = ref({});
const isPageLoading = ref(true);
const tableHeaders = [
  { key: "title", label: "Title (EN/CN)", labelCN: "标题 (英文/中文)" },
  {
    key: "description",
    label: "Description (EN/CN)",
    labelCN: "描述 (英文/中文)",
  },
  { key: "rating", label: "Rating", labelCN: "评分" },
  { key: "author", label: "Author", labelCN: "作者" },
  { key: "date", label: "Date", labelCN: "日期" },
  { key: "visibility", label: "Visibility", labelCN: "可见性" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const reviews = ref([]);
const showModal = ref(false);
const selectedReview = ref(null);
const { get, post, put, delete: destroy } = useApiEndpoint();
const currentPage = ref(1);
const itemsPerPage = ref(10);

const fetchReviews = async () => {
  try {
    const { data } = await get("allreviews");
    if (data.success) {
      reviews.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch reviews",
    });
  }
};

const handleVisibilityChange = async (review) => {
  try {
    const { data } = await put(`reviews/${review._id}`, {
      isVisible: review.isVisible,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchReviews();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating visibility:", error);
    review.isVisible = !review.isVisible;
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

const handleDelete = async (review) => {
  isButtonLoading.value[review._id] = true;
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
      const { data } = await destroy(`reviews/${review._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchReviews();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value[review._id] = false;
  }
};

const handleEdit = (review) => {
  selectedReview.value = { ...review };
  showModal.value = true;
};

const handleCreate = () => {
  selectedReview.value = null;
  showModal.value = true;
};

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return reviews.value.slice(start, end).map((reviews, index) => ({
    ...reviews,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(reviews.value.length / itemsPerPage.value)
);

onMounted(async () => {
  await fetchReviews();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Review",
});
</script>

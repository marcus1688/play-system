<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Kiosk Category Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("kiosk_category") }}
          </h1>
        </div>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Categories Table -->
    <div class="bg-white shadow rounded-lg mb-6 max-md:mb-4">
      <div class="overflow-x-auto rounded-t-lg">
        <table class="w-full text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("name") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("actions") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-if="categories.length > 0">
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
                  <div
                    class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                  >
                    <button
                      @click="handleEdit(category)"
                      class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("edit") }}
                    </button>
                    <LoadingButton
                      :loading="isButtonLoading[category._id]"
                      @click="handleDelete(category)"
                      class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("delete") }}
                    </LoadingButton>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else class="h-[200px] max-md:h-[150px]">
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

    <!-- Category Modal -->
    <KioskCategoryModal
      v-model:show="showCategoryModal"
      :initial-data="editingCategory"
      @success="fetchCategories"
    />
  </div>
</template>

<script setup>
const isButtonLoading = ref({});
const isPageLoading = ref(true);
const categories = ref([]);
const showCategoryModal = ref(false);
const editingCategory = ref(null);
const { publicGet, publicDelete: del } = useApiEndpoint();

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

const handleCreate = () => {
  editingCategory.value = null;
  showCategoryModal.value = true;
};

const handleEdit = (category) => {
  editingCategory.value = category;
  showCategoryModal.value = true;
};

const handleDelete = async (category) => {
  isButtonLoading.value[category._id] = true;
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
      const { data } = await del(`kioskcategories/${category._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchCategories();
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
    isButtonLoading.value[category._id] = false;
  }
};

onMounted(async () => {
  await fetchCategories();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Kiosk Category",
});
</script>

<style></style>

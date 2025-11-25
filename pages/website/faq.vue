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
          {{ $t("website_faq") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="overflow-x-auto rounded-lg">
        <table class="w-full whitespace-nowrap text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("question_en") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("question_cn") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("status") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("actions") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="help in helps"
              :key="help._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ truncateText(help.questionEN, 50) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ truncateText(help.questionCN, 50) }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="help.isVisible"
                    @update:modelValue="() => toggleVisibility(help._id)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ help.isVisible ? $t("visible") : $t("hidden") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="editHelp(help)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[help._id]"
                    @click="deleteHelp(help._id)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FAQ Modal -->
    <FAQModal
      v-model:show="showFAQModal"
      :initial-data="editingHelp"
      @success="fetchHelps"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const isButtonLoading = ref({});
const isPageLoading = ref(true);
const { get, post, put, patch, delete: del } = useApiEndpoint();
const helps = ref([]);
const showFAQModal = ref(false);
const editingHelp = ref(null);

const fetchHelps = async () => {
  try {
    const { data } = await get("helpsadminpanel");
    if (data.success) {
      helps.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching helps:", error);
    await Swal.fire("Error", "Failed to load helps", "error");
  }
};

const editHelp = (help) => {
  editingHelp.value = { ...help };
  showFAQModal.value = true;
};

const handleCreate = () => {
  editingHelp.value = null;
  showFAQModal.value = true;
};

const deleteHelp = async (id) => {
  isButtonLoading.value[id] = true;
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
      const { data } = await del(`helps/${id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });

        await fetchHelps();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
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
  isButtonLoading.value[id] = false;
};

const toggleVisibility = async (id) => {
  try {
    const { data } = await patch(`helps/${id}/visibility`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchHelps();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error toggling visibility:", error);
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

const truncateText = (text, length) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

onMounted(async () => {
  await fetchHelps();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | FAQ",
});
</script>

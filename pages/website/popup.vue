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
          {{ $t("website_popup") }}
        </h1>
      </div>
      <button
        @click="handleAction"
        class="px-4 py-2 text-white rounded-lg flex items-center gap-2 bg-indigo-600 lg:hover:bg-indigo-500 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
      >
        <Icon
          :icon="popupData?._id ? 'mdi:edit' : 'mdi:plus'"
          class="max-md:w-4 max-md:h-4"
        />
        {{ popupData?._id ? $t("edit") : $t("create") }}
      </button>
    </div>

    <!-- Content Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 max-md:p-4">
        <table class="w-full">
          <tbody class="divide-y divide-gray-200">
            <tr class="max-md:flex max-md:flex-col max-md:gap-2">
              <td
                class="py-4 text-sm font-medium text-gray-700 w-1/6 max-md:py-2 max-md:text-xs max-md:w-full"
              >
                {{ $t("title_en") }}
              </td>
              <td class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs">
                {{ popupData.titleEN || "-" }}
              </td>
            </tr>
            <tr class="max-md:flex max-md:flex-col max-md:gap-2">
              <td
                class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
              >
                {{ $t("title_cn") }}
              </td>
              <td class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs">
                {{ popupData.titleCN || "-" }}
              </td>
            </tr>
            <tr class="max-md:flex max-md:flex-col max-md:gap-2">
              <td
                class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
              >
                {{ $t("content_en") }}
              </td>
              <td class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs">
                {{ popupData.contentEN || "-" }}
              </td>
            </tr>
            <tr class="max-md:flex max-md:flex-col max-md:gap-2">
              <td
                class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
              >
                {{ $t("content_cn") }}
              </td>
              <td class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs">
                {{ popupData.contentCN || "-" }}
              </td>
            </tr>
            <tr class="max-md:flex max-md:flex-col max-md:gap-2">
              <td
                class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
              >
                {{ $t("media") }}
              </td>
              <td class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs">
                <div
                  class="flex items-center gap-4 max-md:gap-2 max-md:flex-col max-md:items-start"
                >
                  <video
                    v-if="isVideo(popupData.image)"
                    :src="popupData.image"
                    class="h-24 w-auto max-md:h-20 max-md:w-full"
                    controls
                    autoplay
                    muted
                    preload="auto"
                  ></video>
                  <img
                    v-else-if="popupData.image"
                    :src="popupData.image"
                    alt="Popup Media"
                    class="h-24 w-auto object-contain max-md:h-20 max-md:w-full"
                  />
                  <LoadingButton
                    :loading="isButtonLoading"
                    v-if="popupData.image"
                    @click="handleDeleteImage"
                    class="px-2 py-1 text-sm text-white bg-red-600 lg:hover:bg-red-500 rounded-md flex items-center gap-1 max-md:px-1.5 max-md:py-2 max-md:text-xs max-md:w-full max-md:justify-center"
                  >
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <Icon
                        icon="mdi:delete"
                        class="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
                      />
                      {{ $t("delete") }}
                    </div>
                  </LoadingButton>
                  <span
                    v-if="!popupData.image"
                    class="text-gray-400 max-md:text-xs"
                    >{{ $t("no_media_uploaded") }}</span
                  >
                </div>
              </td>
            </tr>
            <tr class="max-md:flex max-md:flex-col max-md:gap-2">
              <td
                class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
              >
                {{ $t("status") }}
              </td>
              <td class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs">
                <div class="flex items-center">
                  <BaseToggleSwitch
                    v-model="popupStatus"
                    @update:modelValue="toggleStatus"
                  />
                  <span
                    class="ml-3 text-sm text-gray-600 max-md:ml-2 max-md:text-xs"
                  >
                    {{ popupStatus ? $t("active") : $t("inactive") }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Popup Modal -->
    <EditPopupModal
      v-model:show="showEditPopupModal"
      :initial-data="popupData || {}"
      @success="fetchPopup"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const isButtonLoading = ref(false);
const isPageLoading = ref(true);
const popupData = ref({});
const showEditPopupModal = ref(false);
const popupStatus = ref(true);
const { get, put, patch, publicDelete: del } = useApiEndpoint();

const fetchPopup = async () => {
  try {
    const { data } = await get("popup");
    if (data.success && data.data.length > 0) {
      popupData.value = data.data[0];
      popupStatus.value = data.data[0].status;
    }
  } catch (error) {
    console.error("Error fetching popup:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch popup settings",
    });
  }
};

const toggleStatus = async () => {
  try {
    const { data } = await put(`popup/${popupData.value._id}`, {
      status: popupStatus.value,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
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

const handleDeleteImage = async () => {
  isButtonLoading.value = true;
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
      const { data } = await del(`popup/${popupData.value._id}/delete-image`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchPopup();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value = false;
  }
};

const isVideo = (url) => {
  if (!url) return false;
  if (url.startsWith("data:")) {
    return url.startsWith("data:video/");
  }
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
};

const handleAction = () => {
  showEditPopupModal.value = true;
};

onMounted(async () => {
  await fetchPopup();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Popup",
});
</script>

<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-2">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("memos") }}
          </h1>
        </div>
      </div>
      <BaseCreateButton @click="showMemosModal = true" class="max-md:hidden" />
      <MemosModal
        v-model="showMemosModal"
        @create="createMemo"
        @close="showMemosModal = false"
      />
    </div>
    <div class="max-md:mb-4 md:hidden">
      <BaseCreateButton @click="showMemosModal = true" />
    </div>
    <!-- Memo List -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 max-md:px-4 max-md:py-3">
        <div class="flex items-center justify-end p-4 border-b max-md:p-3">
          <div class="flex items-center gap-4 max-md:w-full">
            <BaseSearch
              v-model="searchQuery"
              :placeholder="$t('search_memo')"
              @type-change="handleTypeChange"
            />
          </div>
        </div>
        <div v-if="!memos" class="text-center py-12 max-md:py-8">
          <p class="text-gray-600 text-xl font-medium mb-2 max-md:text-lg">
            {{ $t("no_memos_available") }}
          </p>
          <p class="text-gray-500 max-md:text-sm">
            {{ $t("add_new_memos") }}
          </p>
        </div>

        <div v-else class="space-y-6 max-md:space-y-4">
          <div>
            <div
              v-for="(memo, index) in paginatedMemos"
              :key="index"
              class="border rounded-lg p-6 max-md:p-4"
            >
              <div
                class="grid grid-cols-3 gap-4 text-sm text-gray-500 mb-4 max-md:grid-cols-1 max-md:gap-2 max-md:text-xs"
              >
                <div>
                  <span class="font-medium text-gray-700"
                    >{{ $t("created_at") }}:</span
                  ><br />
                  {{ formatDate(memo.createdAt) }}
                </div>
                <div>
                  <span class="font-medium text-gray-700"
                    >{{ $t("last_updated_by") }}:</span
                  ><br />
                  {{ memo.lastUpdatedBy.toUpperCase() }}
                </div>
                <div>
                  <span class="font-medium text-gray-700"
                    >{{ $t("last_updated_at") }}:</span
                  ><br />

                  {{ formatDate(memo.updatedAt) }}
                </div>
              </div>
              <textarea
                v-model="memo.memoText"
                rows="4"
                class="w-full p-4 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-md:p-3 max-md:text-sm"
              ></textarea>
              <div
                v-if="
                  ((tempPhotos[memo._id] || memo.photos) &&
                    (tempPhotos[memo._id] || memo.photos).length > 0) ||
                  (tempPhotoPreview[memo._id] &&
                    tempPhotoPreview[memo._id].length > 0)
                "
                class="mt-4 max-md:mt-3"
              >
                <div
                  class="grid grid-cols-5 gap-4 max-md:grid-cols-3 max-md:gap-2 max-sm:grid-cols-2"
                >
                  <!-- 显示现有照片 -->
                  <div
                    v-for="(photo, photoIndex) in tempPhotos[memo._id] ||
                    memo.photos"
                    :key="`existing-${photoIndex}`"
                    class="relative"
                  >
                    <img
                      :src="photo"
                      alt="Memo photo"
                      class="w-full h-32 object-cover rounded cursor-pointer max-md:h-24"
                      @click="viewImage(photo)"
                    />
                    <button
                      @click="removePhoto(memo._id, photoIndex)"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 lg:hover:bg-red-600"
                    >
                      <Icon
                        icon="mdi:close"
                        class="w-4 h-4 max-md:w-3 max-md:h-3"
                      />
                    </button>
                  </div>
                  <!-- 显示新上传的照片预览 -->
                  <div
                    v-for="(previewUrl, previewIndex) in tempPhotoPreview[
                      memo._id
                    ]"
                    :key="`preview-${previewIndex}`"
                    class="relative"
                  >
                    <img
                      :src="previewUrl"
                      alt="Preview"
                      class="w-full h-32 object-cover rounded cursor-pointer max-md:h-24"
                      @click="viewImage(previewUrl)"
                    />
                    <button
                      @click="
                        removePhoto(
                          memo._id,
                          (memo.photos?.length || 0) + previewIndex
                        )
                      "
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 lg:hover:bg-red-600"
                    >
                      <Icon
                        icon="mdi:close"
                        class="w-4 h-4 max-md:w-3 max-md:h-3"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-4 max-md:mt-3">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  @change="handleFileChange($event, memo._id)"
                  class="hidden"
                  :id="`photo-upload-${memo._id}`"
                />
                <label
                  :for="`photo-upload-${memo._id}`"
                  class="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white lg:hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                >
                  <Icon
                    icon="mdi:camera"
                    class="w-5 h-5 mr-2 max-md:w-4 max-md:h-4 max-md:mr-1"
                  />
                  {{ $t("add_photos") }}
                </label>
                <span
                  class="text-sm text-gray-500 ml-2 max-md:text-xs max-md:ml-1 max-md:block max-md:mt-1"
                  >({{
                    memo.photos
                      ? $t("photos_remaining", {
                          count: 10 - memo.photos.length,
                        })
                      : $t("max_photos_limit")
                  }})</span
                >
              </div>

              <div
                class="flex justify-end gap-2 mt-4 max-md:mt-3 max-md:flex-col"
              >
                <LoadingButton
                  :loading="isUpdateMemoButtonLoading[memo._id]"
                  @click="updateMemo(memo._id, memo.memoText, memo.photos)"
                  class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:text-sm max-md:w-full"
                >
                  {{ $t("update") }}
                </LoadingButton>
                <LoadingButton
                  :loading="isDeleteButtonLoading[memo._id]"
                  @click="deleteMemo(memo._id, index)"
                  class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:text-sm max-md:w-full"
                >
                  {{ $t("delete") }}
                </LoadingButton>
              </div>
            </div>
          </div>
          <div v-if="paginatedMemos.length == 0">
            <div
              class="flex flex-col gap-8 items-center max-md:gap-4 max-md:py-8"
            >
              <img
                src="/images/empty2.png"
                alt="Empty State"
                class="w-32 h-auto opacity-80 max-md:w-24"
              />
              <p class="max-md:text-sm">{{ $t("no_memos_found") }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BasePagination v-model="currentPage" :total-pages="totalPages" />
    <ImagePreviewModal
      v-model:show="showImageModal"
      :image-url="selectedImageUrl"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const isDeleteButtonLoading = ref({});
const isUpdateMemoButtonLoading = ref({});
const tempPhotos = ref({});
const tempPhotoFiles = ref({});
const tempPhotoPreview = ref({});
const showImageModal = ref(false);
const selectedImageUrl = ref("");
const isPageLoading = ref(true);
const { get, post, delete: del, put } = useApiEndpoint();
const memos = ref([]);
const showMemosModal = ref(false);

const viewImage = (photoUrl) => {
  selectedImageUrl.value = photoUrl;
  showImageModal.value = true;
};

const fetchMemos = async () => {
  try {
    const { data } = await get("memos");
    if (data.success) {
      memos.value = data.memos;
      memos.value.forEach((memo) => {
        tempPhotos.value[memo._id] = [...(memo.photos || [])];
      });
    }
  } catch (error) {
    console.error("Error fetching memos:", error);
  }
};

const createMemo = async (memoText, files) => {
  try {
    const formData = new FormData();
    formData.append("memoText", memoText);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("photos", files[i]);
      }
    }

    const { data } = await post("memo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchMemos();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
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

const handleFileChange = async (event, memoId) => {
  const files = event.target.files;
  const memo = memos.value.find((m) => m._id === memoId);
  const currentPhotoCount = memo.photos ? memo.photos.length : 0;

  if (currentPhotoCount + files.length > 10) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("photo_limit_exceeded", {
        current: currentPhotoCount,
        remaining: 10 - currentPhotoCount,
      }),
    });
    event.target.value = "";
    return;
  }

  if (!tempPhotoFiles.value[memoId]) {
    tempPhotoFiles.value[memoId] = [];
  }
  if (!tempPhotoPreview.value[memoId]) {
    tempPhotoPreview.value[memoId] = [];
  }
  if (!tempPhotos.value[memoId]) {
    tempPhotos.value[memoId] = [...(memo.photos || [])];
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    tempPhotoFiles.value[memoId].push(file);
    const previewUrl = URL.createObjectURL(file);
    tempPhotoPreview.value[memoId].push(previewUrl);
  }

  event.target.value = "";
};

const removePhoto = (memoId, photoIndex) => {
  const memo = memos.value.find((m) => m._id === memoId);
  const existingPhotosCount = memo.photos ? memo.photos.length : 0;

  if (photoIndex < existingPhotosCount) {
    if (!tempPhotos.value[memoId]) {
      tempPhotos.value[memoId] = [...(memo.photos || [])];
    }
    tempPhotos.value[memoId].splice(photoIndex, 1);
  } else {
    const newIndex = photoIndex - existingPhotosCount;
    URL.revokeObjectURL(tempPhotoPreview.value[memoId][newIndex]);
    tempPhotoPreview.value[memoId].splice(newIndex, 1);
    tempPhotoFiles.value[memoId].splice(newIndex, 1);
  }
};

const deleteMemo = async (id) => {
  isDeleteButtonLoading.value[id] = true;
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
      const { data } = await del(`memo/${id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchMemos();
      } else {
        await Swal.fire({
          icon: "error",
          title: $t("error"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } catch (error) {
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
  isDeleteButtonLoading.value[id] = false;
};

const updateMemo = async (id, memoText) => {
  isUpdateMemoButtonLoading.value[id] = true;
  try {
    const formData = new FormData();
    formData.append("memoText", memoText);
    formData.append("keepExistingPhotos", "true");
    if (tempPhotos.value[id]) {
      formData.append("photos", JSON.stringify(tempPhotos.value[id]));
    }
    if (tempPhotoFiles.value[id]) {
      tempPhotoFiles.value[id].forEach((file) => {
        formData.append("photos", file);
      });
    }
    const currentPhotos = [...(tempPhotos.value[id] || [])];
    const currentPreviews = tempPhotoPreview.value[id]
      ? [...tempPhotoPreview.value[id]]
      : [];
    const { data } = await put(`memo/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
        didOpen: () => {
          if (tempPhotos.value[id] === undefined) {
            tempPhotos.value[id] = currentPhotos;
          }
          if (tempPhotoPreview.value[id] === undefined) {
            tempPhotoPreview.value[id] = currentPreviews;
          }
        },
      });
      if (tempPhotoPreview.value[id]) {
        tempPhotoPreview.value[id].forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
      }
      tempPhotoFiles.value[id] = [];
      tempPhotoPreview.value[id] = [];
      tempPhotos.value[id] = undefined;
      await fetchMemos();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isUpdateMemoButtonLoading.value[id] = false;
  }
};

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = computed(() => filteredMemos.value.length);
const totalPages = computed(() =>
  Math.ceil(totalItems.value / itemsPerPage.value)
);
const startEntry = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});
const endEntry = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalItems.value ? totalItems.value : end;
});
const filteredMemos = computed(() => {
  let result = [...memos.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (memo) =>
        memo.memoText.toLowerCase().includes(query) ||
        memo.lastUpdatedBy.toLowerCase().includes(query)
    );
  }
  return result;
});
const paginatedMemos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredMemos.value.slice(start, end);
});

const handleTypeChange = () => {
  searchQuery.value = "";
  currentPage.value = 1;
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchMemos();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Memos",
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ initialData?._id ? $t("edit") : $t("create") }}
              {{ $t("game") }}
            </h2>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <!-- Game ID -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("game_id") }} *
              </label>
              <input
                v-model="formData.gameID"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                :placeholder="$t('enter_game_id')"
              />
            </div>

            <!-- Game Names -->
            <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("game_name_en") }} *
                </label>
                <input
                  v-model="formData.gameNameEN"
                  type="text"
                  required
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  :placeholder="$t('enter_game_name_en')"
                />
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("game_name_cn") }} *
                </label>
                <input
                  v-model="formData.gameNameCN"
                  type="text"
                  required
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  :placeholder="$t('enter_game_name_cn')"
                />
              </div>
            </div>

            <!-- Provider -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("provider") }} *
              </label>
              <input
                v-model="formData.provider"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                :placeholder="$t('enter_provider')"
                list="provider-list"
              />
              <datalist id="provider-list">
                <option v-for="p in existingProviders" :key="p" :value="p" />
              </datalist>
            </div>

            <!-- Provider Launch URL -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("provider_launch_url") }}
              </label>
              <input
                v-model="formData.providerLaunchUrl"
                type="url"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                :placeholder="$t('enter_launch_url')"
              />
            </div>

            <!-- RTP Rate -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("rtp_rate") }}
              </label>
              <input
                v-model="formData.rtpRate"
                type="text"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                placeholder="e.g., 96.5%"
              />
            </div>

            <!-- Image Uploads -->
            <div class="space-y-4 max-md:space-y-3">
              <!-- English Image -->
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("game_image_en") }}
                </label>
                <div
                  class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
                >
                  <input
                    type="file"
                    @change="(e) => handleFileChange(e, 'imageEN')"
                    accept="image/*"
                    class="w-full max-md:text-sm"
                  />
                  <img
                    v-if="imageENPreview || initialData?.imageUrlEN"
                    :src="imageENPreview || initialData?.imageUrlEN"
                    class="w-20 h-20 object-cover rounded flex-shrink-0 max-md:w-16 max-md:h-16"
                    :alt="$t('game_image_en')"
                  />
                </div>
              </div>

              <!-- Chinese Image -->
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("game_image_cn") }}
                </label>
                <div
                  class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
                >
                  <input
                    type="file"
                    @change="(e) => handleFileChange(e, 'imageCN')"
                    accept="image/*"
                    class="w-full max-md:text-sm"
                  />
                  <img
                    v-if="imageCNPreview || initialData?.imageUrlCN"
                    :src="imageCNPreview || initialData?.imageUrlCN"
                    class="w-20 h-20 object-cover rounded flex-shrink-0 max-md:w-16 max-md:h-16"
                    :alt="$t('game_image_cn')"
                  />
                </div>
              </div>
            </div>

            <!-- Status Toggles -->
            <div class="space-y-3 max-md:space-y-2">
              <!-- Hot Status -->
              <div
                class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-1"
              >
                <div class="flex items-center gap-2">
                  <BaseToggleSwitch v-model="formData.hot" />
                  <span class="text-sm text-gray-700 max-md:text-xs">{{
                    $t("hot_game")
                  }}</span>
                </div>
                <span
                  class="text-xs text-gray-500 max-md:text-[10px] max-md:pl-10"
                >
                  {{ $t("hot_game_description") }}
                </span>
              </div>

              <!-- Maintenance Status -->
              <div
                class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-1"
              >
                <div class="flex items-center gap-2">
                  <BaseToggleSwitch v-model="formData.maintenance" />
                  <span class="text-sm text-gray-700 max-md:text-xs">{{
                    $t("maintenance_mode")
                  }}</span>
                </div>
                <span
                  class="text-xs text-gray-500 max-md:text-[10px] max-md:pl-10"
                >
                  {{ $t("maintenance_description") }}
                </span>
              </div>

              <!-- Slot Game Status -->
              <div
                class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-1"
              >
                <div class="flex items-center gap-2">
                  <BaseToggleSwitch v-model="formData.isslotgame" />
                  <span class="text-sm text-gray-700 max-md:text-xs">{{
                    $t("slot_game")
                  }}</span>
                </div>
                <span
                  class="text-xs text-gray-500 max-md:text-[10px] max-md:pl-10"
                >
                  {{ $t("slot_game_description") }}
                </span>
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            type="button"
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ initialData?._id ? $t("save_changes") : $t("create") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { publicGet, publicPost, publicPut } = useApiEndpoint();
const isLoading = ref(false);
const existingProviders = ref([]);

const imageENPreview = ref(null);
const imageCNPreview = ref(null);
const imageENFile = ref(null);
const imageCNFile = ref(null);

const formData = ref({
  gameNameEN: "",
  gameNameCN: "",
  gameID: "",
  rtpRate: "",
  hot: false,
  maintenance: false,
  isslotgame: false,
  provider: "",
  providerLaunchUrl: "",
});

const fetchProviders = async () => {
  try {
    const { data } = await publicGet("gamelist/providers");
    if (data.success) {
      existingProviders.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching providers:", error);
  }
};

const handleFileChange = (event, type) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "imageEN") {
        imageENPreview.value = e.target.result;
        imageENFile.value = file;
      } else if (type === "imageCN") {
        imageCNPreview.value = e.target.result;
        imageCNFile.value = file;
      }
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const form = new FormData();
    if (imageENFile.value) {
      form.append("imageEN", imageENFile.value);
    }
    if (imageCNFile.value) {
      form.append("imageCN", imageCNFile.value);
    }
    Object.keys(formData.value).forEach((key) => {
      form.append(key, formData.value[key]);
    });
    const { data } = props.initialData?._id
      ? await publicPut(`gamelist/${props.initialData._id}`, form)
      : await publicPost("gamelist", form);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("success");
      emit("update:show", false);
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
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    gameNameEN: "",
    gameNameCN: "",
    gameID: "",
    rtpRate: "",
    hot: false,
    maintenance: false,
    isslotgame: false,
    provider: "",
    providerLaunchUrl: "",
  };
  imageENPreview.value = null;
  imageCNPreview.value = null;
  imageENFile.value = null;
  imageCNFile.value = null;
};

const resetPreviews = () => {
  imageENPreview.value = null;
  imageCNPreview.value = null;
  imageENFile.value = null;
  imageCNFile.value = null;
};

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        gameNameEN: newData.gameNameEN || "",
        gameNameCN: newData.gameNameCN || "",
        gameID: newData.gameID || "",
        rtpRate: newData.rtpRate || "",
        hot: newData.hot ?? false,
        maintenance: newData.maintenance ?? false,
        isslotgame: newData.isslotgame ?? false,
        provider: newData.provider || "",
        providerLaunchUrl: newData.providerLaunchUrl || "",
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      fetchProviders();
      if (props.initialData) {
        formData.value = {
          gameNameEN: props.initialData.gameNameEN || "",
          gameNameCN: props.initialData.gameNameCN || "",
          gameID: props.initialData.gameID || "",
          rtpRate: props.initialData.rtpRate || "",
          hot: props.initialData.hot ?? false,
          maintenance: props.initialData.maintenance ?? false,
          isslotgame: props.initialData.isslotgame ?? false,
          provider: props.initialData.provider || "",
          providerLaunchUrl: props.initialData.providerLaunchUrl || "",
        };
      } else {
        resetForm();
      }
    } else {
      resetPreviews();
    }
  }
);
</script>

<style scoped></style>

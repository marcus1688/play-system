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
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ props.initialData._id ? $t("edit") : $t("create") }}
              {{ $t("website_settings") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <!-- Brand & Identity -->
            <div class="space-y-4 max-md:space-y-3">
              <div class="grid grid-cols-1 gap-4 max-md:gap-3">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("logo_image") }}</label
                  >
                  <input
                    type="file"
                    @change="(e) => handleFileChange(e, 'logoimage')"
                    accept="image/*"
                    class="w-full mb-2 max-md:text-sm max-md:mb-1.5"
                  />
                  <div v-if="props.initialData.logoimage">
                    <img
                      :src="
                        previewImages.logoimage || props.initialData.logoimage
                      "
                      alt="Logo Preview"
                      class="h-16 object-contain p-1 rounded max-md:h-12"
                      v-if="
                        previewImages.logoimage || props.initialData.logoimage
                      "
                    />
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("logo_gif") }}</label
                  >
                  <input
                    type="file"
                    @change="(e) => handleFileChange(e, 'logogif')"
                    accept="image/gif"
                    class="w-full mb-2 max-md:text-sm max-md:mb-1.5"
                  />
                  <div v-if="props.initialData.logogif">
                    <img
                      :src="previewImages.logogif || props.initialData.logogif"
                      alt="GIF Logo Preview"
                      class="h-16 object-contain p-1 rounded max-md:h-12"
                      v-if="previewImages.logogif || props.initialData.logogif"
                    />
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                  >
                    {{ $t("video") }} ({{ $t("max_2_files") }})
                  </label>
                  <input
                    type="file"
                    @change="(e) => handleFileChange(e, 'video')"
                    accept="video/*"
                    multiple
                    class="w-full mb-2 max-md:text-sm max-md:mb-1.5"
                  />

                  <div
                    v-if="filteredCurrentVideos.length > 0"
                    class="mb-4 max-md:mb-3"
                  >
                    <h4
                      class="text-sm font-medium text-gray-600 mb-2 max-md:text-xs max-md:mb-1.5"
                    >
                      {{ $t("current_videos") }}
                    </h4>
                    <div
                      v-for="(videoData, displayIndex) in filteredCurrentVideos"
                      :key="videoData.originalIndex"
                      class="relative mb-2 inline-block mr-2 max-md:mb-1.5 max-md:mr-1.5"
                    >
                      <video
                        :src="videoData.url"
                        controls
                        class="h-24 border rounded max-md:h-16"
                        muted
                      ></video>
                      <button
                        type="button"
                        @click="
                          removeVideo(videoData.originalIndex, 'existing')
                        "
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs lg:hover:bg-red-600 max-md:w-5 max-md:h-5 max-md:-top-1 max-md:-right-1"
                      >
                        ×
                      </button>
                      <p
                        class="text-xs text-gray-500 mt-1 max-md:text-[10px] max-md:mt-0.5"
                      >
                        {{ $t("video") }} {{ displayIndex + 1 }}
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="previewImages.video && previewImages.video.length > 0"
                    class="mb-4 max-md:mb-3"
                  >
                    <h4
                      class="text-sm font-medium text-gray-600 mb-2 max-md:text-xs max-md:mb-1.5"
                    >
                      {{ $t("new_videos") }}
                    </h4>
                    <div
                      v-for="(preview, index) in previewImages.video"
                      :key="'new-' + index"
                      class="relative mb-2 inline-block mr-2 max-md:mb-1.5 max-md:mr-1.5"
                    >
                      <video
                        :src="preview"
                        controls
                        class="h-24 border rounded max-md:h-16"
                        muted
                      ></video>
                      <button
                        type="button"
                        @click="removeVideo(index, 'new')"
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs lg:hover:bg-red-600 max-md:w-5 max-md:h-5 max-md:-top-1 max-md:-right-1"
                      >
                        ×
                      </button>
                      <p
                        class="text-xs text-gray-500 mt-1 max-md:text-[10px] max-md:mt-0.5"
                      >
                        {{ $t("new_video") }} {{ index + 1 }}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                  >
                    {{ $t("apk_file") }}
                  </label>
                  <input
                    type="file"
                    @change="(e) => handleFileChange(e, 'apkfile')"
                    accept="application/vnd.android.package-archive"
                    class="w-full mb-2 max-md:text-sm max-md:mb-1.5"
                  />
                  <div
                    v-if="props.initialData.apkfile"
                    class="flex items-center gap-2"
                  >
                    <i
                      class="fas fa-file-archive text-gray-500 text-xl max-md:text-base"
                    ></i>
                    <a
                      :href="props.initialData.apkfile"
                      target="_blank"
                      class="text-blue-500 lg:hover:underline max-md:text-sm"
                    >
                      {{ $t("download_current_apk") }}
                    </a>
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("company") }}</label
                  >
                  <input
                    v-model="formData.company"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("country") }}</label
                  >
                  <input
                    v-model="formData.country"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("website") }}</label
                  >
                  <input
                    v-model="formData.website"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>

                <div>
                  <div>
                    <MultiLangInput
                      v-model="formData"
                      :language-config="[
                        {
                          code: 'en',
                          name: 'English',
                          field: 'welcomemessageEN',
                        },
                        { code: 'zh', name: '中文', field: 'welcomemessageCN' },
                        {
                          code: 'ms',
                          name: 'Melayu',
                          field: 'welcomemessageMS',
                        },
                      ]"
                      :label="$t(`welcome_message`)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Video  -->
            <div class="space-y-4 max-md:space-y-3">
              <div class="flex items-center gap-4 max-md:gap-3">
                <div
                  class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"
                ></div>
                <h3 class="text-lg font-semibold max-md:text-base">
                  {{ $t("video") }}
                </h3>
              </div>

              <div class="grid grid-cols-1 gap-4 max-md:gap-3">
                <div>
                  <div>
                    <MultiLangInput
                      v-model="formData"
                      :language-config="[
                        {
                          code: 'en',
                          name: 'English',
                          field: 'videotitleEN',
                        },
                        { code: 'zh', name: '中文', field: 'videotitleCN' },
                        {
                          code: 'ms',
                          name: 'Melayu',
                          field: 'videotitleMS',
                        },
                      ]"
                      :label="$t(`video_title`)"
                    />
                  </div>
                </div>

                <div>
                  <div>
                    <MultiLangInput
                      v-model="formData"
                      :language-config="[
                        {
                          code: 'en',
                          name: 'English',
                          field: 'videodescriptionEN',
                        },
                        {
                          code: 'zh',
                          name: '中文',
                          field: 'videodescriptionCN',
                        },
                        {
                          code: 'ms',
                          name: 'Melayu',
                          field: 'videodescriptionMS',
                        },
                      ]"
                      :label="$t(`video_description`)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Announcements -->
            <div class="space-y-4 max-md:space-y-3">
              <div class="flex items-center gap-4 max-md:gap-3">
                <div
                  class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"
                ></div>
                <h3 class="text-lg font-semibold max-md:text-base">
                  {{ $t("announcements_referrals") }}
                </h3>
              </div>

              <div class="grid grid-cols-1 gap-4 max-md:gap-3">
                <div>
                  <div>
                    <MultiLangInput
                      v-model="formData"
                      :language-config="[
                        {
                          code: 'en',
                          name: 'English',
                          field: 'announcementEN',
                        },
                        { code: 'zh', name: '中文', field: 'announcementCN' },
                        {
                          code: 'ms',
                          name: 'Melayu',
                          field: 'announcementMS',
                        },
                      ]"
                      :label="$t(`announcement`)"
                    />
                  </div>
                </div>

                <div>
                  <div>
                    <MultiLangInput
                      v-model="formData"
                      :language-config="[
                        {
                          code: 'en',
                          name: 'English',
                          field: 'referralEN',
                        },
                        { code: 'zh', name: '中文', field: 'referralCN' },
                        {
                          code: 'ms',
                          name: 'Melayu',
                          field: 'referralMS',
                        },
                      ]"
                      :label="$t(`referral_message`)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Limits -->
            <div class="space-y-4 max-md:space-y-3">
              <div class="flex items-center gap-4 max-md:gap-3">
                <div
                  class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"
                ></div>
                <h3 class="text-lg font-semibold max-md:text-base">
                  {{ $t("transaction_limits") }}
                </h3>
              </div>

              <div
                class="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("min_deposit") }}</label
                  >
                  <input
                    v-model.number="formData.minDeposit"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("max_deposit") }}</label
                  >
                  <input
                    v-model.number="formData.maxDeposit"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("min_withdraw") }}</label
                  >
                  <input
                    v-model.number="formData.minWithdraw"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ $t("max_withdraw") }}</label
                  >
                  <input
                    v-model.number="formData.maxWithdraw"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div class="space-y-4 max-md:space-y-3">
              <div class="flex items-center gap-4 max-md:gap-3">
                <div
                  class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"
                ></div>
                <h3 class="text-lg font-semibold max-md:text-base">
                  {{ $t("social_media_contact") }}
                </h3>
              </div>

              <div
                class="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3"
              >
                <div v-for="platform in socialPlatforms" :key="platform">
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                    >{{ platform }}</label
                  >
                  <input
                    v-model="formData[platform.toLowerCase()]"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>
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
            :loading="isGeneralSettingButtonLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ props.initialData._id ? $t("save") : $t("create") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const { publicPost, publicPut } = useApiEndpoint();

const props = defineProps({
  show: Boolean,
  initialData: {
    type: Object,
    required: true,
    default: () => ({
      _id: null,
      company: "",
      logoimage: "",
      logogif: "",
      apkfile: "",
      country: "",
      website: "",
      welcomemessageCN: "",
      welcomemessageEN: "",
      video: [],
      videotitleCN: "",
      videotitleEN: "",
      videodescriptionCN: "",
      videodescriptionEN: "",
      announcementCN: "",
      announcementEN: "",
      referralCN: "",
      referralEN: "",
      telegram: "",
      whatsapp: "",
      wechat: "",
      youtube: "",
      facebook: "",
      instagram: "",
      livechat: "",
      gmail: "",
    }),
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isGeneralSettingButtonLoading = ref(false);
const formData = ref({
  company: "",
  country: "",
  website: "",
  welcomemessageCN: "",
  welcomemessageEN: "",
  announcementCN: "",
  announcementEN: "",
  referralCN: "",
  referralEN: "",
  telegram: "",
  wechat: "",
  videotitleCN: "",
  videotitleEN: "",
  videodescriptionCN: "",
  videodescriptionEN: "",
  facebook: "",
  instagram: "",
  livechat: "",
  gmail: "",
  youtube: "",
  whatsapp: "",
  minDeposit: 0,
  maxDeposit: 0,
  minWithdraw: 0,
  maxWithdraw: 0,
});

const fileInputs = ref({
  logoimage: null,
  logogif: null,
  video: [],
  apkfile: null,
});

const socialPlatforms = [
  "Telegram",
  "WhatsApp",
  "WeChat",
  "Youtube",
  "Facebook",
  "Instagram",
  "LiveChat",
  "Gmail",
];

const previewImages = ref({
  logoimage: null,
  logogif: null,
  video: [],
});

const videosToDelete = ref([]);

const filteredCurrentVideos = computed(() => {
  if (!props.initialData.video || !Array.isArray(props.initialData.video)) {
    return [];
  }

  return props.initialData.video
    .map((url, index) => ({
      url: url,
      originalIndex: index,
    }))
    .filter(
      (videoData) => !videosToDelete.value.includes(videoData.originalIndex)
    );
});

const handleFileChange = (event, type) => {
  if (type === "video") {
    const files = Array.from(event.target.files);
    const currentTotal = filteredCurrentVideos.value.length + files.length;

    if (currentTotal > 2) {
      Swal.fire({
        icon: "warning",
        title: $t("warning"),
        text: $t("max_2_videos_allowed"),
      });
      return;
    }

    fileInputs.value[type] = files;
    previewImages.value[type] = [];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImages.value[type][index] = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  } else {
    const file = event.target.files[0];
    if (file) {
      fileInputs.value[type] = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImages.value[type] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
};

const removeVideo = (index, type) => {
  if (type === "existing") {
    if (!videosToDelete.value.includes(index)) {
      videosToDelete.value.push(index);
    }
  } else if (type === "new") {
    fileInputs.value.video.splice(index, 1);
    previewImages.value.video.splice(index, 1);
  }
};

const handleSubmit = async () => {
  try {
    isGeneralSettingButtonLoading.value = true;
    const form = new FormData();
    Object.keys(fileInputs.value).forEach((key) => {
      if (
        key === "video" &&
        fileInputs.value[key] &&
        fileInputs.value[key].length > 0
      ) {
        fileInputs.value[key].forEach((file) => {
          form.append("video", file);
        });
      } else if (fileInputs.value[key]) {
        form.append(key, fileInputs.value[key]);
      }
    });
    if (videosToDelete.value.length > 0) {
      form.append("videosToDelete", JSON.stringify(videosToDelete.value));
    }
    Object.keys(formData.value).forEach((key) => {
      if (formData.value[key] !== "") {
        form.append(key, formData.value[key]);
      }
    });
    const { data } = props.initialData._id
      ? await publicPut(`generalsetting/${props.initialData._id}`, form)
      : await publicPost("generalsetting", form);

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
    isGeneralSettingButtonLoading.value = false;
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      fileInputs.value.video = [];
      previewImages.value.video = [];
      videosToDelete.value = [];
    }
  }
);

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      Object.keys(formData.value).forEach((key) => {
        formData.value[key] = newData[key] ?? "";
      });
    } else {
      Object.keys(formData.value).forEach((key) => {
        formData.value[key] = "";
      });
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("vip_list") }}
        </h1>
      </div>
      <LoadingButton
        :loading="isButtonLoading"
        @click="saveSettings"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-700 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
      >
        {{ $t("save") }}
      </LoadingButton>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="border-b px-6 max-md:px-3">
        <nav class="flex gap-6 max-md:gap-4 max-md:overflow-x-auto pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeMainTab = tab.key"
            :class="[
              'py-4 relative font-medium max-md:py-3 max-md:text-sm max-md:whitespace-nowrap',
              activeMainTab === tab.key
                ? 'text-indigo-600'
                : 'text-gray-500 lg:hover:text-gray-700',
            ]"
          >
            {{ $i18n.locale === "zh" ? tab.labelCN : tab.label }}
            <div
              v-if="activeMainTab === tab.key"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
            ></div>
          </button>
        </nav>
      </div>

      <div class="p-6 max-md:p-4">
        <!-- General Settings -->
        <div
          v-if="activeMainTab === 'General Settings'"
          class="space-y-6 max-md:space-y-4"
        >
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("table_title") }}
            </label>
            <input
              v-model="settings.tableTitle"
              type="text"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('vip_benefits')"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-4 max-md:mb-3">
              <h3 class="text-md font-medium text-gray-700 max-md:text-sm">
                {{ $t("row_headers") }}
              </h3>
              <button
                @click="addBenefitRow"
                class="px-3 py-1 text-sm bg-indigo-600 text-white rounded lg:hover:bg-indigo-700 max-md:px-2 max-md:py-2 max-md:text-xs"
              >
                {{ $t("add_row") }}
              </button>
            </div>

            <div class="space-y-4 max-md:space-y-3">
              <div
                v-for="(row, index) in settings.rowHeaders"
                :key="index"
                class="flex items-center gap-4 rounded-lg max-md:gap-2"
              >
                <input
                  v-model="row.name"
                  type="text"
                  class="flex-1 px-3 py-2 border rounded max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  placeholder="Row header name"
                />
                <button
                  @click="removeBenefitRow(index)"
                  class="p-1 text-red-600 lg:hover:text-red-700"
                >
                  <Icon
                    icon="material-symbols:delete-outline"
                    class="w-5 h-5 max-md:w-4 max-md:h-4"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- VIP Levels -->
        <div
          v-if="activeMainTab === 'VIP Levels'"
          class="space-y-6 max-md:space-y-4"
        >
          <div class="border-b">
            <nav class="flex gap-6 overflow-x-auto pb-2 max-md:gap-4">
              <button
                v-for="level in settings.vipLevels"
                :key="level.name"
                @click="handleTabClick(level)"
                :class="[
                  'py-4 relative font-medium max-md:py-3 max-md:text-sm max-md:whitespace-nowrap',
                  activeVipTab === level.name
                    ? 'text-indigo-600'
                    : 'text-gray-500 lg:hover:text-gray-700',
                ]"
              >
                {{ level.name }}
                <div
                  v-if="activeVipTab === level.name"
                  class="absolute left-0 right-0 h-0.5 bg-indigo-600"
                ></div>
              </button>
              <button
                @click="addVipLevel"
                class="py-4 text-indigo-600 lg:hover:text-indigo-700 max-md:py-3"
              >
                <Icon
                  icon="material-symbols:add"
                  class="w-5 h-5 max-md:w-4 max-md:h-4"
                />
              </button>
            </nav>
          </div>

          <div v-if="activeVipLevel" class="space-y-6 max-md:space-y-4">
            <div
              class="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-3"
            >
              <div class="flex-1 max-w-md max-md:max-w-full">
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("level_name") }}
                </label>
                <input
                  :value="activeVipLevel.name"
                  @input="handleNameChange($event.target.value)"
                  type="text"
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
              </div>

              <button
                @click="removeVipLevel"
                class="px-3 py-2 text-red-600 lg:hover:text-red-700 rounded-lg border border-red-600 lg:hover:bg-red-50 max-md:w-full max-md:px-2 max-md:py-1.5 max-md:text-sm"
                :disabled="settings.vipLevels.length <= 1"
              >
                <Icon
                  icon="material-symbols:delete-outline"
                  class="w-5 h-5 max-md:w-4 max-md:h-4 max-md:inline"
                />
              </button>
            </div>

            <div class="max-w-md max-md:max-w-full">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("level_icon") }}
              </label>
              <div class="flex items-start gap-4 max-md:gap-3">
                <div
                  class="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50 max-md:w-20 max-md:h-20"
                >
                  <img
                    v-if="activeVipLevel.iconUrl"
                    :src="activeVipLevel.iconUrl"
                    class="max-w-full max-h-full object-contain"
                    alt="Level icon"
                  />
                  <Icon
                    v-else
                    icon="material-symbols:image-outline"
                    class="w-12 h-12 text-gray-400 max-md:w-10 max-md:h-10"
                  />
                </div>
                <div class="flex-1 space-y-2">
                  <div
                    class="flex items-center gap-2 max-md:flex-col max-md:items-stretch"
                  >
                    <label
                      class="px-4 py-2 bg-white border rounded-lg cursor-pointer lg:hover:bg-gray-50 text-sm text-gray-700 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:text-center"
                    >
                      {{ $t("upload_icon") }}
                      <input
                        type="file"
                        class="hidden"
                        accept="image/*"
                        @change="handleIconUpload"
                      />
                    </label>
                    <button
                      v-if="activeVipLevel.iconUrl"
                      @click="removeIcon"
                      class="px-4 py-2 text-red-600 lg:hover:text-red-700 text-sm max-md:px-3 max-md:py-1.5 max-md:text-xs"
                    >
                      {{ $t("remove_icon") }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 max-md:text-[10px]">
                    {{ $t("recommended_size") }}
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-4 max-md:space-y-3">
              <div
                v-for="row in settings.rowHeaders"
                :key="row.name"
                class="flex items-center gap-4 max-md:flex-col max-md:items-stretch max-md:gap-2"
              >
                <label
                  class="w-1/3 text-sm font-medium text-gray-700 max-md:w-full max-md:text-xs"
                >
                  {{ row.name }}
                </label>
                <div class="flex-1 max-md:w-full">
                  <input
                    v-model="activeVipLevel.benefits[row.name]"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                    :placeholder="$t('enter_value')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div
          v-if="activeMainTab === 'Terms & Conditions'"
          class="space-y-6 max-md:space-y-4"
        >
          <div>
            <MultiLangInput
              v-model="settings.terms"
              :language-config="[
                { code: 'en', name: 'English', field: 'en' },
                { code: 'zh', name: '中文', field: 'zh' },
                { code: 'ms', name: 'Melayu', field: 'ms' },
              ]"
              :label="$t(`content`)"
              inputType="textarea"
              :rows="6"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div class="bg-white p-6 rounded-lg shadow mt-6 max-md:p-4 max-md:mt-4">
      <h2
        class="text-lg font-medium text-gray-800 mb-4 max-md:text-base max-md:mb-3"
      >
        {{ $t("preview") }}
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-nowrap">
          <thead class="bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase max-md:px-3 max-md:py-2"
              >
                {{ settings.tableTitle }}
              </th>
              <th
                v-for="level in settings.vipLevels"
                :key="level.name"
                class="px-6 py-3 text-center text-xs font-medium text-white uppercase max-md:px-3 max-md:py-2"
              >
                <div class="flex flex-col items-center gap-2 max-md:gap-1">
                  <img
                    v-if="level.iconUrl"
                    :src="level.iconUrl"
                    class="w-6 h-6 object-contain max-md:w-5 max-md:h-5"
                  />
                  {{ level.name }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="row in settings.rowHeaders" :key="row.name">
              <td
                class="px-6 py-4 text-sm text-gray-600 bg-gray-50 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ row.name || "" }}
              </td>
              <td
                v-for="level in settings.vipLevels"
                :key="level.name"
                class="px-6 py-4 text-sm text-center text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ level.benefits[row.name] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const isPageLoading = ref(true);
const { get, post, put } = useApiEndpoint();
const settings = ref({
  tableTitle: "",
  rowHeaders: [],
  vipLevels: [],
  terms: {
    en: "",
    zh: "",
  },
});

const tabs = [
  { key: "General Settings", label: "General Settings", labelCN: "常规设置" },
  { key: "VIP Levels", label: "VIP Levels", labelCN: "VIP 等级" },
  {
    key: "Terms & Conditions",
    label: "Terms & Conditions",
    labelCN: "条款和条件",
  },
];
const isButtonLoading = ref(false);
const activeMainTab = ref("General Settings");
const activeVipTab = ref("");
const activeVipLevel = ref(null);

const fetchVipSettings = async () => {
  try {
    const { data } = await get("vipsettings");
    if (data.success) {
      settings.value = {
        ...data.data,
        rowHeaders: Array.isArray(data.data.rowHeaders)
          ? data.data.rowHeaders.map((header) =>
              typeof header === "string" ? { name: header } : header
            )
          : [],
        terms: data.data.terms || { en: "", zh: "" },
      };
    }
  } catch (error) {
    console.error("Error fetching VIP settings:", error);
  }
};

const saveSettings = async () => {
  isButtonLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("settings", JSON.stringify(settings.value));
    settings.value.vipLevels.forEach((level, index) => {
      if (level.iconFile) {
        formData.append(`icon_${index}`, level.iconFile);
      }
    });
    const { data } = await post("vipsettings", formData);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving VIP settings:", error);
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

const addBenefitRow = () => {
  settings.value.rowHeaders.push({
    name: "",
  });
  settings.value.vipLevels.forEach((level) => {
    if (!level.benefits) {
      level.benefits = new Map();
    }
    level.benefits[""] = "";
  });
};

const removeBenefitRow = (index) => {
  const rowName = settings.value.rowHeaders[index].name;
  settings.value.rowHeaders.splice(index, 1);
  settings.value.vipLevels.forEach((level) => {
    if (level.benefits) {
      delete level.benefits[rowName];
    }
  });
};

const getDefaultValue = () => "";

const handleIconUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "File size should not exceed 2MB",
    });
    return;
  }

  if (!file.type.startsWith("image/")) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Please upload an image file",
    });
    return;
  }

  try {
    activeVipLevel.value.iconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      activeVipLevel.value.iconUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Error uploading icon:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to upload icon",
    });
  }
};

const removeIcon = async () => {
  try {
    activeVipLevel.value.iconUrl = null;
    activeVipLevel.value.iconFile = null;
  } catch (error) {
    console.error("Error removing icon:", error);
  }
};

const addVipLevel = () => {
  const newLevel = {
    name: "New Level",
    iconUrl: null,
    iconFile: null,
    benefits: Object.fromEntries(
      settings.value.rowHeaders.map((row) => [row.name || "", ""])
    ),
  };

  settings.value.vipLevels.push(newLevel);
  activeVipLevel.value = newLevel;
  activeVipTab.value = newLevel.name;
};

const removeVipLevel = () => {
  if (settings.value.vipLevels.length <= 1) return;

  const currentIndex = settings.value.vipLevels.findIndex(
    (level) => level.name === activeVipTab.value
  );
  settings.value.vipLevels.splice(currentIndex, 1);
  activeVipTab.value =
    settings.value.vipLevels[currentIndex === 0 ? 0 : currentIndex - 1].name;
};

const handleNameChange = (newName) => {
  if (!activeVipLevel.value) return;
  const currentLevel = activeVipLevel.value;
  currentLevel.name = newName;
};

const handleTabClick = (level) => {
  activeVipTab.value = level.name;
  activeVipLevel.value = settings.value.vipLevels.find(
    (l) => l.name === level.name
  );
};

onMounted(async () => {
  await fetchVipSettings();
  if (settings.value.vipLevels?.length > 0) {
    activeVipTab.value = settings.value.vipLevels[0].name;
    activeVipLevel.value = settings.value.vipLevels[0];
  }
  isPageLoading.value = false;
});

useHead({
  title: "Play System | VIP",
});
</script>

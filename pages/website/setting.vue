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
          {{ $t("website_setting") }}
        </h1>
      </div>
      <button
        @click="handleAction"
        class="px-4 py-2 text-white rounded-lg flex items-center gap-2 bg-indigo-600 lg:hover:bg-indigo-500 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
      >
        <Icon
          :icon="settingsData?._id ? 'mdi:edit' : 'mdi:plus'"
          class="max-md:w-4 max-md:h-4"
        />
        {{ settingsData?._id ? $t("edit") : $t("create") }}
      </button>
    </div>

    <!-- Content Sections -->
    <div class="space-y-6 max-md:space-y-4">
      <!-- Brand & Identity Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3 max-md:mb-4">
            <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
            <h2 class="text-lg font-semibold max-md:text-base">
              {{ $t("brand_identity") }}
            </h2>
          </div>
          <table class="w-full">
            <tbody class="divide-y divide-gray-200">
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("company") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.company }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 w-1/6 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("logo_image") }}
                </td>
                <td class="py-4 text-sm text-gray-600 max-md:py-2">
                  <img
                    :src="settingsData?.logoimage"
                    alt="Web Logo"
                    class="h-8 max-md:h-6"
                  />
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("logo_gif") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  <img
                    v-if="settingsData?.logogif"
                    :src="settingsData.logogif"
                    alt="Web GIF"
                    class="h-8 max-md:h-6"
                  />
                  <span v-else>N/A</span>
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("apk_file") }}
                </td>
                <td
                  class="py-4 text-sm text-blue-600 max-md:py-2 max-md:text-xs"
                >
                  <a
                    v-if="settingsData?.apkfile"
                    :href="settingsData.apkfile"
                    target="_blank"
                    class="flex items-center gap-2 lg:hover:underline max-md:gap-1.5"
                  >
                    <Icon
                      icon="mdi:android"
                      class="text-green-500 max-md:w-4 max-md:h-4"
                    />
                    {{ $t("download_apk") }}
                  </a>
                  <span v-else class="text-gray-400">N/A</span>
                </td>
              </tr>
              <tr
                v-if="settingsData?.apkqrcode"
                class="max-md:flex max-md:flex-col max-md:gap-2"
              >
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("apk_qrcode") }}
                </td>
                <td class="py-4 text-sm text-gray-600 max-md:py-2">
                  <img
                    :src="settingsData?.apkqrcode"
                    alt="APK QR Code"
                    class="w-24 h-auto max-md:w-20"
                  />
                </td>
              </tr>
              <tr
                v-if="settingsData?.apkversion"
                class="max-md:flex max-md:flex-col max-md:gap-2"
              >
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("apk_version") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.apkversion }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("country") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  <div class="flex items-center gap-2 max-md:gap-1.5">
                    <span class="fi fi-au"></span>
                    {{ settingsData?.country }}
                  </div>
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("welcome_message_cn") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  <div class="flex items-center gap-2 max-md:gap-1.5">
                    <span class="fi fi-au"></span>
                    {{ settingsData?.welcomemessageCN || "-" }}
                  </div>
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("welcome_message_en") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  <div class="flex items-center gap-2 max-md:gap-1.5">
                    <span class="fi fi-au"></span>
                    {{ settingsData?.welcomemessageEN || "-" }}
                  </div>
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("website") }}
                </td>
                <td
                  class="py-4 text-sm text-blue-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.website || "-" }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("min_deposit") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ currency }}
                  {{ formatAmount(settingsData?.minDeposit || 0) }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("max_deposit") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ currency }}
                  {{ formatAmount(settingsData?.maxDeposit || 0) }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("min_withdraw") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ currency }}
                  {{ formatAmount(settingsData?.minWithdraw || 0) }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("max_withdraw") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ currency }}
                  {{ formatAmount(settingsData?.maxWithdraw || 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Video Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3 max-md:mb-4">
            <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
            <h2 class="text-lg font-semibold max-md:text-base">
              {{ $t("video") }}
            </h2>
          </div>
          <table class="w-full">
            <tbody class="divide-y divide-gray-200">
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 w-1/6 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("video") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  <div v-if="validVideos.length > 0" class="space-y-2">
                    <div
                      v-for="(videoUrl, index) in validVideos"
                      :key="index"
                      class="flex flex-col items-start gap-3 max-md:gap-2"
                    >
                      <span class="text-xs text-gray-500 mt-1"
                        >{{ $t("video") }} {{ index + 1 }}</span
                      >
                      <video
                        :src="videoUrl"
                        class="h-24 w-auto rounded max-md:h-20 max-md:w-full"
                        controls
                        muted
                        playsinline
                      />
                    </div>
                  </div>
                  <span v-else class="text-gray-400">N/A</span>
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("video_title_cn") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.videotitleCN || "-" }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("video_title_en") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.videotitleEN || "-" }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("video_description_cn") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.videodescriptionCN || "-" }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("video_description_en") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.videodescriptionEN || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Content & Communication Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3 max-md:mb-4">
            <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
            <h2 class="text-lg font-semibold max-md:text-base">
              {{ $t("announcements_referrals") }}
            </h2>
          </div>
          <table class="w-full">
            <tbody class="divide-y divide-gray-200">
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 w-1/6 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("announcement_cn") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.announcementCN || "-" }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("announcement_en") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.announcementEN || "-" }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("referral_message_cn") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.referralCN || "-" }}
                </td>
              </tr>
              <tr class="max-md:flex max-md:flex-col max-md:gap-2">
                <td
                  class="py-4 text-sm font-medium text-gray-700 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("referral_message_en") }}
                </td>
                <td
                  class="py-4 text-sm text-gray-600 max-md:py-2 max-md:text-xs"
                >
                  {{ settingsData?.referralEN || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Social Media & Contact Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3 max-md:mb-4">
            <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
            <h2 class="text-lg font-semibold max-md:text-base">
              {{ $t("social_media_contact") }}
            </h2>
          </div>
          <table class="w-full">
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(platform, index) in socialPlatforms"
                :key="index"
                class="max-md:flex max-md:flex-col max-md:gap-2"
              >
                <td
                  class="py-4 text-sm font-medium text-gray-700 w-1/6 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ platform.name }}
                </td>
                <td
                  class="py-4 text-sm text-blue-600 max-md:py-2 max-md:text-xs break-all"
                >
                  {{ platform.url || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- General Setting Modal -->
    <GeneralSettingModal
      v-model:show="showGeneralSettingModal"
      :initial-data="settingsData"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const isPageLoading = ref(true);
const settingsData = ref({
  company: "",
  logoimage: "",
  logogif: "",
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
});

const socialPlatforms = computed(() => [
  { name: "Telegram", url: settingsData.value?.telegram || "" },
  { name: "WhatsApp", url: settingsData.value?.whatsapp || "" },
  { name: "WeChat", url: settingsData.value?.wechat || "" },
  { name: "Youtube", url: settingsData.value?.youtube || "" },
  { name: "Facebook", url: settingsData.value?.facebook || "" },
  { name: "Instagram", url: settingsData.value?.instagram || "" },
  { name: "LiveChat", url: settingsData.value?.livechat || "" },
  { name: "Gmail", url: settingsData.value?.gmail || "" },
]);

const showGeneralSettingModal = ref(false);

const { get } = useApiEndpoint();

const fetchSettings = async () => {
  try {
    const { data } = await get("generalsetting");
    if (data.success) {
      settingsData.value = data.data[0];
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch settings",
    });
  }
};
const handleAction = () => {
  showGeneralSettingModal.value = true;
};
const handleSuccess = () => {
  fetchSettings();
};

const validVideos = computed(() => {
  return settingsData.value?.video?.filter((video) => video?.trim()) || [];
});

onMounted(async () => {
  await fetchSettings();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Website Setting",
});
</script>

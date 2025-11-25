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
              {{ initialData?._id ? $t("edit") : $t("create") }}
              {{ $t("kiosk") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <!-- Category Select -->
            <div>
              <div
                class="flex justify-between items-center mb-2 text-gray-700 text-sm max-md:flex-col max-md:items-start max-md:gap-2 max-md:text-xs max-md:mb-1.5"
              >
                <label class="block font-medium">{{
                  $t("game_category")
                }}</label>
                <div
                  class="flex gap-2 items-center max-md:flex-col max-md:items-start max-md:gap-1.5 max-md:w-full"
                >
                  <!-- Manual Game Status -->
                  <div class="flex items-center gap-2">
                    <BaseToggleSwitch v-model="formData.isManualGame" />
                    <span>{{ $t("manual_game") }}</span>
                  </div>
                  <!-- HTMl Games Status -->
                  <div class="flex items-center gap-2">
                    <BaseToggleSwitch v-model="formData.isHTMLGame" />
                    <span>{{ $t("html_game") }}</span>
                  </div>
                </div>
              </div>
              <CustomSelect v-model="formData.categoryId" required>
                <option value="">{{ $t("select_category") }}</option>
                <option
                  v-for="category in categories"
                  :key="category._id"
                  :value="category._id"
                >
                  {{ category.name }}
                </option>
              </CustomSelect>
            </div>

            <!-- Game Name -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("game_name") }}</label
              >
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Database Name -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("database_name") }}</label
              >
              <input
                v-model="formData.databaseName"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Game API -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("game_api") }}</label
              >
              <input
                v-model="formData.apiLink"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Game List API -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("game_list_api") }}</label
              >
              <input
                v-model="formData.gameListLink"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Today Turnover & Winloss API -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("today_turnover_winloss_api") }}</label
              >
              <input
                v-model="formData.todayTurnoverWinlossAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Yesterday Turnover & Winloss API -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("yesterday_turnover_winloss_api") }}</label
              >
              <input
                v-model="formData.yesterdayTurnoverWinlossAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Today Kiosk Report API -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("today_kiosk_report_api") }}</label
              >
              <input
                v-model="formData.todayKioskReportAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!--  Kiosk Report API -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("yesterday_kiosk_report_api") }}</label
              >
              <input
                v-model="formData.yesterdayKioskReportAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Databse Game ID -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("database_game_id") }}</label
              >
              <input
                v-model="formData.databaseGameID"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Databse Game Password -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("database_game_password") }}</label
              >
              <input
                v-model="formData.databaseGamePassword"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Databse Past Game ID -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("database_past_game_id") }}</label
              >
              <input
                v-model="formData.databasePastGameID"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Databse Past Game Password -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("database_past_game_password") }}</label
              >
              <input
                v-model="formData.databasePastGamePassword"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Set As Main API -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("set_as_main_api") }}</label
              >
              <input
                v-model="formData.setAsMainAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Download Url -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("download_link") }}</label
              >
              <input
                v-model="formData.downloadUrl"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- IOS Download Url -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("ios_download_link") }}</label
              >
              <input
                v-model="formData.iosDownloadUrl"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Android Download Url -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("android_download_link") }}</label
              >
              <input
                v-model="formData.androidDownloadUrl"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Change Password API -->
            <div v-if="formData.isManualGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("change_password_api") }}</label
              >
              <input
                v-model="formData.changePasswordApi"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Transfer In API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("transfer_in_api") }}</label
              >
              <input
                v-model="formData.transferInAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Transfer Out API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("transfer_out_api") }}</label
              >
              <input
                v-model="formData.transferOutAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Check Balance API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("check_balance_api") }}</label
              >
              <input
                v-model="formData.balanceAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Lock Transfer In API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("lock_transfer_in_api") }}</label
              >
              <input
                v-model="formData.lockTransferInAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Lock Transfer Out API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("lock_transfer_out_api") }}</label
              >
              <input
                v-model="formData.lockTransferOutAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Transfer All Balance to Main API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("transfer_all_balance_api") }}</label
              >
              <input
                v-model="formData.transferAllBalanceAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Transfer Balance to Main API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("transfer_balance_api") }}</label
              >
              <input
                v-model="formData.transferBalanceAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Register Game API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("register_game_api") }}</label
              >
              <input
                v-model="formData.registerGameAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Lock Game API -->
            <div v-if="!formData.isManualGame && !formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("lock_game_api") }}</label
              >
              <input
                v-model="formData.lockGameAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Admin Check User Balance API -->
            <div v-if="formData.isManualGame || formData.isHTMLGame">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("admin_check_user_balance_api") }}</label
              >
              <input
                v-model="formData.adminCheckUserBalanceAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Backend URL -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("backend_url") }}</label
              >
              <input
                v-model="formData.backendLink"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Logo Upload -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("game_logo") }}</label
              >
              <div
                class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
              >
                <input
                  type="file"
                  @change="(e) => handleFileChange(e, 'logo')"
                  accept="image/*"
                  class="w-full max-md:text-sm"
                />
                <img
                  v-if="logoPreview || initialData?.logo"
                  :src="logoPreview || initialData?.logo"
                  class="w-20 h-20 object-cover rounded flex-shrink-0 max-md:w-16 max-md:h-16"
                />
              </div>
            </div>

            <!-- Icon Upload -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("game_icon") }}</label
              >
              <div
                class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
              >
                <input
                  type="file"
                  @change="(e) => handleFileChange(e, 'icon')"
                  accept="image/*"
                  class="w-full max-md:text-sm"
                />
                <img
                  v-if="iconPreview || initialData?.icon"
                  :src="iconPreview || initialData?.icon"
                  class="w-20 h-20 object-cover rounded flex-shrink-0 max-md:w-16 max-md:h-16"
                />
              </div>
            </div>

            <!-- Banner Upload -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("game_banner") }}</label
              >
              <div
                class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
              >
                <input
                  type="file"
                  @change="(e) => handleFileChange(e, 'banner')"
                  accept="image/*"
                  class="w-full max-md:text-sm"
                />
                <img
                  v-if="bannerPreview || initialData?.banner"
                  :src="bannerPreview || initialData?.banner"
                  class="w-20 h-20 object-cover rounded flex-shrink-0 max-md:w-16 max-md:h-16"
                />
              </div>
            </div>

            <!-- Active Status -->
            <div class="flex items-center gap-4 max-md:gap-2">
              <BaseToggleSwitch v-model="formData.isActive" />
              <span class="text-sm text-gray-700 max-md:text-xs">{{
                $t("active_status")
              }}</span>
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
const { get, publicPost, publicPut } = useApiEndpoint();
const isLoading = ref(false);
const categories = ref([]);
const adminUserData = useState("adminUserData");
const logoPreview = ref(null);
const iconPreview = ref(null);
const bannerPreview = ref(null);
const logoFile = ref(null);
const iconFile = ref(null);
const bannerFile = ref(null);

const formData = ref({
  categoryId: "",
  name: "",
  apiLink: "",
  gameListLink: "",
  backendLink: "",
  downloadUrl: "",
  iosDownloadUrl: "",
  androidDownloadUrl: "",
  changePasswordApi: "",
  transferInAPI: "",
  transferOutAPI: "",
  balanceAPI: "",
  databaseName: "",
  databaseGameID: "",
  databaseGamePassword: "",
  databasePastGameID: "",
  databasePastGamePassword: "",
  setAsMainAPI: "",
  lockTransferInAPI: "",
  lockTransferOutAPI: "",
  lockGameAPI: "",
  yesterdayTurnoverWinlossAPI: "",
  todayTurnoverWinlossAPI: "",
  todayKioskReportAPI: "",
  yesterdayKioskReportAPI: "",
  transferAllBalanceAPI: "",
  transferBalanceAPI: "",
  registerGameAPI: "",
  adminCheckUserBalanceAPI: "",
  isManualGame: false,
  isHTMLGame: false,
  isActive: true,
});

const fetchCategories = async () => {
  try {
    const { data } = await get("kioskcategories");
    if (data.success) {
      categories.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

const handleFileChange = (event, type) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "logo") {
        logoPreview.value = e.target.result;
        logoFile.value = file;
      } else if (type === "icon") {
        iconPreview.value = e.target.result;
        iconFile.value = file;
      } else {
        bannerPreview.value = e.target.result;
        bannerFile.value = file;
      }
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const form = new FormData();

    if (logoFile.value) {
      form.append("logo", logoFile.value);
    }
    if (iconFile.value) {
      form.append("icon", iconFile.value);
    }
    if (bannerFile.value) {
      form.append("banner", bannerFile.value);
    }

    Object.keys(formData.value).forEach((key) => {
      form.append(key, formData.value[key]);
    });

    if (adminUserData.value?.role !== "superadmin") {
      await Swal.fire({
        icon: "info",
        title: $t("insufficient_permissions"),
        text: $t("no_permission"),
      });
      return;
    }

    const { data } = props.initialData?._id
      ? await publicPut(`kiosks/${props.initialData._id}`, form)
      : await publicPost("kiosks", form);

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

const resetPreviews = () => {
  logoPreview.value = null;
  iconPreview.value = null;
  bannerPreview.value = null;
  logoFile.value = null;
  iconFile.value = null;
  bannerFile.value = null;
};

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        categoryId: newData.categoryId?._id || "",
        name: newData.name || "",
        apiLink: newData.apiLink || "",
        gameListLink: newData.gameListLink || "",
        backendLink: newData.backendLink || "",
        downloadUrl: newData.downloadUrl || "",
        iosDownloadUrl: newData.iosDownloadUrl || "",
        androidDownloadUrl: newData.androidDownloadUrl || "",
        changePasswordApi: newData.changePasswordApi || "",
        transferInAPI: newData.transferInAPI || "",
        transferOutAPI: newData.transferOutAPI || "",
        balanceAPI: newData.balanceAPI || "",
        databaseName: newData.databaseName || "",
        databaseGameID: newData.databaseGameID || "",
        databaseGamePassword: newData.databaseGamePassword || "",
        databasePastGameID: newData.databasePastGameID || "",
        databasePastGamePassword: newData.databasePastGamePassword || "",
        setAsMainAPI: newData.setAsMainAPI || "",
        lockTransferInAPI: newData.lockTransferInAPI || "",
        lockTransferOutAPI: newData.lockTransferOutAPI || "",
        lockGameAPI: newData.lockGameAPI || "",
        yesterdayTurnoverWinlossAPI: newData.yesterdayTurnoverWinlossAPI || "",
        todayTurnoverWinlossAPI: newData.todayTurnoverWinlossAPI || "",
        todayKioskReportAPI: newData.todayKioskReportAPI || "",
        yesterdayKioskReportAPI: newData.yesterdayKioskReportAPI || "",
        transferAllBalanceAPI: newData.transferAllBalanceAPI || "",
        transferBalanceAPI: newData.transferBalanceAPI || "",
        registerGameAPI: newData.registerGameAPI || "",
        adminCheckUserBalanceAPI: newData.adminCheckUserBalanceAPI || "",
        isManualGame: newData.isManualGame ?? false,
        isHTMLGame: newData.isHTMLGame ?? false,
        isActive: newData.isActive ?? true,
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      fetchCategories();
      if (props.initialData) {
        formData.value = {
          categoryId: props.initialData.categoryId?._id || "",
          name: props.initialData.name || "",
          apiLink: props.initialData.apiLink || "",
          gameListLink: props.initialData.gameListLink || "",
          backendLink: props.initialData.backendLink || "",
          downloadUrl: props.initialData.downloadUrl || "",
          iosDownloadUrl: props.initialData.iosDownloadUrl || "",
          androidDownloadUrl: props.initialData.androidDownloadUrl || "",
          changePasswordApi: props.initialData.changePasswordApi || "",
          transferInAPI: props.initialData.transferInAPI || "",
          transferOutAPI: props.initialData.transferOutAPI || "",
          balanceAPI: props.initialData.balanceAPI || "",
          databaseName: props.initialData.databaseName || "",
          databaseGameID: props.initialData.databaseGameID || "",
          databaseGamePassword: props.initialData.databaseGamePassword || "",
          databasePastGameID: props.initialData.databasePastGameID || "",
          databasePastGamePassword:
            props.initialData.databasePastGamePassword || "",
          setAsMainAPI: props.initialData.setAsMainAPI || "",
          lockTransferInAPI: props.initialData.lockTransferInAPI || "",
          lockTransferOutAPI: props.initialData.lockTransferOutAPI || "",
          lockGameAPI: props.initialData.lockGameAPI || "",
          yesterdayTurnoverWinlossAPI:
            props.initialData.yesterdayTurnoverWinlossAPI || "",
          todayTurnoverWinlossAPI:
            props.initialData.todayTurnoverWinlossAPI || "",
          todayKioskReportAPI: props.initialData.todayKioskReportAPI || "",
          yesterdayKioskReportAPI:
            props.initialData.yesterdayKioskReportAPI || "",
          transferAllBalanceAPI: props.initialData.transferAllBalanceAPI || "",
          transferBalanceAPI: props.initialData.transferBalanceAPI || "",
          registerGameAPI: props.initialData.registerGameAPI || "",
          adminCheckUserBalanceAPI:
            props.initialData.adminCheckUserBalanceAPI || "",
          isManualGame: props.initialData.isManualGame ?? false,
          isHTMLGame: props.initialData.isHTMLGame ?? false,
          isActive: props.initialData.isActive ?? true,
        };
      }
    } else {
      resetPreviews();
      formData.value = {
        categoryId: "",
        name: "",
        apiLink: "",
        gameListLink: "",
        backendLink: "",
        downloadUrl: "",
        iosDownloadUrl: "",
        androidDownloadUrl: "",
        changePasswordApi: "",
        transferInAPI: "",
        transferOutAPI: "",
        balanceAPI: "",
        databaseName: "",
        databaseGameID: "",
        databaseGamePassword: "",
        databasePastGameID: "",
        databasePastGamePassword: "",
        setAsMainAPI: "",
        lockTransferInAPI: "",
        lockTransferOutAPI: "",
        lockGameAPI: "",
        yesterdayTurnoverWinlossAPI: "",
        todayTurnoverWinlossAPI: "",
        todayKioskReportAPI: "",
        yesterdayKioskReportAPI: "",
        transferAllBalanceAPI: "",
        transferBalanceAPI: "",
        registerGameAPI: "",
        adminCheckUserBalanceAPI: "",
        isManualGame: false,
        isHTMLGame: false,
        isActive: true,
      };
    }
  }
);
</script>

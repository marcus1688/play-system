<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-xl w-[1000px] max-h-[90vh] overflow-y-auto shadow-2xl max-w-full"
      >
        <!-- Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-2xl font-semibold text-gray-800 max-md:text-lg">
              {{ initialData?._id ? $t("edit") : $t("create") }}
              {{ $t("promotion") }}
            </h2>
          </div>
        </div>

        <!-- Form -->
        <div class="p-8 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-8 max-md:space-y-4"
          >
            <!-- Basic Info Section -->
            <div
              class="bg-gray-50 p-6 rounded-lg space-y-6 max-md:p-4 max-md:space-y-4"
            >
              <div
                class="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3"
              >
                <h3 class="text-lg font-medium text-gray-900 max-md:text-base">
                  {{ $t("basic_information") }}
                </h3>
                <div
                  class="flex justify-end items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2 max-md:w-full"
                >
                  <div class="flex gap-2 items-center">
                    <BaseToggleSwitch v-model="formData.status" />
                    <span
                      class="text-sm font-medium text-gray-700 max-md:text-xs"
                      >{{ $t("active") }}</span
                    >
                  </div>
                  <div class="flex gap-2 items-center">
                    <BaseToggleSwitch v-model="formData.isDeposit" />
                    <span
                      class="text-sm font-medium text-gray-700 max-md:text-xs"
                      >{{ $t("deposit") }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Categories -->
              <div>
                <div
                  class="flex justify-between mb-4 max-md:flex-col max-md:gap-2 max-md:mb-3"
                >
                  <label
                    class="text-sm font-medium text-gray-700 block max-md:text-xs"
                    >{{ $t("categories") }}</label
                  >
                  <div
                    v-if="checkTemplate(1)"
                    class="flex gap-6 max-md:gap-3 max-md:flex-col"
                  >
                    <div class="flex items-center gap-2">
                      <BaseToggleSwitch v-model="formData.highlight" />
                      <span
                        class="text-sm font-medium text-gray-700 max-md:text-xs"
                        >{{ $t("highlight") }}</span
                      >
                    </div>
                    <div class="flex items-center gap-2">
                      <BaseToggleSwitch
                        v-model="formData.highlightAfterLogin"
                      />
                      <span
                        class="text-sm font-medium text-gray-700 max-md:text-xs"
                        >{{ $t("highlight_after_login") }}</span
                      >
                    </div>
                  </div>
                </div>
                <div
                  class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white p-4 rounded-lg border max-md:grid-cols-1 max-md:gap-2 max-md:p-3"
                >
                  <div
                    v-for="category in categories"
                    :key="category._id"
                    class="flex items-center gap-3 max-md:gap-2"
                  >
                    <input
                      type="checkbox"
                      :id="category._id"
                      :value="category._id"
                      v-model="formData.categories"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 max-md:w-3.5 max-md:h-3.5"
                    />
                    <label
                      :for="category._id"
                      class="text-sm text-gray-600 max-md:text-xs"
                    >
                      {{ category.name }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Image Upload -->
              <div>
                <label
                  class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                  >{{ $t("promotion_image") }}</label
                >
                <div
                  class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
                >
                  <input
                    type="file"
                    @change="handleFileChange"
                    accept="image/*"
                    class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs"
                  />
                  <div
                    v-if="
                      (imagePreview || initialData?.promotionimage) &&
                      !formData.removePromotionImage
                    "
                    class="relative"
                  >
                    <img
                      :src="imagePreview || initialData?.promotionimage"
                      class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full"
                    />
                    <button
                      type="button"
                      @click="deleteImage1"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold max-md:w-5 max-md:h-5 max-md:-top-1 max-md:-right-1"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>

              <!-- Image Upload 2 -->
              <div>
                <label
                  class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                  >{{ $t("promotion_image_2") }}</label
                >
                <div
                  class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
                >
                  <input
                    type="file"
                    @change="handleFileChange2"
                    accept="image/*"
                    class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs"
                  />
                  <div
                    v-if="
                      (imagePreview2 || initialData?.promotionimage2) &&
                      !formData.removePromotionImage2
                    "
                    class="relative"
                  >
                    <img
                      :src="imagePreview2 || initialData?.promotionimage2"
                      class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full"
                    />
                    <button
                      type="button"
                      @click="deleteImage2"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold max-md:w-5 max-md:h-5 max-md:-top-1 max-md:-right-1"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>

              <!-- Image Upload 3 -->
              <div>
                <label
                  class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                  >{{ $t("promotion_image_3") }}</label
                >
                <div
                  class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
                >
                  <input
                    type="file"
                    @change="handleFileChange3"
                    accept="image/*"
                    class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs"
                  />
                  <div
                    v-if="
                      (imagePreview3 || initialData?.promotionimage3) &&
                      !formData.removePromotionImage3
                    "
                    class="relative"
                  >
                    <img
                      :src="imagePreview3 || initialData?.promotionimage3"
                      class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full"
                    />
                    <button
                      type="button"
                      @click="deleteImage3"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold max-md:w-5 max-md:h-5 max-md:-top-1 max-md:-right-1"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>

              <!-- Title -->
              <div class="mb-4 max-md:mb-3">
                <MultiLangInput
                  v-model="formData"
                  :language-config="[
                    { code: 'en', name: 'English', field: 'maintitleEN' },
                    { code: 'zh', name: '中文', field: 'maintitle' },
                    {
                      code: 'ms',
                      name: 'Melayu',
                      field: 'maintitleMS',
                    },
                  ]"
                  :label="$t('promotion_title_label')"
                  required
                  :placeholder="$t('promotion_title_placeholder')"
                />
              </div>

              <!-- Order -->
              <div>
                <label
                  class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("display_order") }}
                </label>
                <input
                  v-model="formData.order"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
                <p class="text-xs text-gray-500 mt-1 max-md:text-[10px]">
                  {{ $t("order_reminder") }}
                </p>
              </div>
            </div>

            <!-- Claim Details Section -->
            <div
              class="bg-gray-50 p-6 rounded-lg space-y-6 max-md:p-4 max-md:space-y-4"
            >
              <h3 class="text-lg font-medium text-gray-900 max-md:text-base">
                {{ $t("claim_details") }}
              </h3>

              <div
                class="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4"
              >
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("claim_frequency") }}</label
                  >
                  <CustomSelect v-model="formData.claimfrequency">
                    <option value="daily">{{ $t("daily") }}</option>
                    <option value="weekly">{{ $t("weekly") }}</option>
                    <option value="monthly">{{ $t("monthly") }}</option>
                    <option value="lifetime">{{ $t("lifetime") }}</option>
                  </CustomSelect>
                </div>
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("claim_count") }}</label
                  >
                  <input
                    v-model="formData.claimcount"
                    type="number"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                  <p
                    class="text-xs text-red-500 font-semibold max-md:text-[10px]"
                  >
                    *{{ $t("claim_count_reminder") }}
                  </p>
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4"
              >
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("claim_type") }}</label
                  >
                  <CustomSelect v-model="formData.claimtype">
                    <option value="Percentage">{{ $t("percentage") }}</option>
                    <option value="Exact">{{ $t("exact_amount") }}</option>
                  </CustomSelect>
                </div>
                <div v-if="formData.claimtype === 'Exact'">
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("bonus_amount") }}</label
                  >
                  <input
                    v-model="formData.bonusexact"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>
                <div v-else>
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("bonus_percentage") }}</label
                  >
                  <input
                    v-model="formData.bonuspercentage"
                    type="number"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4"
              >
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("withdraw_type") }}</label
                  >
                  <CustomSelect v-model="formData.withdrawtype">
                    <option value="turnover">{{ $t("turnover") }}</option>
                    <option value="winover">{{ $t("winover") }}</option>
                  </CustomSelect>
                  <p
                    class="text-xs text-red-500 font-semibold max-md:text-[10px]"
                  >
                    *{{ $t("withdraw_type_reminder") }}
                  </p>
                </div>
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("withdraw_requirement") }}</label
                  >
                  <div>
                    <div v-if="formData.withdrawtype === 'turnover'">
                      <input
                        v-model="formData.turnoverrequiremnt"
                        type="number"
                        placeholder="X"
                        step="0.01"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                      />
                    </div>
                    <div v-else>
                      <input
                        v-model="formData.winloserequirement"
                        type="number"
                        placeholder="X"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4"
              >
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("min_deposit") }}</label
                  >
                  <input
                    v-model="formData.mindeposit"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs max-md:mb-1.5"
                    >{{ $t("max_bonus") }}</label
                  >
                  <input
                    v-model="formData.maxbonus"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Allowed Games Section -->
            <div
              v-if="['localhost', 'bm8my', 'bm8sg'].includes(getCompanyId())"
              class="bg-gray-50 p-6 rounded-lg space-y-6 max-md:p-4 max-md:space-y-4"
            >
              <h3 class="text-lg font-medium text-gray-900 max-md:text-base">
                {{ $t("allowed_games") }}
              </h3>

              <div>
                <label
                  class="text-sm font-medium text-gray-700 mb-2 block max-md:text-xs"
                >
                  {{ $t("select_allowed_games") }}
                </label>
                <p class="text-xs text-gray-500 mb-3 max-md:text-[10px]">
                  {{ $t("allowed_games_description") }}
                </p>

                <div
                  class="flex flex-wrap gap-2 mb-4 max-md:gap-1.5 max-md:mb-3"
                >
                  <button
                    type="button"
                    @click="selectAllGames"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium lg:hover:bg-indigo-700 transition-colors max-md:px-3 max-md:py-1.5 max-md:text-xs"
                  >
                    <i class="bi bi-check-all mr-1"></i>
                    {{ $t("select_all") }}
                  </button>
                  <button
                    type="button"
                    @click="deselectAllGames"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium lg:hover:bg-gray-700 transition-colors max-md:px-3 max-md:py-1.5 max-md:text-xs"
                  >
                    <i class="bi bi-x-lg mr-1"></i>
                    {{ $t("deselect_all") }}
                  </button>
                  <button
                    v-for="category in kioskCategories"
                    :key="category._id"
                    type="button"
                    @click="toggleCategory(category._id)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium lg:hover:bg-blue-700 transition-colors max-md:px-3 max-md:py-1.5 max-md:text-xs"
                  >
                    <i class="bi bi-check-circle mr-1"></i>
                    {{ $t("select") }} {{ category.name }}
                  </button>
                </div>

                <div class="space-y-4 max-md:space-y-3">
                  <div
                    v-for="category in kioskCategories"
                    :key="category._id"
                    class="bg-white p-4 rounded-lg border max-md:p-3"
                  >
                    <div
                      class="flex items-center justify-between mb-3 max-md:mb-2"
                    >
                      <h4
                        class="text-sm font-semibold text-gray-700 max-md:text-xs"
                      >
                        {{ category.name }}
                      </h4>
                      <span class="text-xs text-gray-500 max-md:text-[10px]">
                        {{ getSelectedCountByCategory(category._id) }} /
                        {{ getKiosksByCategory(category._id).length }}
                      </span>
                    </div>
                    <div
                      class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-md:grid-cols-1 max-md:gap-2"
                    >
                      <div
                        v-for="kiosk in getKiosksByCategory(category._id)"
                        :key="kiosk._id"
                        class="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          :id="kiosk._id"
                          :value="kiosk.databaseName"
                          v-model="formData.allowedGameDatabaseNames"
                          class="w-4 h-4 rounded border-gray-300 text-indigo-600 max-md:w-3.5 max-md:h-3.5"
                        />
                        <label
                          :for="kiosk._id"
                          class="text-sm text-gray-600 cursor-pointer max-md:text-xs"
                        >
                          {{ kiosk.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <p
                  class="text-xs text-amber-600 font-medium mt-2 max-md:text-[10px]"
                >
                  <i class="bi bi-info-circle"></i>
                  {{ $t("allowed_games_note") }}
                </p>
              </div>
            </div>

            <!-- Content Section -->
            <div
              class="bg-gray-50 p-6 rounded-lg space-y-6 max-md:p-4 max-md:space-y-4"
            >
              <div class="mb-4 max-md:mb-3">
                <TiptapEditor
                  v-model="formData"
                  :language-config="[
                    { code: 'en', name: 'English', field: 'contentEN' },
                    { code: 'zh', name: '中文', field: 'content' },
                    { code: 'ms', name: 'Melayu', field: 'contentMS' },
                  ]"
                  :label="$t('content_label')"
                  required
                  :placeholder="$t('content_placeholder')"
                />
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div
          class="p-6 border-t bg-gray-50 flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            @click="$emit('update:show', false)"
            class="px-6 py-2.5 border border-gray-300 rounded-lg lg:hover:bg-gray-50 text-gray-700 font-medium transition-colors max-md:px-4 max-md:py-2 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-6 py-2.5 bg-indigo-600 lg:hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors max-md:px-4 max-md:py-2 max-md:text-sm max-md:w-full"
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
const { get, post, put, publicGet, publicPost, publicPut } = useApiEndpoint();
const { getCompanyId } = useCompany();
const availableKiosks = ref([]);
const kioskCategories = ref([]);
const categories = ref([]);
const isLoading = ref(false);
const imagePreview = ref(null);
const imagePreview2 = ref(null);
const imagePreview3 = ref(null);
const imageFile = ref(null);
const imageFile2 = ref(null);
const imageFile3 = ref(null);
const { checkTemplate } = useCompany();

const formData = ref({
  categories: [],
  maintitle: "",
  maintitleEN: "",
  maintitleMS: "",
  description: "",
  descriptionEN: "",
  content: "",
  contentEN: "",
  contentMS: "",
  status: true,
  isDeposit: false,
  highlight: false,
  highlightAfterLogin: false,
  claimfrequency: "",
  claimcount: 0,
  mindeposit: 0,
  // maxwithdraw: 0,
  maxbonus: 0,
  claimtype: "claimtype",
  withdrawtype: "turnover",

  bonuspercentage: 0,
  bonusexact: 0,
  turnoverrequiremnt: 0,
  winloserequirement: 0,
  TnC: "",
  TnCEN: "",
  exampleTitle: "",
  exampleTitleEN: "",
  exampleDescription: "",
  exampleDescriptionEN: "",
  withdrawConditionTitle: "",
  withdrawConditionTitleEN: "",
  withdrawConditionDescription: "",
  withdrawConditionDescriptionEN: "",
  allowedGameDatabaseNames: [],
  order: 0,
  removePromotionImage: false,
  removePromotionImage2: false,
  removePromotionImage3: false,
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    formData.value.removePromotionImage = false;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleFileChange2 = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile2.value = file;
    formData.value.removePromotionImage2 = false;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview2.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleFileChange3 = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile3.value = file;
    formData.value.removePromotionImage3 = false;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview3.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const deleteImage1 = () => {
  imageFile.value = null;
  imagePreview.value = null;
  formData.value.removePromotionImage = true;
};

const deleteImage2 = () => {
  imageFile2.value = null;
  imagePreview2.value = null;
  formData.value.removePromotionImage2 = true;
};

const deleteImage3 = () => {
  imageFile3.value = null;
  imagePreview3.value = null;
  formData.value.removePromotionImage3 = true;
};

const getKiosksByCategory = (categoryId) => {
  return availableKiosks.value.filter(
    (kiosk) => kiosk.categoryId?._id === categoryId
  );
};

const getSelectedCountByCategory = (categoryId) => {
  const categoryKiosks = getKiosksByCategory(categoryId);
  return categoryKiosks.filter((kiosk) =>
    formData.value.allowedGameDatabaseNames.includes(kiosk.databaseName)
  ).length;
};

const selectAllGames = () => {
  formData.value.allowedGameDatabaseNames = availableKiosks.value.map(
    (kiosk) => kiosk.databaseName
  );
};

const deselectAllGames = () => {
  formData.value.allowedGameDatabaseNames = [];
};

const toggleCategory = (categoryId) => {
  const categoryKiosks = getKiosksByCategory(categoryId);
  const categoryDatabaseNames = categoryKiosks.map((k) => k.databaseName);
  const allSelected = categoryDatabaseNames.every((name) =>
    formData.value.allowedGameDatabaseNames.includes(name)
  );
  if (allSelected) {
    formData.value.allowedGameDatabaseNames =
      formData.value.allowedGameDatabaseNames.filter(
        (name) => !categoryDatabaseNames.includes(name)
      );
  } else {
    const newNames = categoryDatabaseNames.filter(
      (name) => !formData.value.allowedGameDatabaseNames.includes(name)
    );
    formData.value.allowedGameDatabaseNames = [
      ...formData.value.allowedGameDatabaseNames,
      ...newNames,
    ];
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await get("promotioncategories");
    if (data.success) {
      categories.value = data.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const fetchAvailableKiosks = async () => {
  try {
    const { data } = await publicGet("promotions/available-kiosks");
    if (data.success) {
      availableKiosks.value = data.data;
      const categoriesMap = new Map();
      data.data.forEach((kiosk) => {
        if (kiosk.categoryId) {
          categoriesMap.set(kiosk.categoryId._id, kiosk.categoryId);
        }
      });
      kioskCategories.value = Array.from(categoriesMap.values());
    }
  } catch (error) {
    console.error("Error fetching kiosks:", error);
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const form = new FormData();

    if (imageFile.value) {
      form.append("promotionimage", imageFile.value);
    }

    if (imageFile2.value) {
      form.append("promotionimage2", imageFile2.value);
    }

    if (imageFile3.value) {
      form.append("promotionimage3", imageFile3.value);
    }

    Object.keys(formData.value).forEach((key) => {
      if (key === "categories") {
        formData.value[key].forEach((cat) => form.append("categories[]", cat));
      } else if (key === "allowedGameDatabaseNames") {
        form.append(key, JSON.stringify(formData.value[key]));
      } else if (["TnC", "TnCEN"].includes(key)) {
        const items = formData.value[key]
          .split("\n")
          .filter((item) => item.trim());
        items.forEach((item) => form.append(`${key}[]`, item));
      } else {
        form.append(key, formData.value[key]);
      }
    });

    const { data } = props.initialData?._id
      ? await publicPut(`promotions/${props.initialData._id}`, form)
      : await publicPost("promotions", form);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      resetForm();
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
    categories: [],
    maintitle: "",
    maintitleEN: "",
    maintitleMS: "",
    description: "",
    descriptionEN: "",
    content: "",
    contentEN: "",
    contentMS: "",
    status: true,
    isDeposit: false,
    highlight: false,
    highlightAfterLogin: false,
    claimfrequency: "",
    claimcount: 0,
    mindeposit: 0,
    // maxwithdraw: 0,
    maxbonus: 0,
    claimtype: "claimtype",
    withdrawtype: "turnover",
    bonuspercentage: 0,
    bonusexact: 0,
    turnoverrequiremnt: 0,
    winloserequirement: 0,
    TnC: "",
    TnCEN: "",
    exampleTitle: "",
    exampleTitleEN: "",
    exampleDescription: "",
    exampleDescriptionEN: "",
    withdrawConditionTitle: "",
    withdrawConditionTitleEN: "",
    withdrawConditionDescription: "",
    withdrawConditionDescriptionEN: "",
    allowedGameDatabaseNames: [],
    order: 0,
    removePromotionImage: false,
    removePromotionImage2: false,
    removePromotionImage3: false,
  };
  imagePreview.value = null;
  imagePreview2.value = null;
  imagePreview3.value = null;
  imageFile.value = null;
  imageFile2.value = null;
  imageFile3.value = null;
};

const fetchInitialData = async () => {
  await Promise.all([fetchCategories(), fetchAvailableKiosks()]);
};

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      fetchInitialData();
    }
  }
);

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        categories: newData.categories?.map((c) => c._id) || [],
        maintitle: newData.maintitle || "",
        maintitleEN: newData.maintitleEN || "",
        maintitleMS: newData.maintitleMS || "",
        description: newData.description || "",
        descriptionEN: newData.descriptionEN || "",
        content: newData.content || "",
        contentEN: newData.contentEN || "",
        contentMS: newData.contentMS || "",
        status: newData.status ?? true,
        isDeposit: newData.isDeposit ?? false,
        highlight: newData.highlight ?? false,
        highlightAfterLogin: newData.highlightAfterLogin ?? false,
        claimfrequency: newData.claimfrequency || "",
        claimcount: newData.claimcount || 0,
        mindeposit: newData.mindeposit || 0,
        // maxwithdraw: newData.maxwithdraw || 0,
        maxbonus: newData.maxbonus || 0,
        claimtype: newData.claimtype || "claimtype",
        withdrawtype: newData.withdrawtype || "turnover",
        bonuspercentage: newData.bonuspercentage || 0,
        bonusexact: newData.bonusexact || 0,
        turnoverrequiremnt: newData.turnoverrequiremnt || 0,
        winloserequirement: newData.winloserequirement || 0,
        TnC: newData.TnC?.join("\n") || "",
        TnCEN: newData.TnCEN?.join("\n") || "",
        exampleTitle: newData.exampleTitle || "",
        exampleTitleEN: newData.exampleTitleEN || "",
        exampleDescription: newData.exampleDescription?.join("\n") || "",
        exampleDescriptionEN: newData.exampleDescriptionEN?.join("\n") || "",
        withdrawConditionTitle: newData.withdrawConditionTitle || "",
        withdrawConditionTitleEN: newData.withdrawConditionTitleEN || "",
        withdrawConditionDescription:
          newData.withdrawConditionDescription?.join("\n") || "",
        withdrawConditionDescriptionEN:
          newData.withdrawConditionDescriptionEN?.join("\n") || "",
        allowedGameDatabaseNames: newData.allowedGameDatabaseNames || [],
        order: newData.order || 0,
        removePromotionImage: false,
        removePromotionImage2: false,
        removePromotionImage3: false,
      };
      imagePreview.value = null;
      imagePreview2.value = null;
      imagePreview3.value = null;
      imageFile.value = null;
      imageFile2.value = null;
      imageFile3.value = null;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);
</script>

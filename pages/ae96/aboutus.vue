<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("website_about_us") }}
        </h1>
      </div>
    </div>

    <!-- Content Section -->
    <div class="bg-white rounded-lg shadow">
      <!-- Tabs -->
      <div class="border-b overflow-x-auto">
        <div class="flex flex-wrap max-md:flex-nowrap max-md:min-w-max">
          <button
            v-for="field in contentFields"
            :key="field"
            @click="activeTab = field"
            class="px-6 py-3 text-sm font-medium border-b-2 -mb-px max-md:px-4 max-md:py-2 max-md:text-xs whitespace-nowrap"
            :class="[
              activeTab === field
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 lg:hover:text-gray-700 lg:hover:border-gray-300',
            ]"
          >
            {{ formatLabel(field) }}
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <div>
        <div
          v-for="(section, index) in infoDetails[activeTab]"
          :key="index"
          class="mb-6 max-md:mb-4"
        >
          <div class="bg-gray-50 rounded-lg p-6 mb-4 max-md:p-4 max-md:mb-3">
            <!-- Title Input -->
            <div class="mb-4 max-md:mb-3">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("title") }} {{ index + 1 }}
              </label>
              <textarea
                v-model="section.title"
                :placeholder="$t('enter_title')"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
              ></textarea>
            </div>

            <!-- Description Input -->
            <div class="mb-4 max-md:mb-3">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("description") }} {{ index + 1 }}
              </label>
              <textarea
                v-model="section.description"
                :placeholder="$t('enter_description')"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs max-md:rows-3"
              ></textarea>
            </div>

            <!-- Delete Button -->
            <button
              @click="removeSection(activeTab, index)"
              class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:px-2 max-md:py-1 max-md:text-sm max-md:w-full"
            >
              {{ $t("delete") }}
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="flex items-center gap-3 p-4 max-md:p-3 max-md:flex-col max-md:gap-2"
        >
          <button
            @click="addSection(activeTab)"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            <Icon
              icon="solar:add-circle-bold"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
            {{ $t("add_new_section") }}
          </button>
          <LoadingButton
            :loading="isButtonLoading"
            @click="postInformation"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            <div class="flex items-center gap-2">
              {{ $t("save_all") }}
            </div>
          </LoadingButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const isButtonLoading = ref(false);
const isPageLoading = ref(true);
const { get, post } = useApiEndpoint();
const activeTab = ref("companyprofileEN");
const contentFields = [
  "companyprofileEN",
  "companyprofileCN",
  "enterprisespiritEN",
  "enterprisespiritCN",
  "termsofserviceEN",
  "termsofserviceCN",
  "pw66gamesEN",
  "pw66gamesCN",
  "sportslotteryinformationEN",
  "sportslotteryinformationCN",
  "gamesintroductionEN",
  "gamesintroductionCN",
  "lotteryintroductionEN",
  "lotteryintroductionCN",
];

const formatLabel = (label) => {
  const mapping = {
    companyprofileEN: "Company Profile (English)",
    companyprofileCN: "Company Profile (Chinese)",
    enterprisespiritEN: "Enterprise Spirit (English)",
    enterprisespiritCN: "Enterprise Spirit (Chinese)",
    termsofserviceEN: "Terms of Service (English)",
    termsofserviceCN: "Terms of Service (Chinese)",
    pw66gamesEN: "AE96 Games (English)",
    pw66gamesCN: "AE96 Games (Chinese)",
    sportslotteryinformationEN: "Sports Lottery Info (English)",
    sportslotteryinformationCN: "Sports Lottery Info (Chinese)",
    gamesintroductionEN: "Games Introduction (English)",
    gamesintroductionCN: "Games Introduction (Chinese)",
    lotteryintroductionEN: "Lottery Introduction (English)",
    lotteryintroductionCN: "Lottery Introduction (Chinese)",
  };

  return mapping[label] || label;
};

const infoDetails = ref({});

contentFields.forEach((field) => {
  infoDetails.value[field] = [
    {
      title: "",
      description: "",
    },
  ];
});

const addSection = (field) => {
  infoDetails.value[field].push({
    title: "",
    description: "",
  });
};

const removeSection = (field, index) => {
  if (infoDetails.value[field].length > 1) {
    infoDetails.value[field].splice(index, 1);
  } else {
    alert("Cannot delete the last section");
  }
};

const fetchInformation = async () => {
  try {
    const { data } = await get("information");
    if (data.success && data.data.details) {
      contentFields.forEach((field) => {
        if (data.data.details[field] && data.data.details[field].length > 0) {
          infoDetails.value[field] = data.data.details[field];
        } else {
          infoDetails.value[field] = [
            {
              title: "",
              description: "",
            },
          ];
        }
      });
    }
  } catch (error) {
    console.error("Error fetching information:", error);
  }
};

const postInformation = async () => {
  isButtonLoading.value = true;
  try {
    const { data } = await post("information", {
      details: infoDetails.value,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        confirmButtonColor: "#3085d6",
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error posting information:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
      confirmButtonColor: "#d33",
    });
  } finally {
    isButtonLoading.value = false;
  }
};

onMounted(async () => {
  await fetchInformation();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | About Us",
});
</script>

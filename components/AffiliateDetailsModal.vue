<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-2"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[80%] max-h-[90vh] my-6 flex flex-col max-w-full max-md:w-[95%] max-md:my-4"
      >
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
              <div>
                <h2 class="text-xl font-semibold max-md:text-lg">
                  {{ $t("affiliate_details") }}
                </h2>
                <!-- <p class="text-sm text-gray-500">{{ username }}</p> -->
              </div>
            </div>
            <button
              @click="$emit('update:show', false)"
              class="text-gray-500 lg:hover:text-gray-700"
            >
              <Icon
                icon="material-symbols:close"
                class="w-6 h-6 max-md:w-5 max-md:h-5"
              />
            </button>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="border-b px-6 max-md:px-4">
          <nav
            class="flex gap-6 whitespace-nowrap overflow-x-auto pb-4 max-md:gap-4 max-md:pb-3"
          >
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="activeTab = tab.value"
              :class="[
                'py-4 relative font-medium max-md:py-3 max-md:text-sm',
                activeTab === tab.value
                  ? 'text-indigo-600'
                  : 'text-gray-500 lg:hover:text-gray-700',
              ]"
            >
              {{ $i18n.locale === "zh" ? tab.labelCN : tab.label }}
              <div
                v-if="activeTab === tab.value"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
              ></div>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6 overflow-y-auto h-[90vh] max-md:p-4 max-md:h-[75vh]">
          <!-- User Details Tab -->
          <AffiliateDetailsTab
            v-if="activeTab === 'details' && props.userData"
            :user="props.userData"
            @update="() => emit('userUpdated')"
          />

          <!-- Bank Details Tab -->
          <AffiliateBankDetailsTab
            v-if="activeTab === 'bank'"
            :banks="userData.bankAccounts"
            :userId="userData._id"
            :userData="props.userData"
            @update="() => emit('userUpdated')"
          />
        </div>
      </div></div
  ></Teleport>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { get } = useApiEndpoint();
const props = defineProps({
  show: Boolean,
  userData: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  defaultTab: {
    type: String,
    default: "details",
  },
});

watch(
  () => props.userId,
  (newId) => {
    if (newId) {
      userData.value = { ...mockUserData, id: newId };
    }
  },
  { immediate: true }
);

const emit = defineEmits(["update:show", "userUpdated"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const activeTab = ref(props.defaultTab);

const tabs = [
  { label: "User Details", labelCN: "用户详情", value: "details" },
  { label: "Bank Details", labelCN: "银行详情", value: "bank" },
];

watch(
  () => props.defaultTab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab;
    }
  }
);

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      activeTab.value = props.defaultTab;
    }
  }
);
</script>

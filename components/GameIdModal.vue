<template>
  <Teleport to="body">
    <GameChangePasswordModal
      v-model:show="showChangePasswordModal"
      :game="selectedKioskForPassword"
      :user-id="userData?._id"
      @success="handleChangePasswordSuccess"
    />
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("all_game_id") }}
            </h2>
          </div>
        </div>

        <div class="p-4">
          <!-- User Info -->
          <div
            class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-md:p-3 max-md:mb-3"
          >
            <div class="grid grid-cols-2 gap-4 max-md:gap-2">
              <div>
                <div class="text-sm text-gray-500 max-md:text-xs">
                  {{ $t("userid") }}
                </div>
                <div class="font-semibold text-gray-800 max-md:text-sm">
                  {{ userData?.userid }}
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-500 max-md:text-xs">
                  {{ $t("full_name") }}
                </div>
                <div class="font-semibold text-gray-800 max-md:text-sm">
                  {{ userData?.fullname }}
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <Icon icon="eos-icons:loading" class="w-8 h-8 text-indigo-600" />
          </div>

          <!-- Game ID List -->
          <div v-else class="space-y-2">
            <div
              v-for="kiosk in kioskList"
              :key="kiosk._id"
              class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 max-md:p-2"
            >
              <div>
                <div class="text-sm font-medium text-gray-700 max-md:text-xs">
                  {{ kiosk.name }}
                </div>
                <div
                  class="text-sm font-semibold max-md:text-xs"
                  :class="
                    kiosk.userKioskId ? 'text-indigo-600' : 'text-gray-400'
                  "
                >
                  {{ kiosk.userKioskId || $t("not_registered") }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="kiosk.userKioskId"
                  @click="copyToClipboard(kiosk.userKioskId)"
                  class="px-3 py-2 bg-indigo-600 text-white text-xs rounded lg:hover:bg-indigo-500 flex items-center gap-1"
                >
                  <Icon icon="mdi:content-copy" class="w-4 h-4" />
                  {{ $t("copy") }}
                </button>
                <button
                  v-if="kiosk.changePasswordApi"
                  @click="openChangePasswordModal(kiosk)"
                  class="px-3 py-2 bg-indigo-600 text-white text-xs rounded lg:hover:bg-indigo-500 flex items-center gap-1"
                >
                  <Icon icon="mdi:key" class="w-4 h-4" />
                  {{ $t("change_password") }}
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="kioskList.length === 0"
              class="text-center py-8 text-gray-500"
            >
              {{ $t("no_game_id_found") }}
            </div>
          </div>

          <!-- Copy All Button -->
          <div v-if="hasAnyGameId" class="mt-4 hidden">
            <button
              @click="copyAllGameIds"
              class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:content-copy" class="w-5 h-5" />
              {{ $t("copy_all") }}
            </button>
          </div>
        </div>

        <div class="p-6 border-t flex justify-end max-md:p-4">
          <button
            @click="closeModal"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-100 max-md:px-3 max-md:py-1.5 max-md:text-sm"
          >
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  userData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => closeModal());
const { post } = useApiEndpoint();

const showChangePasswordModal = ref(false);
const selectedKioskForPassword = ref(null);
const isLoading = ref(false);
const kioskList = ref([]);

const hasAnyGameId = computed(() => {
  return kioskList.value.some((k) => k.userKioskId);
});

const openChangePasswordModal = (kiosk) => {
  selectedKioskForPassword.value = kiosk;
  showChangePasswordModal.value = true;
};

const fetchKioskGameIds = async () => {
  if (!props.userData?._id) return;

  isLoading.value = true;
  try {
    const { data } = await post("kiosk/get-user-kiosk-ids", {
      userId: props.userData._id,
    });
    if (data.success) {
      kioskList.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching kiosk game IDs:", error);
  } finally {
    isLoading.value = false;
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    await Swal.fire({
      icon: "success",
      title: $t("copied"),
      text: text,
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const copyAllGameIds = async () => {
  const gameIds = kioskList.value
    .filter((k) => k.userKioskId)
    .map((k) => `${k.name}: ${k.userKioskId}`)
    .join("\n");

  try {
    await navigator.clipboard.writeText(gameIds);
    await Swal.fire({
      icon: "success",
      title: $t("copied"),
      text: $t("all_game_ids_copied"),
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const closeModal = () => {
  kioskList.value = [];
  emit("update:show", false);
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      fetchKioskGameIds();
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[50%] h-[70vh] flex flex-col max-w-full max-md:w-full max-md:h-[75vh]"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
              <h2 class="text-xl font-semibold max-md:text-lg">
                {{ $t("bet_details") }}
              </h2>
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

        <div class="flex-1 overflow-hidden">
          <div v-if="isLoading" class="flex items-center justify-center h-full">
            <Icon
              icon="eos-icons:loading"
              class="w-10 h-10 text-indigo-600 animate-spin"
            />
          </div>
          <iframe
            v-else-if="iframeUrl"
            :src="iframeUrl"
            class="w-full h-full border-0"
            allowfullscreen
          ></iframe>
          <div
            v-else
            class="flex items-center justify-center h-full text-gray-500"
          >
            {{ $t("no_data") }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: Boolean,
  record: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { post } = useApiEndpoint();

const isLoading = ref(false);
const iframeUrl = ref("");

const fetchBetDetail = async () => {
  if (!props.record) return;

  try {
    isLoading.value = true;
    iframeUrl.value = "";

    const { data } = await post("getgamedetailhistory", {
      provider: props.record.provider,
      transactionId: props.record.betId,
      lang: "en",
    });

    if (data.success) {
      iframeUrl.value = data.data;
    } else {
      emit("update:show", false);
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          data.message?.[$locale.value] ||
          data.message?.en ||
          $t("fetch_failed"),
      });
    }
  } catch (error) {
    console.error("Error fetching bet detail:", error);
    emit("update:show", false);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("network_error"),
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (newValue) => {
    if (newValue && props.record) {
      fetchBetDetail();
    } else {
      iframeUrl.value = "";
    }
  }
);
</script>

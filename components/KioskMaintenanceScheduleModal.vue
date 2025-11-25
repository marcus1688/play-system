<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] max-w-full">
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-base">
              {{ $t("schedule_game_status") }}
            </h2>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <div class="space-y-4 max-md:space-y-3">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("deactivate_time") }}
                </label>
                <Datepicker
                  v-model="formData.deactivateAt"
                  :min-date="new Date()"
                  :is24="true"
                  :enable-time-picker="true"
                  format="dd/MM/yyyy HH:mm"
                  auto-apply
                  :placeholder="$t('select_date_and_time')"
                  class="maintenance-picker"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("activate_time") }}
                </label>
                <Datepicker
                  v-model="formData.activateAt"
                  :min-date="new Date()"
                  :is24="true"
                  :enable-time-picker="true"
                  format="dd/MM/yyyy HH:mm"
                  auto-apply
                  :placeholder="$t('select_date_and_time')"
                  class="maintenance-picker"
                />
              </div>
            </div>
          </form>
        </div>

        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            type="button"
            @click="handleClear"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("clear_schedule") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("save_schedule") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
const props = defineProps({
  show: Boolean,
  kiosk: {
    type: Object,
    required: false,
    default: null,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { put, delete: del } = useApiEndpoint();

const isLoading = ref(false);

const formData = ref({
  deactivateAt: "",
  activateAt: "",
});

watch(
  () => props.kiosk,
  (newKiosk) => {
    if (newKiosk?.maintenance) {
      formData.value = {
        deactivateAt: newKiosk.maintenance.deactivateAt || "",
        activateAt: newKiosk.maintenance.activateAt || "",
      };
    } else {
      formData.value = {
        deactivateAt: "",
        activateAt: "",
      };
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const { data } = await put(
      `kiosks/${props.kiosk._id}/maintenance`,
      formData.value
    );

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

const handleClear = async () => {
  try {
    isLoading.value = true;
    const { data } = await del(`kiosks/${props.kiosk._id}/maintenance`);
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
</script>

<style scoped>
.maintenance-picker {
  width: 100%;
}

.maintenance-picker .dp__input {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  width: 100%;
  border: 1px solid #e5e7eb;
}

.dp__theme_light {
  --dp-background-color: #ffffff;
  --dp-text-color: #374151;
  --dp-hover-color: #f3f4f6;
  --dp-hover-text-color: #111827;
  --dp-hover-icon-color: #4f46e5;
  --dp-primary-color: #4f46e5;
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: #e5e7eb;
  --dp-border-color: #e5e7eb;
  --dp-menu-border-width: 1px;
}
</style>

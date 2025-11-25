<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[600px] p-6 max-w-full max-md:p-4">
        <div class="flex items-center justify-between mb-6 max-md:mb-4">
          <div
            class="flex items-center gap-4 max-md:gap-2 max-md:flex-1 max-md:min-w-0"
          >
            <div
              class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6 max-md:flex-shrink-0"
            ></div>
            <h2 class="text-xl font-semibold max-md:text-base max-md:truncate">
              {{ isEditing ? $t("edit_whitelist_ip") : $t("add_whitelist_ip") }}
            </h2>
          </div>
          <button
            @click="$emit('update:show', false)"
            class="text-gray-500 lg:hover:text-gray-700 max-md:flex-shrink-0"
          >
            <Icon
              icon="heroicons:x-mark"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("ip_addresses_one_per_line") }}
            </label>
            <textarea
              v-model="formData.ipsText"
              required
              rows="5"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('ip_placeholder')"
            ></textarea>
            <p
              class="text-xs text-gray-500 mt-1 max-md:text-[10px] max-md:mt-0.5"
            >
              {{ $t("ip_format_hint") }}
            </p>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("description") }}
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('description_placeholder')"
            ></textarea>
          </div>

          <div
            class="flex justify-end pt-4 gap-3 max-md:pt-3 max-md:gap-2 max-md:flex-col-reverse"
          >
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg lg:hover:bg-gray-300 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
              @click="$emit('update:show', false)"
            >
              {{ $t("cancel") }}
            </button>
            <LoadingButton
              :loading="isSubmitting"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{
                isSubmitting
                  ? $t("saving_loading")
                  : isEditing
                  ? $t("update")
                  : $t("add")
              }}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";

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
const { post, put } = useApiEndpoint();
const isSubmitting = ref(false);
const isEditing = computed(() => !!props.initialData);
const formData = ref({
  ipsText: "",
  description: "",
});

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      formData.value = {
        ipsText: newVal.ips.join("\n"),
        description: newVal.description || "",
      };
    } else {
      formData.value = {
        ipsText: "",
        description: "",
      };
    }
  },
  { immediate: true }
);

const validateIPs = (ips) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const invalidIPs = ips.filter((ip) => !ipRegex.test(ip));
  if (invalidIPs.length > 0) {
    Swal.fire({
      icon: "error",
      title: "Invalid IP Format",
      html: `The following IPs have invalid format:<br>${invalidIPs.join(
        "<br>"
      )}`,
    });
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  try {
    const ips = formData.value.ipsText
      .split("\n")
      .map((ip) => ip.trim())
      .filter((ip) => ip);
    if (ips.length === 0) {
      Swal.fire({
        icon: "warning",
        title: $t("no_ips_provided"),
        text: $t("enter_at_least_one_ip"),
      });
      return;
    }
    // if (!validateIPs(ips)) {
    //   return;
    // }
    isSubmitting.value = true;
    const payload = {
      ips,
      description: formData.value.description,
    };
    let response;
    if (isEditing.value) {
      response = await put(`whitelist-ip/${props.initialData._id}`, payload);
    } else {
      response = await post("whitelist-ip", payload);
    }
    if (response.data.success) {
      formData.value = {
        ipsText: "",
        description: "",
      };
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
      emit("success");
      emit("update:show", false);
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving whitelist IP:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

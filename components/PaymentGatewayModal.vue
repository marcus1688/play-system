<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ initialData?._id ? $t("edit") : $t("create") }}
              {{ $t("payment_gateway") }}
            </h2>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("gateway_name") }}</label
              >
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("payment_api") }}</label
              >
              <input
                v-model="formData.paymentAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("report_api") }}</label
              >
              <input
                v-model="formData.reportAPI"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("minimum_deposit") }}</label
              >
              <input
                v-model="formData.minDeposit"
                type="number"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("maximum_deposit") }}</label
              >
              <input
                v-model="formData.maxDeposit"
                type="number"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("remark") }}</label
              >
              <textarea
                v-model="formData.remark"
                rows="3"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              ></textarea>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("gateway_logo") }}</label
              >
              <div
                class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
              >
                <input
                  type="file"
                  @change="handleFileChange"
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

            <div class="flex items-center gap-4 max-md:gap-2">
              <BaseToggleSwitch v-model="formData.status" />
              <span class="text-sm text-gray-700 max-md:text-xs">{{
                $t("active_status")
              }}</span>
            </div>
          </form>
        </div>

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
const { post, put } = useApiEndpoint();
const isLoading = ref(false);

const logoPreview = ref(null);
const logoFile = ref(null);

const formData = ref({
  name: "",
  paymentAPI: "",
  reportAPI: "",
  minDeposit: 0,
  maxDeposit: 0,
  remark: "",
  status: true,
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    logoFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target.result;
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
    Object.keys(formData.value).forEach((key) => {
      form.append(key, formData.value[key]);
    });
    const { data } = props.initialData?._id
      ? await put(`payment-gateways/${props.initialData._id}`, form)
      : await post("payment-gateways", form);

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

const resetForm = () => {
  formData.value = {
    name: "",
    paymentAPI: "",
    reportAPI: "",
    minDeposit: 0,
    maxDeposit: 0,
    remark: "",
    status: true,
  };
  logoPreview.value = null;
  logoFile.value = null;
};

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        name: newData.name || "",
        paymentAPI: newData.paymentAPI || "",
        reportAPI: newData.reportAPI || "",
        minDeposit: Number(newData.minDeposit) || 0,
        maxDeposit: Number(newData.maxDeposit) || 0,
        remark: newData.remark || "",
        status: newData.status ?? true,
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.show,
  (newValue) => {
    if (newValue && props.initialData) {
      formData.value = {
        name: props.initialData.name || "",
        paymentAPI: props.initialData.paymentAPI || "",
        reportAPI: props.initialData.reportAPI || "",
        minDeposit: Number(props.initialData.minDeposit) || 0,
        maxDeposit: Number(props.initialData.maxDeposit) || 0,
        remark: props.initialData.remark || "",
        status: props.initialData.status ?? true,
      };
    } else if (!newValue) {
      resetForm();
      logoPreview.value = null;
      logoFile.value = null;
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] max-w-full">
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ initialData ? $t("edit") : $t("create") }} {{ $t("bank") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("bank_name") }}</label
              >
              <input
                v-model="formData.bankname"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("bank_code") }}</label
              >
              <input
                v-model="formData.bankcode"
                type="text"
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
                >{{ $t("bank_logo") }}</label
              >
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Logo Preview"
                class="mt-2 h-32 object-contain max-md:h-24"
              />
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
            {{ initialData ? $t("save_changes") : $t("create") }}
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
const { post, patch } = useApiEndpoint();
const isLoading = ref(false);

const formData = ref({
  bankname: "",
  bankcode: "",
  remark: "",
  logo: null,
});

const imagePreview = computed(() => {
  if (formData.value.logo instanceof File) {
    return URL.createObjectURL(formData.value.logo);
  }
  return props.initialData?.logo || null;
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    formData.value.logo = file;
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;

    const form = new FormData();
    Object.keys(formData.value).forEach((key) => {
      if (formData.value[key] !== null && formData.value[key] !== "") {
        form.append(key, formData.value[key]);
      }
    });

    const { data } = props.initialData
      ? await patch(`updateuserbank/${props.initialData._id}`, form)
      : await post("createuserbanklist", form);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      formData.value = {
        bankname: "",
        bankcode: "",
        remark: "",
        logo: null,
      };
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

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        bankname: newData.bankname || "",
        bankcode: newData.bankcode || "",
        remark: newData.remark || "",
        logo: null,
      };
    } else {
      formData.value = {
        bankname: "",
        bankcode: "",
        remark: "",
        logo: null,
      };
    }
  },
  { immediate: true }
);

watch(
  () => formData.value.logo,
  (newFile, oldFile) => {
    if (oldFile instanceof File) {
      URL.revokeObjectURL(imagePreview.value);
    }
  }
);

onBeforeUnmount(() => {
  if (formData.value.logo instanceof File) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script>

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
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ initialData ? $t("edit") : $t("create") }} {{ $t("carousel") }}
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
                >{{ $t("name") }}</label
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
                >{{ $t("order") }}</label
              >
              <input
                v-model="formData.order"
                type="number"
                required
                min="1"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("carousel_image") }}
              </label>
              <div
                class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
              >
                <input
                  type="file"
                  @change="handleFileChange($event, 'image')"
                  accept="image/*"
                  :required="!initialData"
                  class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs max-md:file:text-xs max-md:file:py-1.5 max-md:file:px-3"
                />

                <div
                  v-if="
                    (imagePreview || formData.link) && !formData.removeImage
                  "
                  class="relative"
                >
                  <img
                    :src="imagePreview || formData.link"
                    alt="Preview"
                    class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full max-md:max-w-[200px]"
                  />
                  <button
                    type="button"
                    @click="deleteImage1"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold lg:hover:bg-red-600 max-md:w-5 max-md:h-5 max-md:text-xs"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("carousel_image_2") }}
              </label>
              <div
                class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
              >
                <input
                  type="file"
                  @change="handleFileChange($event, 'image2')"
                  accept="image/*"
                  class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs max-md:file:text-xs max-md:file:py-1.5 max-md:file:px-3"
                />

                <div
                  v-if="
                    (imagePreview2 || formData.link2) && !formData.removeImage2
                  "
                  class="relative"
                >
                  <img
                    :src="imagePreview2 || formData.link2"
                    alt="Preview 2"
                    class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full max-md:max-w-[200px]"
                  />
                  <button
                    type="button"
                    @click="deleteImage2"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold lg:hover:bg-red-600 max-md:w-5 max-md:h-5 max-md:text-xs"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("carousel_image_3") }}
              </label>
              <div
                class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
              >
                <input
                  type="file"
                  @change="handleFileChange($event, 'image3')"
                  accept="image/*"
                  class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs max-md:file:text-xs max-md:file:py-1.5 max-md:file:px-3"
                />
                <div
                  v-if="
                    (imagePreview3 || formData.link3) && !formData.removeImage3
                  "
                  class="relative"
                >
                  <img
                    :src="imagePreview3 || formData.link3"
                    alt="Preview 3"
                    class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full max-md:max-w-[200px]"
                  />
                  <button
                    type="button"
                    @click="deleteImage3"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold lg:hover:bg-red-600 max-md:w-5 max-md:h-5 max-md:text-xs"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("carousel_image_4") }}
              </label>
              <div
                class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
              >
                <input
                  type="file"
                  @change="handleFileChange($event, 'image4')"
                  accept="image/*"
                  class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs max-md:file:text-xs max-md:file:py-1.5 max-md:file:px-3"
                />
                <div
                  v-if="
                    (imagePreview4 || formData.link4) && !formData.removeImage4
                  "
                  class="relative"
                >
                  <img
                    :src="imagePreview4 || formData.link4"
                    alt="Preview 4"
                    class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full max-md:max-w-[200px]"
                  />
                  <button
                    type="button"
                    @click="deleteImage4"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold lg:hover:bg-red-600 max-md:w-5 max-md:h-5 max-md:text-xs"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("carousel_image_5") }}
              </label>
              <div
                class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
              >
                <input
                  type="file"
                  @change="handleFileChange($event, 'image5')"
                  accept="image/*"
                  class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs max-md:file:text-xs max-md:file:py-1.5 max-md:file:px-3"
                />
                <div
                  v-if="
                    (imagePreview5 || formData.link5) && !formData.removeImage5
                  "
                  class="relative"
                >
                  <img
                    :src="imagePreview5 || formData.link5"
                    alt="Preview 5"
                    class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full max-md:max-w-[200px]"
                  />
                  <button
                    type="button"
                    @click="deleteImage5"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold lg:hover:bg-red-600 max-md:w-5 max-md:h-5 max-md:text-xs"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("carousel_image_6") }}
              </label>
              <div
                class="flex items-center justify-between gap-6 bg-white p-4 rounded-lg border max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
              >
                <input
                  type="file"
                  @change="handleFileChange($event, 'image6')"
                  accept="image/*"
                  class="flex-1 cursor-pointer text-sm max-w-[300px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 lg:hover:file:bg-indigo-100 max-md:max-w-full max-md:text-xs max-md:file:text-xs max-md:file:py-1.5 max-md:file:px-3"
                />
                <div
                  v-if="
                    (imagePreview6 || formData.link6) && !formData.removeImage6
                  "
                  class="relative"
                >
                  <img
                    :src="imagePreview6 || formData.link6"
                    alt="Preview 6"
                    class="w-64 h-auto object-cover rounded-lg shadow max-md:w-full max-md:max-w-[200px]"
                  />
                  <button
                    type="button"
                    @click="deleteImage6"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold lg:hover:bg-red-600 max-md:w-5 max-md:h-5 max-md:text-xs"
                  >
                    &times;
                  </button>
                </div>
              </div>
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
const { publicPost, publicPatch } = useApiEndpoint();
const isLoading = ref(false);
const imagePreview = ref(null);
const imagePreview2 = ref(null);
const imagePreview3 = ref(null);
const imagePreview4 = ref(null);
const imagePreview5 = ref(null);
const imagePreview6 = ref(null);

const formData = ref({
  name: "",
  order: "",
  link: null,
  link2: null,
  link3: null,
  link4: null,
  link5: null,
  link6: null,
  status: true,
  image: null,
  image2: null,
  image3: null,
  image4: null,
  image5: null,
  image6: null,
  removeImage: false,
  removeImage2: false,
  removeImage3: false,
  removeImage4: false,
  removeImage5: false,
  removeImage6: false,
});

const handleFileChange = (event, imageType = "image") => {
  const file = event.target.files[0];
  if (file) {
    if (imageType === "image") {
      imagePreview.value = URL.createObjectURL(file);
      formData.value.image = file;
      formData.value.removeImage = false;
    } else if (imageType === "image2") {
      imagePreview2.value = URL.createObjectURL(file);
      formData.value.image2 = file;
      formData.value.removeImage2 = false;
    } else if (imageType === "image3") {
      imagePreview3.value = URL.createObjectURL(file);
      formData.value.image3 = file;
      formData.value.removeImage3 = false;
    } else if (imageType === "image4") {
      imagePreview4.value = URL.createObjectURL(file);
      formData.value.image4 = file;
      formData.value.removeImage4 = false;
    } else if (imageType === "image5") {
      imagePreview5.value = URL.createObjectURL(file);
      formData.value.image5 = file;
      formData.value.removeImage5 = false;
    } else if (imageType === "image6") {
      imagePreview6.value = URL.createObjectURL(file);
      formData.value.image6 = file;
      formData.value.removeImage6 = false;
    }
  }
};
const deleteImage1 = () => {
  formData.value.image = null;
  imagePreview.value = null;
  formData.value.removeImage = true;
};

const deleteImage2 = () => {
  formData.value.image2 = null;
  imagePreview2.value = null;
  formData.value.removeImage2 = true;
};

const deleteImage3 = () => {
  formData.value.image3 = null;
  imagePreview3.value = null;
  formData.value.removeImage3 = true;
};

const deleteImage4 = () => {
  formData.value.image4 = null;
  imagePreview4.value = null;
  formData.value.removeImage4 = true;
};

const deleteImage5 = () => {
  formData.value.image5 = null;
  imagePreview5.value = null;
  formData.value.removeImage5 = true;
};

const deleteImage6 = () => {
  formData.value.image6 = null;
  imagePreview6.value = null;
  formData.value.removeImage6 = true;
};

const resetForm = () => {
  formData.value = {
    name: "",
    order: "",
    link: null,
    link2: null,
    link3: null,
    link4: null,
    link5: null,
    link6: null,
    status: true,
    image: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    image6: null,
    removeImage: false,
    removeImage2: false,
    removeImage3: false,
    removeImage4: false,
    removeImage5: false,
    removeImage6: false,
  };
  imagePreview.value = null;
  imagePreview2.value = null;
  imagePreview3.value = null;
  imagePreview4.value = null;
  imagePreview5.value = null;
  imagePreview6.value = null;
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const form = new FormData();
    form.append("name", formData.value.name);
    form.append("order", formData.value.order);
    form.append("status", formData.value.status);
    if (formData.value.image) {
      form.append("image", formData.value.image);
    } else if (formData.value.removeImage) {
      form.append("removeImage", "true");
    }

    if (formData.value.image2) {
      form.append("image2", formData.value.image2);
    } else if (formData.value.removeImage2) {
      form.append("removeImage2", "true");
    }

    if (formData.value.image3) {
      form.append("image3", formData.value.image3);
    } else if (formData.value.removeImage3) {
      form.append("removeImage3", "true");
    }

    if (formData.value.image4) {
      form.append("image4", formData.value.image4);
    } else if (formData.value.removeImage4) {
      form.append("removeImage4", "true");
    }

    if (formData.value.image5) {
      form.append("image5", formData.value.image5);
    } else if (formData.value.removeImage5) {
      form.append("removeImage5", "true");
    }

    if (formData.value.image6) {
      form.append("image6", formData.value.image6);
    } else if (formData.value.removeImage6) {
      form.append("removeImage6", "true");
    }
    const { data } = props.initialData
      ? await publicPatch(`updatecarousel/${props.initialData._id}`, form)
      : await publicPost("createcarousel", form);

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
    if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
    if (imagePreview2.value) URL.revokeObjectURL(imagePreview2.value);
    if (imagePreview3.value) URL.revokeObjectURL(imagePreview3.value);
    if (imagePreview4.value) URL.revokeObjectURL(imagePreview4.value);
    if (imagePreview5.value) URL.revokeObjectURL(imagePreview5.value);
    if (imagePreview6.value) URL.revokeObjectURL(imagePreview6.value);

    imagePreview.value = null;
    imagePreview2.value = null;
    imagePreview3.value = null;
    imagePreview4.value = null;
    imagePreview5.value = null;
    imagePreview6.value = null;
  }
};

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        name: newData.name || "",
        order: newData.order || "",
        link: newData.link || null,
        link2: newData.link2 || null,
        link3: newData.link3 || null,
        link4: newData.link4 || null,
        link5: newData.link5 || null,
        link6: newData.link6 || null,
        status: newData.status ?? true,
        image: null,
        image2: null,
        image3: null,
        image4: null,
        image5: null,
        image6: null,
        removeImage: false,
        removeImage2: false,
        removeImage3: false,
        removeImage4: false,
        removeImage5: false,
        removeImage6: false,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  if (imagePreview2.value) URL.revokeObjectURL(imagePreview2.value);
  if (imagePreview3.value) URL.revokeObjectURL(imagePreview3.value);
  if (imagePreview4.value) URL.revokeObjectURL(imagePreview4.value);
  if (imagePreview5.value) URL.revokeObjectURL(imagePreview5.value);
  if (imagePreview6.value) URL.revokeObjectURL(imagePreview6.value);
});
</script>

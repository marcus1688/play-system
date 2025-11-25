<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("create_new_user") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <!-- Username -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("username") }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.username"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                required
              />
            </div>

            <!-- Full Name -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("full_name") }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.fullname"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                required
              />
            </div>

            <!-- Email -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("email") }}
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                required
              />
            </div>

            <!-- Date of Birth -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("date_of_birth") }}
              </label>
              <BirthDatePicker
                v-model="formData.dob"
                :placeholder="$t('select_date_of_birth')"
              />
            </div>

            <!-- Password -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("password") }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 max-md:right-2"
                >
                  <Icon
                    :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
                    class="w-5 h-5 max-md:w-4 max-md:h-4"
                  />
                </button>
              </div>
            </div>

            <!-- Phone Number -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("phone_number") }}<span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.phoneNumber"
                type="tel"
                :placeholder="$t('phone_placeholder')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                required
              />
              <div
                class="mt-1 text-sm text-gray-500 max-md:text-xs max-md:mt-0.5"
              >
                {{ $t("include_country_code") }}
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-100 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isCreateUserLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("create_user") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:show", "submit"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isCreateUserLoading = ref(false);
const showPassword = ref(false);
const formData = ref({
  username: "",
  fullname: "",
  email: "",
  dob: "",
  password: "",
  phoneNumber: "",
});

const handleSubmit = async () => {
  try {
    isCreateUserLoading.value = true;
    const { post } = useApiEndpoint();
    const submitData = {
      username: formData.value.username,
      fullname: formData.value.fullname,
      email: formData.value.email,
      dob: formData.value.dob,
      password: formData.value.password,
      phonenumber: Number(formData.value.phoneNumber),
    };
    const { data } = await post("registeragent", submitData);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update:show", false);
      formData.value = {
        username: "",
        fullname: "",
        email: "",
        dob: "",
        password: "",
        phoneNumber: "",
      };
      emit("submit");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isCreateUserLoading.value = false;
  }
};
</script>

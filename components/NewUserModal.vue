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
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
              <h2 class="text-xl font-semibold max-md:text-lg">
                {{ $t("create_new_user") }}
              </h2>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <!-- Next User ID Preview -->
            <div
              v-if="nextUserId"
              class="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center justify-between max-md:p-2"
            >
              <span class="text-sm text-gray-600 max-md:text-xs">{{
                $t("next_user_id")
              }}</span>
              <span
                class="text-lg font-bold text-indigo-600 max-md:text-base"
                >{{ nextUserId }}</span
              >
            </div>
            <!-- Username -->
            <div class="hidden">
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
                :placeholder="$t('fullname')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                required
              />
            </div>

            <!-- Email -->
            <div class="hidden">
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
            <div class="hidden">
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
            <div class="hidden">
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

            <!-- Phone Numbers (Multiple) -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("phone_number") }}<span class="text-red-500">*</span>
              </label>

              <div
                v-for="(phone, index) in formData.phoneNumbers"
                :key="index"
                class="flex items-center gap-2 mb-2"
              >
                <input
                  v-model="formData.phoneNumbers[index]"
                  type="tel"
                  :placeholder="$t('phone_placeholder')"
                  class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  :required="index === 0"
                />
                <button
                  v-if="formData.phoneNumbers.length > 1"
                  type="button"
                  @click="removePhoneNumber(index)"
                  class="p-2 text-red-500 lg:hover:bg-red-50 rounded-lg"
                >
                  <Icon icon="mdi:close" class="w-5 h-5" />
                </button>
              </div>

              <button
                type="button"
                @click="addPhoneNumber"
                class="mt-2 flex items-center gap-1 text-sm text-indigo-600 lg:hover:text-indigo-700"
              >
                <Icon icon="mdi:plus" class="w-4 h-4" />
                {{ $t("add_phone_number") }}
              </button>
            </div>

            <!-- Bank Name -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("bank_name") }}
              </label>
              <input
                v-model="formData.bankName"
                type="text"
                :placeholder="$t('bank_name_placeholder')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Bank Code -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("bank_code") }}
              </label>
              <input
                v-model="formData.bankCode"
                type="text"
                :placeholder="$t('bank_code_placeholder')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <!-- Bank Account Number -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("bank_account_number") }}
              </label>
              <input
                v-model="formData.bankNumber"
                type="text"
                :placeholder="$t('bank_account_placeholder')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
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
    </div>
  </Teleport>
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
const { get, post } = useApiEndpoint();
const isCreateUserLoading = ref(false);
const showPassword = ref(false);
const nextUserId = ref(null);

const formData = ref({
  username: "",
  fullname: "",
  email: "",
  dob: "",
  password: "",
  phoneNumbers: [""],
  bankName: "",
  bankCode: "",
  bankNumber: "",
});

const addPhoneNumber = () => {
  formData.value.phoneNumbers.push("");
};

const removePhoneNumber = (index) => {
  formData.value.phoneNumbers.splice(index, 1);
};

const fetchNextUserId = async () => {
  try {
    const { data } = await get("preview-next-userid");
    if (data.success) {
      nextUserId.value = data.nextUserId;
    }
  } catch (error) {
    console.error("Error fetching next user ID:", error);
  }
};

const handleSubmit = async () => {
  try {
    isCreateUserLoading.value = true;
    const bankAccounts = [];
    if (
      formData.value.bankName ||
      formData.value.bankCode ||
      formData.value.bankNumber
    ) {
      bankAccounts.push({
        name: formData.value.fullname,
        bankname: formData.value.bankName,
        bankcode: formData.value.bankCode,
        banknumber: formData.value.bankNumber,
      });
    }
    const phoneNumbers = formData.value.phoneNumbers.filter(
      (p) => p.trim() !== ""
    );

    const submitData = {
      username: formData.value.username,
      fullname: formData.value.fullname,
      email: formData.value.email,
      dob: formData.value.dob,
      password: formData.value.password,
      phoneNumbers: phoneNumbers,
      bankAccounts,
    };
    const { data } = await post("registeruser", submitData);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        html: `
          <p>${data.message[$locale.value] || data.message.en}</p>
        `,
        timer: 3000,
      });
      emit("update:show", false);
      formData.value = {
        username: "",
        fullname: "",
        email: "",
        dob: "",
        password: "",
        phoneNumbers: [""],
        bankName: "",
        bankCode: "",
        bankNumber: "",
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

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      fetchNextUserId();
    }
  }
);
</script>

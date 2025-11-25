<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <PageLoading v-if="isPageLoading" />
      <div class="bg-white rounded-lg w-[500px] p-6 max-w-full max-md:p-4">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6 max-md:mb-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("add_bank_account") }}
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

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <!-- Name Field (Readonly) -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("account_holder") }}
            </label>
            <input
              type="text"
              v-model="formData.name"
              readonly
              disabled
              class="w-full px-3 py-2 border rounded-lg bg-gray-50 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <!-- Bank Selection -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("bank_name") }}
            </label>
            <CustomSelect v-model="formData.bankname" required>
              <option value="">{{ $t("select_bank") }}</option>
              <option
                v-for="bank in bankList"
                :key="bank._id"
                :value="bank.bankname"
              >
                {{ bank.bankname }}
              </option>
            </CustomSelect>
          </div>

          <!-- Bank Code -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("bank_code") }}
            </label>
            <input
              type="text"
              v-model="formData.bankcode"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_bank_code')"
            />
          </div>

          <!-- Account Number -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("account_number") }}
            </label>
            <input
              type="text"
              v-model="formData.banknumber"
              required
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_account_number')"
            />
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end pt-4 max-md:pt-3">
            <LoadingButton
              :loading="isButtonLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
            >
              {{ $t("add_bank_account") }}
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
  fullname: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:show", "submit"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isPageLoading = ref(true);
const isButtonLoading = ref(false);
const { get } = useApiEndpoint();
const bankList = ref([]);
const formData = ref({
  name: props.fullname,
  bankname: "",
  banknumber: "",
});

const fetchBankList = async () => {
  try {
    const { data } = await get("activebanknames");
    if (data.success) {
      bankList.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching banklists:", error);
  }
};

const handleSubmit = () => {
  isButtonLoading.value = true;
  emit("submit", { ...formData.value });
  emit("update:show", false);
  formData.value = {
    name: props.fullname,
    bankname: "",
    banknumber: "",
    bankcode: "",
  };
  isButtonLoading.value = false;
};

onMounted(async () => {
  await fetchBankList();
  isPageLoading.value = false;
});
</script>

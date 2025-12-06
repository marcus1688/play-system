<template>
  <div>
    <PageLoading v-if="isPageLoading" />

    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ isEditMode ? $t("edit") : $t("create") }}
          {{ $t("payment_gateway") }}
        </h1>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-6 max-md:p-4">
        <form @submit.prevent="handleSubmit" class="space-y-6 max-md:space-y-4">
          <div>
            <div
              class="flex justify-between items-center mb-2 max-md:flex-col max-md:items-start max-md:gap-2"
            >
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                >{{ $t("gateway_name") }}</label
              >
              <div class="flex items-center gap-4 max-md:gap-2">
                <div class="flex items-center gap-4 max-md:gap-2">
                  <BaseToggleSwitch v-model="formData.autowithdraw" />
                  <span class="text-sm text-gray-700 max-md:text-xs">{{
                    $t("auto_withdraw")
                  }}</span>
                </div>
                <BaseToggleSwitch v-model="formData.status" />
                <span class="text-sm text-gray-700 max-md:text-xs">{{
                  $t("active_status")
                }}</span>
              </div>
            </div>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
              >{{ $t("display_order") }}</label
            >
            <input
              v-model.number="formData.order"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
              >{{ $t("payment_api") }}</label
            >
            <input
              v-model="formData.paymentAPI"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
              >{{ $t("withdraw_api") }}</label
            >
            <input
              v-model="formData.withdrawAPI"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
              >{{ $t("report_api") }}</label
            >
            <input
              v-model="formData.reportAPI"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-md:gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                >{{ $t("minimum_deposit") }}</label
              >
              <input
                v-model="formData.minDeposit"
                type="number"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                >{{ $t("maximum_deposit") }}</label
              >
              <input
                v-model="formData.maxDeposit"
                type="number"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                >{{ $t("minimum_withdraw") }}</label
              >
              <input
                v-model="formData.minWithdraw"
                type="number"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
                >{{ $t("maximum_withdraw") }}</label
              >
              <input
                v-model="formData.maxWithdraw"
                type="number"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
              >{{ $t("remark") }}</label
            >
            <textarea
              v-model="formData.remark"
              rows="3"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            ></textarea>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1"
              >{{ $t("gateway_logo") }}</label
            >
            <div
              class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
            >
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                class="flex-1 max-md:w-full max-md:text-sm"
              />
              <img
                v-if="logoPreview || gatewayData?.logo"
                :src="logoPreview || gatewayData?.logo"
                class="w-32 h-auto max-md:w-24"
                alt="Logo preview"
              />
            </div>
          </div>

          <!-- ✅ Available Bank Codes Section -->
          <div>
            <div
              class="flex items-center justify-between mb-4 max-md:mb-3 max-md:flex-col max-md:items-stretch max-md:gap-2"
            >
              <label
                class="block text-sm font-medium text-gray-700 max-md:text-xs"
                >{{ $t("available_bank_codes") }}</label
              >
              <button
                type="button"
                @click="addBankCode"
                class="px-3 py-2 bg-blue-600 text-white rounded-lg lg:hover:bg-blue-500 text-sm max-md:px-2 max-md:py-1.5 max-md:text-xs max-md:w-full"
              >
                {{ $t("add_bank_code") }}
              </button>
            </div>

            <div
              v-if="formData.availableBankCodes.length === 0"
              class="text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg max-md:py-3 max-md:text-sm"
            >
              {{ $t("no_bank_codes_added") }}
            </div>

            <div
              v-else
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-md:gap-3"
            >
              <div
                v-for="(bankCode, index) in formData.availableBankCodes"
                :key="index"
                class="border rounded-lg p-4 bg-gray-50 max-md:p-3"
              >
                <div class="flex items-center justify-between mb-3 max-md:mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-700 max-md:text-xs">{{
                      $t("active")
                    }}</span>
                    <BaseToggleSwitch v-model="bankCode.active" />
                  </div>
                  <button
                    type="button"
                    @click="removeBankCode(index)"
                    class="px-2 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:text-xs"
                  >
                    {{ $t("remove") }}
                  </button>
                </div>

                <div class="space-y-3 max-md:space-y-2">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("bank_name") }}
                    </label>
                    <input
                      v-model="bankCode.bankname"
                      type="text"
                      required
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("bank_code") }}
                    </label>
                    <input
                      v-model="bankCode.bankcode"
                      type="text"
                      required
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Banks Section -->
          <div>
            <div
              class="flex items-center justify-between mb-4 max-md:mb-3 max-md:flex-col max-md:items-stretch max-md:gap-2"
            >
              <label
                class="block text-sm font-medium text-gray-700 max-md:text-xs"
                >{{ $t("banks") }}</label
              >
              <button
                type="button"
                @click="addBank"
                class="px-3 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 text-sm max-md:px-2 max-md:py-1.5 max-md:text-xs max-md:w-full"
              >
                {{ $t("add_bank") }}
              </button>
            </div>

            <div
              v-if="formData.banks.length === 0"
              class="text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg max-md:py-3 max-md:text-sm"
            >
              {{ $t("no_banks_added") }}
            </div>

            <div
              v-else
              class="grid grid-cols-4 gap-4 max-2xl:grid-cols-3 max-xl:grid-cols-2 max-md:grid-cols-1 max-md:gap-3"
            >
              <div
                v-for="(bank, index) in formData.banks"
                :key="index"
                class="border rounded-lg p-4 bg-gray-50 max-md:p-3"
              >
                <div
                  class="flex items-center justify-between mb-3 max-md:mb-2 max-md:flex-col max-md:items-stretch max-md:gap-2"
                >
                  <h4 class="font-medium text-gray-800 hidden">
                    {{ $t("bank") }} {{ index + 1 }}
                  </h4>
                  <div class="flex items-center gap-2 max-md:justify-between">
                    <span class="text-sm text-gray-700 max-md:text-xs">{{
                      $t("bank_active")
                    }}</span>
                    <BaseToggleSwitch v-model="bank.active" />
                  </div>
                  <div class="max-md:w-full">
                    <button
                      type="button"
                      @click="removeBank(index)"
                      class="px-2 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:text-xs max-md:w-full"
                    >
                      {{ $t("remove") }}
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-3">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("bank_name") }}
                    </label>
                    <input
                      v-model="bank.bankname"
                      type="text"
                      required
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("bank_code") }}
                    </label>
                    <input
                      v-model="bank.bankcode"
                      type="text"
                      required
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                    />
                  </div>
                </div>

                <div
                  class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-md:gap-3 max-md:mt-3"
                >
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("bank_min_limit") }}
                    </label>
                    <input
                      v-model="bank.minlimit"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >
                      {{ $t("bank_max_limit") }}
                    </label>
                    <input
                      v-model="bank.maxlimit"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                    />
                  </div>
                </div>

                <div class="mt-4 max-md:mt-3">
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                  >
                    {{ $t("bank_image") }}
                  </label>
                  <div class="flex flex-col gap-4 max-md:gap-2">
                    <img
                      v-if="bank.imagePreview || bank.bankimage"
                      :src="bank.imagePreview || bank.bankimage"
                      class="w-16 h-16 object-cover rounded max-md:w-12 max-md:h-12"
                      alt="Bank image preview"
                    />
                    <input
                      type="file"
                      @change="(event) => handleBankImageChange(event, index)"
                      accept="image/*"
                      class="flex-1 max-md:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div
        class="p-6 border-t bg-gray-50 flex justify-end gap-2 max-md:p-4 max-md:flex-col max-md:gap-2"
      >
        <button
          type="button"
          @click="goBack"
          class="px-4 py-2 border border-gray-300 rounded-lg lg:hover:bg-gray-50 transition-colors max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:order-2"
        >
          {{ $t("cancel") }}
        </button>
        <div class="flex gap-3 max-md:gap-2 max-md:order-1">
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 transition-colors max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ isEditMode ? $t("save_changes") : $t("create") }}
          </LoadingButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const { publicGet, publicPost, publicPut } = useApiEndpoint();

const isPageLoading = ref(true);
const isLoading = ref(false);
const gatewayData = ref(null);
const logoPreview = ref(null);
const logoFile = ref(null);
const bankFiles = ref([]);
const isEditMode = computed(() => !!route.params.id);

const formData = ref({
  name: "",
  paymentAPI: "",
  withdrawAPI: "",
  reportAPI: "",
  minDeposit: 0,
  maxDeposit: 0,
  minWithdraw: 0,
  maxWithdraw: 0,
  remark: "",
  status: true,
  order: 0,
  banks: [],
  availableBankCodes: [],
  autowithdraw: false,
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

const handleBankImageChange = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    while (bankFiles.value.length <= index) {
      bankFiles.value.push(null);
    }
    bankFiles.value[index] = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.value.banks[index].imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const addBankCode = () => {
  formData.value.availableBankCodes.push({
    bankname: "",
    bankcode: "",
    active: true,
  });
};

const removeBankCode = (index) => {
  formData.value.availableBankCodes.splice(index, 1);
};

const addBank = () => {
  formData.value.banks.push({
    bankname: "",
    bankcode: "",
    bankimage: "",
    minlimit: 0,
    maxlimit: 0,
    imagePreview: null,
    active: true,
  });
};

const removeBank = (index) => {
  formData.value.banks.splice(index, 1);
  bankFiles.value.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const form = new FormData();
    if (logoFile.value) {
      form.append("logo", logoFile.value);
    }
    Object.keys(formData.value).forEach((key) => {
      if (key !== "banks" && key !== "availableBankCodes") {
        form.append(key, formData.value[key]);
      }
    });

    const banksData = formData.value.banks.map((bank) => ({
      bankname: bank.bankname,
      bankcode: bank.bankcode,
      bankimage: bank.bankimage,
      minlimit: Number(bank.minlimit) || 0,
      maxlimit: Number(bank.maxlimit) || 0,
      active: bank.active,
    }));
    form.append("banks", JSON.stringify(banksData));

    const bankCodesData = formData.value.availableBankCodes.map((code) => ({
      bankname: code.bankname,
      bankcode: code.bankcode,
      active: code.active,
    }));
    form.append("availableBankCodes", JSON.stringify(bankCodesData));

    formData.value.banks.forEach((bank, index) => {
      if (bankFiles.value[index]) {
        form.append(`bankImage_${index}`, bankFiles.value[index]);
      }
    });

    const { data } = isEditMode.value
      ? await publicPut(`payment-gateways/${route.params.id}`, form)
      : await publicPost("payment-gateways", form);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      router.push(localePath("/paymentgateway/list"));
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

const loadFormData = (data) => {
  formData.value = {
    name: data.name || "",
    paymentAPI: data.paymentAPI || "",
    withdrawAPI: data.withdrawAPI || "",
    reportAPI: data.reportAPI || "",
    minDeposit: Number(data.minDeposit) || 0,
    maxDeposit: Number(data.maxDeposit) || 0,
    minWithdraw: Number(data.minWithdraw) || 0,
    maxWithdraw: Number(data.maxWithdraw) || 0,
    autowithdraw: data.autowithdraw ?? false,
    remark: data.remark || "",
    status: data.status ?? true,
    order: Number(data.order) || 0,
    banks: data.banks
      ? data.banks.map((bank) => ({
          bankname: bank.bankname || "",
          bankcode: bank.bankcode || "",
          bankimage: bank.bankimage || "",
          minlimit: Number(bank.minlimit) || 0,
          maxlimit: Number(bank.maxlimit) || 0,
          imagePreview: null,
          active: bank.active ?? true,
        }))
      : [],
    availableBankCodes: data.availableBankCodes
      ? data.availableBankCodes.map((code) => ({
          bankname: code.bankname || "",
          bankcode: code.bankcode || "",
          active: code.active ?? true,
        }))
      : [],
  };
  bankFiles.value = new Array(formData.value.banks.length).fill(null);
};

const fetchGatewayData = async () => {
  if (!isEditMode.value) return;
  try {
    const { data } = await publicGet(`payment-gateways/${route.params.id}`);
    if (data.success) {
      gatewayData.value = data.data;
      loadFormData(data.data);
    }
  } catch (error) {
    console.error("Error fetching gateway data:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("failed_to_load_data"),
    });
    router.push(localePath("/paymentgateway/list"));
  }
};

const goBack = () => {
  router.push(localePath("/paymentgateway/list"));
};

onMounted(async () => {
  await fetchGatewayData();
  isPageLoading.value = false;
});

useHead({
  title: computed(
    () =>
      `Play System | ${isEditMode.value ? "Edit" : "Create"} Payment Gateway`
  ),
});
</script>

<style scoped></style>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-2"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white overflow-y-auto max-h-[85vh] rounded-lg p-6 max-w-md w-full mx-4 max-md:p-4 max-md:mx-2 max-md:max-h-[90vh]"
      >
        <div class="flex justify-between items-center mb-6 max-md:mb-4">
          <h3 class="text-lg font-semibold text-gray-800 max-md:text-base">
            {{ $t("change_status") }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 lg:hover:text-gray-600 transition-colors"
          >
            <Icon
              icon="material-symbols:close"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </button>
        </div>

        <div class="space-y-6 max-md:space-y-4">
          <!-- Report Info -->
          <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
            <h4
              class="font-medium text-gray-700 mb-2 max-md:text-sm max-md:mb-1.5"
            >
              {{ $t("report_information") }}
            </h4>
            <div class="text-sm space-y-1 max-md:text-xs max-md:space-y-0.5">
              <p>
                <span class="text-gray-600">{{ $t("agent") }}:</span>
                {{ reportData.username }}
              </p>
              <p>
                <span class="text-gray-600">{{ $t("net_amount") }}:</span>
                {{ currency }} {{ formatAmount(reportData.totalNetAmount) }}
              </p>
              <p>
                <span class="text-gray-600">{{ $t("commission") }}:</span>
                {{ currency }} {{ formatAmount(reportData.amount) }}
              </p>

              <p>
                <span class="text-gray-600">{{ $t("report_date") }}:</span>
                {{ formatDate(reportData.createdAt) }}
              </p>
              <p>
                <span class="text-gray-600">{{ $t("approved_by") }}:</span>
                {{ reportData.releaseBy || "N/A" }}
              </p>
              <p>
                <span class="text-gray-600">{{ $t("approved_date") }}:</span>
                {{ formatDate(reportData.releaseDate) }}
              </p>
            </div>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg max-md:p-3">
            <h4
              class="font-medium text-gray-700 mb-3 flex items-center gap-2 max-md:text-sm max-md:mb-2"
            >
              <Icon
                icon="material-symbols:account-balance"
                class="w-5 h-5 text-blue-600 max-md:w-4 max-md:h-4"
              />
              {{ $t("bank_information") }}
            </h4>

            <!-- Commission Amount Display -->
            <div
              class="mb-4 p-3 bg-white rounded-md border border-blue-200 max-md:mb-3 max-md:p-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 max-md:text-xs"
                  >{{ $t("commission_to_pay") }}:</span
                >
                <span
                  class="text-lg font-semibold text-green-600 max-md:text-base"
                >
                  {{ currency }} {{ formatAmount(reportData.amount) }}
                </span>
              </div>
            </div>

            <!-- Bank Accounts List -->
            <div
              v-if="
                reportData.bankAccounts && reportData.bankAccounts.length > 0
              "
              class="space-y-3 max-md:space-y-2"
            >
              <div
                v-for="(account, index) in reportData.bankAccounts"
                :key="account._id || index"
                class="bg-white p-3 rounded-md border border-blue-200 max-md:p-2"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2 max-md:mb-1.5">
                      <Icon
                        icon="material-symbols:credit-card"
                        class="w-4 h-4 text-blue-600 max-md:w-3 max-md:h-3"
                      />
                      <span
                        class="text-sm font-medium text-gray-700 max-md:text-xs"
                      >
                        {{ $t("account") }} {{ index + 1 }}
                      </span>
                    </div>

                    <div
                      class="space-y-1 text-sm max-md:text-xs max-md:space-y-0.5"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="text-gray-600 min-w-[80px] max-md:min-w-[60px]"
                          >{{ $t("name") }}:</span
                        >
                        <span class="font-medium text-gray-800">{{
                          account.name
                        }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span
                          class="text-gray-600 min-w-[80px] max-md:min-w-[60px]"
                          >{{ $t("bank") }}:</span
                        >
                        <span class="text-gray-800">{{
                          account.bankname
                        }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span
                          class="text-gray-600 min-w-[80px] max-md:min-w-[60px]"
                          >{{ $t("account_number") }}:</span
                        >
                        <span class="text-gray-800">{{
                          account.banknumber
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Bank Accounts -->
            <div v-else class="text-center py-4 max-md:py-3">
              <Icon
                icon="material-symbols:account-balance-wallet"
                class="w-12 h-12 text-gray-400 mx-auto mb-2 max-md:w-10 max-md:h-10 max-md:mb-1.5"
              />
              <p class="text-sm text-gray-500 max-md:text-xs">
                {{ $t("no_bank_accounts_found") }}
              </p>
              <p
                class="text-xs text-gray-400 mt-1 max-md:text-[10px] max-md:mt-0.5"
              >
                {{ $t("agent_needs_to_add_bank_account") }}
              </p>
            </div>
          </div>

          <!-- Current Status -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("current_status") }}:
            </label>
            <span
              :class="getStatusBadgeClass(currentStatus)"
              class="inline-block px-3 py-1 rounded-full text-sm font-medium max-md:px-2 max-md:py-2 max-md:text-xs"
            >
              {{ getStatusText(currentStatus) }}
            </span>
          </div>

          <!-- New Status -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("new_status") }}:
            </label>
            <select
              v-model="localNewStatus"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors max-md:px-2 max-md:py-1.5 max-md:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
              <option value="cancelled">Cancel</option>
            </select>
          </div>

          <!-- Status Preview -->
          <div v-if="localNewStatus !== currentStatus">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("preview") }}:
            </label>
            <div class="flex items-center gap-2">
              <span
                :class="getStatusBadgeClass(currentStatus)"
                class="px-2 py-1 rounded-full text-xs font-medium max-md:px-1.5 max-md:py-2 max-md:text-[10px]"
              >
                {{ getStatusText(currentStatus) }}
              </span>
              <Icon
                icon="material-symbols:arrow-forward"
                class="w-4 h-4 text-gray-400 max-md:w-3 max-md:h-3"
              />
              <span
                :class="getStatusBadgeClass(localNewStatus)"
                class="px-2 py-1 rounded-full text-xs font-medium max-md:px-1.5 max-md:py-2 max-md:text-[10px]"
              >
                {{ getStatusText(localNewStatus) }}
              </span>
            </div>
          </div>

          <!-- Remark -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("remark") }}
              <span class="text-gray-400">({{ $t("optional") }})</span>:
            </label>

            <!-- Important Note -->
            <div
              class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3 max-md:p-2 max-md:mb-2"
            >
              <div class="flex items-start gap-2">
                <Icon
                  icon="material-symbols:info"
                  class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0 max-md:w-3 max-md:h-3"
                />
                <p class="text-sm text-blue-800 max-md:text-xs">
                  {{ $t("remark_will_be_visible_to_affiliate") }}
                </p>
              </div>
            </div>

            <textarea
              v-model="localRemark"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none max-md:px-2 max-md:py-1.5 max-md:text-sm"
              rows="3"
              :placeholder="$t('remark_placeholder_affiliate')"
            ></textarea>
          </div>

          <div v-if="localNewStatus === 'approved'">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("receipt_upload") }}
              <span class="text-red-500">*</span>:
            </label>

            <!-- Important Note for Receipt -->
            <div
              class="bg-green-50 border border-green-200 rounded-md p-3 mb-3 max-md:p-2 max-md:mb-2"
            >
              <div class="flex items-start gap-2">
                <Icon
                  icon="material-symbols:receipt"
                  class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0 max-md:w-3 max-md:h-3"
                />
                <p class="text-sm text-green-800 max-md:text-xs">
                  {{ $t("receipt_required_for_approval") }}
                </p>
              </div>
            </div>

            <!-- File Upload Area -->
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 lg:hover:border-indigo-400 transition-colors max-md:p-3"
            >
              <input
                ref="receiptFileInput"
                type="file"
                accept="image/*,.pdf"
                @change="handleFileSelect"
                class="hidden"
              />

              <!-- Upload Area -->
              <div
                v-if="!selectedFile && !receiptPreview"
                @click="triggerFileUpload()"
                class="text-center cursor-pointer"
              >
                <Icon
                  icon="material-symbols:cloud-upload"
                  class="w-12 h-12 text-gray-400 mx-auto mb-2 max-md:w-10 max-md:h-10 max-md:mb-1.5"
                />
                <p class="text-sm text-gray-600 mb-1 max-md:text-xs">
                  {{ $t("click_to_upload_receipt") }}
                </p>
                <p class="text-xs text-gray-500 max-md:text-[10px]">
                  {{ $t("supports_image_pdf") }}
                </p>
              </div>

              <!-- File Preview -->
              <div v-else class="space-y-3 max-md:space-y-2">
                <!-- Image Preview -->
                <div v-if="receiptPreview && isImageFile" class="text-center">
                  <img
                    :src="receiptPreview"
                    alt="Receipt preview"
                    class="max-w-full max-h-32 mx-auto rounded border max-md:max-h-24"
                  />
                </div>

                <!-- File Info -->
                <div
                  class="flex items-center justify-between bg-gray-50 p-3 rounded max-md:p-2"
                >
                  <div class="flex items-center gap-2">
                    <Icon
                      :icon="
                        isImageFile
                          ? 'material-symbols:image'
                          : 'material-symbols:picture-as-pdf'
                      "
                      class="w-5 h-5 text-gray-600 max-md:w-4 max-md:h-4"
                    />
                    <div>
                      <p
                        class="text-sm font-medium text-gray-700 max-md:text-xs"
                      >
                        {{ selectedFile?.name }}
                      </p>
                      <p class="text-xs text-gray-500 max-md:text-[10px]">
                        {{ formatFileSize(selectedFile?.size) }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="clearFile"
                    class="text-red-500 lg:hover:text-red-700 transition-colors"
                  >
                    <Icon
                      icon="material-symbols:delete"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                  </button>
                </div>

                <!-- Change File Button -->
                <button
                  @click="triggerFileUpload()"
                  class="w-full text-sm text-indigo-600 lg:hover:text-indigo-800 transition-colors max-md:text-xs"
                >
                  {{ $t("change_file") }}
                </button>
              </div>
            </div>
          </div>

          <!-- Warning for certain status changes -->
          <div
            v-if="showWarning"
            class="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-3 max-md:px-2 max-md:py-2"
          >
            <div class="flex items-start gap-2">
              <Icon
                icon="material-symbols:warning"
                class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0 max-md:w-4 max-md:h-4"
              />
              <div class="text-sm text-yellow-800 max-md:text-xs">
                <p class="font-medium">{{ $t("warning") }}</p>
                <p>{{ getWarningMessage() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="flex justify-end gap-3 pt-6 mt-6 border-t max-md:pt-4 max-md:mt-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md lg:hover:bg-gray-400 transition-colors max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <button
            @click="handleUpdate"
            :disabled="!canUpdate || loading"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md lg:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            <Icon
              v-if="loading"
              icon="material-symbols:progress-activity"
              class="w-4 h-4 animate-spin max-md:w-3 max-md:h-3"
            />
            <div v-else>
              {{ $t("update_status") }}
            </div>
          </button>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";
const currency = useCurrency();

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  reportData: {
    type: Object,
    default: () => ({}),
  },
  currentStatus: {
    type: String,
    default: "",
  },
  newStatus: {
    type: String,
    default: "",
  },
  remark: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  receiptFile: {
    type: String,
    default: "",
  },
});

const receiptFileInput = ref(null);

const emit = defineEmits(["close", "update"]);

const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  closeModal();
});

// Local reactive variables
const localNewStatus = ref(props.newStatus || props.currentStatus);
const localRemark = ref(props.remark);

// Watch for prop changes
watch(
  () => props.newStatus,
  (newVal) => {
    localNewStatus.value = newVal || props.currentStatus;
  }
);

watch(
  () => props.remark,
  (newVal) => {
    localRemark.value = newVal;
  }
);

const showWarning = computed(() => {
  return (
    localNewStatus.value === "rejected" ||
    localNewStatus.value === "cancelled" ||
    (props.currentStatus === "approved" && localNewStatus.value !== "approved")
  );
});

const selectedFile = ref(null);
const receiptPreview = ref(null);
const existingReceiptUrl = ref("");

const isImageFile = computed(() => {
  if (selectedFile.value) {
    return selectedFile.value.type.startsWith("image/");
  }
  if (existingReceiptUrl.value) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    return imageExtensions.some((ext) =>
      existingReceiptUrl.value.toLowerCase().includes(ext)
    );
  }
  return false;
});

const canUpdate = computed(() => {
  const statusChanged = localNewStatus.value !== props.currentStatus;
  const remarkChanged = localRemark.value.trim() !== (props.remark || "");
  const receiptChanged =
    !!selectedFile.value || (!existingReceiptUrl.value && !!props.receiptFile);

  const hasAnyChanges = statusChanged || remarkChanged || receiptChanged;

  if (localNewStatus.value === "approved") {
    const hasReceipt = existingReceiptUrl.value || selectedFile.value;
    return hasAnyChanges && hasReceipt;
  }

  return hasAnyChanges;
});

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert($t("file_size_too_large"));
    // Clear the input to allow selecting another file
    event.target.value = "";
    return;
  }

  selectedFile.value = file;

  // Create preview for images
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      receiptPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    receiptPreview.value = null;
  }
};

const clearFile = () => {
  selectedFile.value = null;

  if (existingReceiptUrl.value) {
    receiptPreview.value = existingReceiptUrl.value;
  } else {
    receiptPreview.value = null;
  }

  // Clear the file input
  if (receiptFileInput.value) {
    receiptFileInput.value.value = "";
  }
};
const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Methods
const getStatusBadgeClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const getStatusText = (status) => {
  const texts = {
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
    cancelled: "CANCELLED",
  };
  return texts[status] || status?.toUpperCase();
};

const getWarningMessage = () => {
  if (localNewStatus.value === "rejected") {
    return $t("warning_reject_report");
  }
  if (localNewStatus.value === "cancelled") {
    return $t("warning_cancel_report");
  }
  if (
    props.currentStatus === "approved" &&
    localNewStatus.value !== "approved"
  ) {
    return $t("warning_change_approved_status");
  }
  return "";
};

const handleUpdate = () => {
  if (!canUpdate.value) return;

  emit("update", {
    reportId: props.reportData._id,
    newStatus: localNewStatus.value,
    remark: localRemark.value.trim(),
    receiptFile: selectedFile.value, // Add this line
  });
};

const triggerFileUpload = () => {
  if (receiptFileInput.value) {
    receiptFileInput.value.value = "";
    receiptFileInput.value.click();
  }
};

watch(
  () => props.receiptFile,
  (newVal) => {
    if (newVal) {
      existingReceiptUrl.value = newVal;
      receiptPreview.value = newVal; // Show existing image as preview
      selectedFile.value = null; // No new file selected
    } else {
      existingReceiptUrl.value = "";
      receiptPreview.value = null;
      selectedFile.value = null;
    }
  },
  { immediate: true }
);

const closeModal = () => {
  selectedFile.value = null;
  receiptPreview.value = null;
  existingReceiptUrl.value = "";

  if (receiptFileInput.value) {
    receiptFileInput.value.value = "";
  }

  emit("close");
};
</script>

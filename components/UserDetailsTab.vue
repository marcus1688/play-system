<template>
  <div
    class="flex flex-col gap-4 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:gap-3"
  >
    <!-- Basic Information Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:gap-2 max-md:flex-wrap">
          <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
          <h3 class="text-lg font-semibold max-md:text-base">
            {{ $t("basic_information") }}
          </h3>
          <div>
            <div v-if="!isEditing">
              <button
                @click="startEditing"
                class="px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              >
                {{ $t("edit") }}
              </button>
            </div>
            <div v-else>
              <div class="flex gap-2">
                <button
                  @click="cancelEditing"
                  class="px-4 py-2 bg-gray-500 text-white rounded lg:hover:bg-gray-400 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                >
                  {{ $t("cancel") }}
                </button>
                <LoadingButton
                  :loading="isButtonLoading"
                  @click="updateUser"
                  class="px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                >
                  {{ $t("save") }}
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="p-6 grid grid-cols-3 gap-6 text-left max-md:p-3 max-md:grid-cols-2 max-md:gap-3"
      >
        <!-- User ID -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("user_id") }}</label
          >
          <div class="text-sm font-semibold text-indigo-600 max-md:text-xs">
            {{ user.userid || "-" }}
          </div>
        </div>
        <!-- Username -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("username") }}</label
          >
          <div class="text-sm max-md:text-xs">{{ user.username || "-" }}</div>
        </div>

        <!-- Full Name -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("full_name") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ user.fullname }}
          </div>
          <input
            v-else
            v-model="editedUser.fullname"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- Email with Reset Button -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("email") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ user.email || "-" }}
          </div>
          <input
            v-else
            v-model="editedUser.email"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- Phone Numbers -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("phone_number") }}</label
          >

          <div v-if="!isEditing">
            <div
              v-for="(phone, index) in user.phoneNumbers"
              :key="index"
              class="text-sm max-md:text-xs"
              :class="{ 'text-indigo-600 font-semibold': index === 0 }"
            >
              {{ formatPhoneNumber(phone) }}
              <span v-if="index === 0" class="text-xs text-gray-400"
                >({{ $t("primary") }})</span
              >
            </div>
            <div
              v-if="!user.phoneNumbers?.length"
              class="text-sm max-md:text-xs"
            >
              -
            </div>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(phone, index) in editedUser.phoneNumbers"
              :key="index"
              class="flex items-center gap-2"
            >
              <input
                v-model="editedUser.phoneNumbers[index]"
                type="text"
                class="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
              />
              <button
                v-if="editedUser.phoneNumbers.length > 1"
                type="button"
                @click="removePhoneNumber(index)"
                class="p-1 text-red-500 lg:hover:bg-red-50 rounded"
              >
                <Icon icon="mdi:close" class="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              @click="addPhoneNumber"
              class="flex items-center gap-1 text-sm text-indigo-600 lg:hover:text-indigo-700"
            >
              <Icon icon="mdi:plus" class="w-4 h-4" />
              {{ $t("add_phone_number") }}
            </button>
          </div>
        </div>

        <!-- Date of Birth -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("date_of_birth") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ user.dob || "-" }}
          </div>
          <input
            v-else
            v-model="editedUser.dob"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- VIP Level -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("vip_level") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ user.viplevel || "-" }}
          </div>
          <CustomSelect v-else v-model="editedUser.viplevel">
            <option
              v-for="level in vipLevels"
              :key="level._id"
              :value="level.name"
            >
              {{ level.name }}
            </option>
          </CustomSelect>
        </div>

        <!-- This Month VIP -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("this_month_vip") }}</label
          >
          <div class="text-sm max-md:text-xs">
            {{ user.thisMonthVip || "-" }}
          </div>
        </div>

        <!-- Total Turnover -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("total_turnover") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ currency }} {{ user.totalturnover }}
          </div>
          <input
            v-else
            v-model="editedUser.totalturnover"
            type="number"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- Duplicate Bank Account -->
        <div v-if="user.duplicateBank">
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("duplicate_bank") }}</label
          >
          <BaseToggleSwitch
            :model-value="props.user.duplicateBank"
            @update:model-value="toggleDuplicateBank"
          />
        </div>

        <!-- Fingerprint ID -->
        <div v-if="user.registerVisitorId">
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("fingerprint_id") }}</label
          >
          <NuxtLinkLocale
            :to="`/tools/fingerprint?search=${user.registerVisitorId}`"
            class="text-sm cursor-pointer text-indigo-600 lg:hover:text-indigo-500 underline max-md:text-xs max-md:break-all"
          >
            {{ user.registerVisitorId || "-" }}
          </NuxtLinkLocale>
        </div>

        <!-- Game ID -->
        <div v-if="user.gameId">
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("gameid") }}</label
          >
          <div class="text-sm max-md:text-xs">{{ user.gameId }}</div>
        </div>

        <!-- User Register Date -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("register_date") }}</label
          >
          <div class="text-sm uppercase max-md:text-xs">
            {{ formatDate(user.createdAt) }}
          </div>
        </div>

        <!-- 918kaya Transfer Game ID -->
        <div v-if="user.kaya918ID">
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("kaya_transfer_id") }}</label
          >
          <div class="text-sm max-md:text-xs">{{ user.kaya918ID }}</div>
        </div>

        <!-- 918kaya Seamless Game ID -->
        <div v-if="user.kaya918SeamlessID">
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("kaya_seamless_id") }}</label
          >
          <div class="text-sm max-md:text-xs">{{ user.kaya918SeamlessID }}</div>
        </div>
      </div>
    </div>

    <!-- Additional Information Section -->
    <div class="bg-white rounded-lg shadow text-left">
      <div class="p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:gap-2">
          <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
          <h3 class="text-lg font-semibold max-md:text-base">
            {{ $t("additional_information") }}
          </h3>
        </div>
      </div>

      <div class="p-6 space-y-4 max-md:p-3 max-md:space-y-3">
        <!-- Remark -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("remark") }}</label
          >
          <textarea
            v-model="tempRemark"
            rows="3"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
          ></textarea>
        </div>
        <div class="flex justify-end">
          <button
            @click="updateRemark"
            class="px-3 py-1 h-fit bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs"
          >
            {{ $t("update") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Update Password Modal -->
    <UpdatePasswordModal
      v-if="showUpdatePasswordModal"
      v-model:show="showUpdatePasswordModal"
      :user-id="user._id"
      @updated="$emit('update')"
    />

    <!-- Lucky Spin Modal -->
    <LuckySpinSetting
      v-if="showLuckySpinModal"
      v-model:show="showLuckySpinModal"
      :user-id="props.user._id"
      @updated="$emit('update')"
    />

    <!-- Duplicate IP Modal -->
    <DuplicateIPModal v-model:show="showDuplicateIPModal" :ip="selectedIP" />
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits([
  "update",
  "reset-email",
  "update-password",
  "manage-lucky-spin",
]);
const { getCompanyId } = useCompany();
const currency = useCurrency();
const vipLevels = ref([]);
const isButtonLoading = ref(false);
const showDuplicateIPModal = ref(false);
const selectedIP = ref("");
const handleIPClick = (ip) => {
  selectedIP.value = ip;
  showDuplicateIPModal.value = true;
};
const adminUserData = useState("adminUserData");
const tempRemark = ref(props.user.remark);
const showUpdatePasswordModal = ref(false);
const isEditing = ref(false);
const magicLinkLoading = ref(false);
const editedUser = ref({});
const startEditing = () => {
  isEditing.value = true;
  const hasPhonePermission =
    adminUserData.value?.role === "superadmin" ||
    adminUserData.value?.permissions?.some(
      (p) => p.module === "user" && p.actions.includes("phonenumber")
    );
  editedUser.value = {
    ...props.user,
    phoneNumbers: props.user.phoneNumbers?.length
      ? [...props.user.phoneNumbers]
      : [props.user.phonenumber || ""],
    referralByUsername: props.user.referralBy
      ? props.user.referralBy.username
      : "",
  };
};
const cancelEditing = () => {
  isEditing.value = false;
  editedUser.value = {};
};

const addPhoneNumber = () => {
  if (!editedUser.value.phoneNumbers) {
    editedUser.value.phoneNumbers = [];
  }
  editedUser.value.phoneNumbers.push("");
};

const removePhoneNumber = (index) => {
  editedUser.value.phoneNumbers.splice(index, 1);
};

const updateUser = async () => {
  isButtonLoading.value = true;
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(
      `user/${editedUser.value._id}`,
      editedUser.value
    );
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
      isEditing.value = false;
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value = false;
  }
};

const toggleStatus = async () => {
  try {
    const confirmMessage =
      props.user.status === true
        ? $t("deactivate_user_confirm")
        : $t("activate_user_confirm");
    const result = await Swal.fire({
      title: $t("status_change_confirm"),
      text: confirmMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });
    if (result.isConfirmed) {
      const { put } = useApiEndpoint();
      const { data } = await put(`user/${props.user._id}/toggle-status`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        emit("update");
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error toggling status:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const toggleWithdrawLock = async () => {
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(`user/${props.user._id}/toggle-withdraw-lock`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error toggling withdraw lock:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const toggleDuplicateIP = async () => {
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(`user/${props.user._id}/toggle-duplicate-ip`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error toggling withdraw lock:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const toggleDuplicateBank = async () => {
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(`user/${props.user._id}/toggle-duplicate-bank`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error toggling duplicate bank:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const updateRemark = async () => {
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(`user/${props.user._id}/remark`, {
      remark: tempRemark.value,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating remark:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const fetchVipLevels = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("vipsettings");
    if (data.success) {
      vipLevels.value = data.data.vipLevels;
    }
  } catch (error) {
    console.error("Error fetching VIP levels:", error);
  }
};

const showLuckySpinModal = ref(false);
const handleManageLuckySpin = () => {
  showLuckySpinModal.value = true;
};

const formatPhoneNumber = (number) => {
  if (!number) return "-";
  const hasPhonePermission =
    adminUserData.value?.role === "superadmin" ||
    adminUserData.value?.permissions?.some(
      (p) => p.module === "user" && p.actions.includes("phonenumber")
    );
  if (hasPhonePermission) {
    return number;
  } else {
    return number
      .toString()
      .replace(/^(.*)(\d{4})$/, (_, p1, p2) => "*".repeat(p1.length) + p2);
  }
};

const generateMagicLink = async () => {
  magicLinkLoading.value = true;
  try {
    const { post } = useApiEndpoint();
    const { data } = await post(`user/${props.user._id}/generate-magic-link`);

    if (data.success) {
      await navigator.clipboard.writeText(data.magicLink);
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        html: `
          <div class="text-left">
            <p class="mb-3">${
              data.message[$locale.value] || data.message.en
            }</p>
            <div class="bg-gray-100 p-3 rounded-lg">
              <p class="text-sm font-medium mb-2">${$t(
                "magic_link_generated"
              )}:</p>
              <div class="bg-white p-2 rounded border text-xs font-mono break-all">
                ${data.magicLink}
              </div>
            </div>
            <p class="text-sm text-green-600 mt-3">
              ✅ ${$t("link_copied_automatically")}
            </p>
          </div>
        `,
        confirmButtonText: $t("open_link"),
        showCancelButton: true,
        cancelButtonText: $t("close"),
        confirmButtonColor: "#10b981",
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(data.magicLink, "_blank", "noopener,noreferrer");
        }
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error generating magic link:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    magicLinkLoading.value = false;
  }
};

onMounted(() => {
  fetchVipLevels();
});
</script>

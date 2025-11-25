<template>
  <div>
    <div
      class="flex items-center justify-between px-4 py-2 bg-slate-100 shadow-md h-[70px] max-md:h-[60px] max-md:px-3"
    >
      <div class="flex items-center">
        <button
          @click="toggleMobileMenu"
          class="p-2 rounded-lg lg:hover:text-gray-400 text-gray-500 lg:hidden max-md:p-1.5"
        >
          <Bars3Icon class="w-6 h-auto max-md:w-5" />
        </button>
        <h1 class="text-xl font-semibold max-md:text-lg">
          <NuxtLinkLocale
            @click="
              () => {
                menuActiveBar = 'dashboard';
                openDropdowns = {};
              }
            "
            to="/"
          >
            <div
              v-if="
                companyLogo.includes('stash88') || companyLogo.includes('bm8my')
              "
              class="bg-gradient-to-br from-gray-800/90 to-gray-900/80 backdrop-blur-md rounded-xl py-1 px-6 border border-white/20 shadow-2xl max-sm:hidden max-md:px-4"
            >
              <NuxtImg
                :src="companyLogo"
                format="webp"
                quality="80"
                alt="Logo"
                class="w-32 h-auto max-w-[80px] lg:group-hover:brightness-110 transition-all duration-300 max-md:max-w-[60px]"
              />
            </div>

            <div v-else>
              <NuxtImg
                :src="companyLogo"
                format="webp"
                quality="80"
                alt="Logo"
                class="w-32 h-auto max-sm:hidden max-w-[80px] max-md:max-w-[60px]"
              />
            </div>
          </NuxtLinkLocale>
        </h1>
      </div>
      <div class="flex items-center gap-1 max-md:gap-0.5">
        <div>
          <p class="text-black text-sm font-bold max-md:hidden">
            {{ currentTime }}
          </p>
        </div>

        <!-- Change Language -->
        <div class="relative">
          <button
            @click="isLangDropdownOpen = !isLangDropdownOpen"
            class="flex items-center px-3 py-1.5 lg:hover:bg-gray-200 rounded-full transition-colors duration-200 max-md:px-2 max-md:py-1"
          >
            <img
              src="/images/header/earth.png"
              alt="Earth"
              class="w-6 h-auto max-md:w-5"
            />
            <span
              class="text-gray-600 text-sm font-semibold max-md:text-xs max-md:hidden"
              >{{ $t("language") }}</span
            >
          </button>

          <!-- Dropdown Menu -->
          <div>
            <div
              v-if="isLangDropdownOpen"
              @click.self="isLangDropdownOpen = false"
              class="fixed inset-0 z-40"
            />
            <div
              v-if="isLangDropdownOpen"
              class="absolute top-9 right-0 w-64 bg-white text-black rounded-lg shadow-lg z-50 max-sm:w-32 max-md:top-8"
            >
              <div class="p-4 max-md:p-3">
                <div class="flex justify-center gap-4 max-md:gap-2">
                  <div
                    @click.prevent="
                      !isCurrentLocale('en') && changeLocale('en')
                    "
                    class="transition text-sm cursor-pointer flex items-center gap-1 max-md:text-xs"
                    :class="{
                      'lg:hover:text-red-500': !isCurrentLocale('en'),
                      'text-gray-500 !cursor-not-allowed':
                        isCurrentLocale('en'),
                    }"
                  >
                    <img
                      src="/images/header/english.png"
                      alt="english"
                      class="w-6 h-auto max-md:w-5"
                    />
                    <p class="max-sm:hidden">{{ $t("english") }}</p>
                  </div>
                  <div class="border-l border-gray-600 w-1"></div>
                  <div
                    @click.prevent="
                      !isCurrentLocale('zh') && changeLocale('zh')
                    "
                    class="transition text-sm cursor-pointer flex items-center gap-1 max-md:text-xs"
                    :class="{
                      'lg:hover:text-red-500': !isCurrentLocale('zh'),
                      'text-gray-500 !cursor-not-allowed':
                        isCurrentLocale('zh'),
                    }"
                  >
                    <img
                      src="/images/header/chinese.png"
                      alt="english"
                      class="w-6 h-auto max-md:w-5"
                    />
                    <p class="max-sm:hidden">{{ $t("simplified_chinese") }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Balance Dropdown -->
        <div v-if="smsStatus || emailStatus || kioskStatus" class="relative">
          <button
            @click="isBalanceDropdownOpen = !isBalanceDropdownOpen"
            class="flex items-center px-3 py-1.5 lg:hover:bg-gray-200 rounded-full transition-colors duration-200 max-md:px-2 max-md:py-1"
          >
            <img
              src="/images/header/balance.png"
              alt="Earth"
              class="w-6 h-auto max-md:w-5"
            />
            <span
              class="text-gray-600 text-sm font-semibold ml-1 max-md:text-xs max-md:hidden"
              >{{ $t("balance") }}</span
            >
          </button>

          <!-- Dropdown Menu -->
          <div>
            <div
              v-if="isBalanceDropdownOpen"
              @click.self="isBalanceDropdownOpen = false"
              class="fixed inset-0 z-40"
            />
            <div
              v-if="isBalanceDropdownOpen"
              class="absolute top-9 right-0 w-64 bg-white rounded-lg shadow-lg z-50 divide-y divide-gray-100 max-md:w-56 max-md:top-8"
            >
              <div class="p-3 flex flex-col gap-2 max-md:p-2 max-md:gap-1.5">
                <div v-if="smsStatus">
                  <div
                    class="flex items-center justify-between mb-2 max-md:mb-1.5"
                  >
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <Icon
                        icon="mdi:message-text"
                        class="w-4 h-4 text-indigo-500 max-md:w-3.5 max-md:h-3.5"
                      />
                      <span class="text-sm text-gray-600 max-md:text-xs"
                        >{{ $t("sms_balance") }}:</span
                      >
                    </div>
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <span class="text-sm font-semibold max-md:text-xs"
                        >${{ smsBalance.toFixed(2) }}</span
                      >
                      <button
                        @click="refreshSMSBalance"
                        class="p-1 text-gray-600 lg:hover:text-indigo-600 transition-colors max-md:p-0.5"
                        title="Refresh Balance"
                      >
                        <Icon
                          icon="heroicons:arrow-path"
                          class="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
                        />
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <Icon
                        icon="mdi:signal"
                        class="w-4 h-4 text-gray-500 max-md:w-3.5 max-md:h-3.5"
                      />
                      <span class="text-sm text-gray-600 max-md:text-xs">
                        {{ $t("sms_status") }}:</span
                      >
                    </div>
                    <div class="flex items-center">
                      <div
                        :class="smsStatus ? 'bg-green-500' : 'bg-red-500'"
                        class="w-2 h-2 rounded-full mr-2 max-md:w-1.5 max-md:h-1.5 max-md:mr-1.5"
                      ></div>
                      <span class="text-sm max-md:text-xs">{{
                        smsStatus ? $t("active") : $t("inactive")
                      }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="emailStatus">
                  <div
                    class="flex items-center justify-between mb-2 max-md:mb-1.5"
                  >
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <Icon
                        icon="mdi:email"
                        class="w-4 h-4 text-blue-500 max-md:w-3.5 max-md:h-3.5"
                      />
                      <span class="text-sm text-gray-600 max-md:text-xs"
                        >{{ $t("email_balance") }}:</span
                      >
                    </div>
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <span class="text-sm font-semibold max-md:text-xs"
                        >${{ emailBalance }}</span
                      >
                      <button
                        @click="refreshEmailBalance"
                        class="p-1 text-gray-600 lg:hover:text-indigo-600 transition-colors max-md:p-0.5"
                        title="Refresh Balance"
                      >
                        <Icon
                          icon="heroicons:arrow-path"
                          class="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
                        />
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <Icon
                        icon="mdi:signal"
                        class="w-4 h-4 text-gray-500 max-md:w-3.5 max-md:h-3.5"
                      />
                      <span class="text-sm text-gray-600 max-md:text-xs"
                        >{{ $t("email_status") }}:</span
                      >
                    </div>
                    <div class="flex items-center">
                      <div
                        :class="emailStatus ? 'bg-green-500' : 'bg-red-500'"
                        class="w-2 h-2 rounded-full mr-2 max-md:w-1.5 max-md:h-1.5 max-md:mr-1.5"
                      ></div>
                      <span class="text-sm max-md:text-xs">{{
                        emailStatus ? $t("active") : $t("inactive")
                      }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="kioskStatus">
                  <div
                    class="flex items-center justify-between mb-2 max-md:mb-1.5"
                  >
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <Icon
                        icon="mdi:tablet-dashboard"
                        class="w-4 h-4 text-green-500 max-md:w-3.5 max-md:h-3.5"
                      />
                      <span class="text-sm text-gray-600 max-md:text-xs"
                        >{{ $t("kiosk_balance") }}:</span
                      >
                    </div>
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <span class="text-sm font-semibold max-md:text-xs"
                        >${{ kioskBalance }}</span
                      >
                      <button
                        @click="refreshKioskBalance"
                        class="p-1 text-gray-600 lg:hover:text-indigo-600 transition-colors max-md:p-0.5"
                        title="Refresh Balance"
                      >
                        <Icon
                          icon="heroicons:arrow-path"
                          class="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
                        />
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 max-md:gap-1.5">
                      <Icon
                        icon="mdi:signal"
                        class="w-4 h-4 text-gray-500 max-md:w-3.5 max-md:h-3.5"
                      />
                      <span class="text-sm text-gray-600 max-md:text-xs"
                        >{{ $t("kiosk_status") }}:</span
                      >
                    </div>
                    <div class="flex items-center">
                      <div
                        :class="kioskStatus ? 'bg-green-500' : 'bg-red-500'"
                        class="w-2 h-2 rounded-full mr-2 max-md:w-1.5 max-md:h-1.5 max-md:mr-1.5"
                      ></div>
                      <span class="text-sm max-md:text-xs">{{
                        kioskStatus ? $t("active") : $t("inactive")
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <button
          @click="handleLogout"
          class="flex items-center px-3 py-1.5 rounded-full transition-colors duration-200 text-red-600 lg:hover:bg-gray-200 max-md:px-2 max-md:py-1"
        >
          <img
            src="/images/header/logout.png"
            alt="Logout"
            class="w-6 h-auto max-md:w-5"
          />
          <span class="text-sm font-semibold max-md:text-xs max-md:hidden">{{
            $t("logout")
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { Bars3Icon } from "@heroicons/vue/24/solid";
import moment from "moment-timezone";

const adminUserData = useState("adminUserData");
const isBalanceDropdownOpen = ref(false);
const smsBalance = ref(0);
const smsStatus = ref(false);
const emailBalance = ref(0);
const emailStatus = ref(false);
const kioskBalance = ref(0);
const kioskStatus = ref(false);
const menuOpen = useState("menuOpen");
const toggleMobileMenu = () => {
  menuOpen.value = !menuOpen.value;
};
const openDropdowns = useState("openDropdowns");
const menuActiveBar = useState("menuActiveBar");
const { locale, setLocale, availableLocales, t } = useI18n();
const i18nCookie = useCookie("i18n_redirected", {
  maxAge: 365 * 24 * 60 * 60,
});
const isLangDropdownOpen = ref(false);
const changeLocale = async (lang) => {
  await setLocale(lang);
  i18nCookie.value = lang;
  isLangDropdownOpen.value = false;
};
const isCurrentLocale = (lang) => {
  return locale.value === lang;
};

const cleanupAudioAndTimers = () => {
  const pendingDeposits = useState("pendingDeposits");
  const pendingWithdraws = useState("pendingWithdraws");
  const pendingBonuses = useState("pendingBonuses");
  const countdown = useState("countdown");
  pendingDeposits.value = [];
  pendingWithdraws.value = [];
  pendingBonuses.value = [];
  if (process.client && window.cleanupAppAudio) {
    window.cleanupAppAudio();
  }
};

const handleLogout = async () => {
  try {
    const result = await Swal.fire({
      title: $t("logout_confirm"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("yes"),
      cancelButtonText: $t("cancel"),
    });
    if (!result.isConfirmed) {
      return;
    }
    cleanupAudioAndTimers();
    const { post } = useApiEndpoint();
    const { data } = await post("logout");
    if (data.success) {
      localStorage.removeItem("companyId");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      adminUserData.value = null;
      await Swal.fire({
        icon: "success",
        title: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      navigateTo("/login");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    localStorage.removeItem("companyId");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    console.error("Logout failed:", error);
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

const currentTime = ref("");
const updateTime = () => {
  const now = moment().tz("Etc/GMT-8");
  currentTime.value = now.format("DD/MM/YYYY, HH:mm:ss");
};

const companyLogo = computed(() => {
  const companyId = localStorage.getItem("companyId");
  return COMPANIES[companyId]?.logo || "/images/logo/emtech88.png";
});

const fetchSMSBalance = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("sms-balance");
    if (data.success) {
      smsBalance.value = data.data.balance;
      smsStatus.value = data.data.status;
      if (smsStatus.value && data.data.balance < data.data.minBalance) {
        await Swal.fire({
          title: $t("low_sms_balance_alert"),
          text: $t("current_sms_balance_below", {
            balance: data.data.balance.toFixed(2),
            minBalance: data.data.minBalance.toFixed(2),
          }),
          icon: "warning",
          confirmButtonText: $t("ok"),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching SMS balance:", error);
  }
};

const refreshSMSBalance = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("sms-balance");
    if (data.success) {
      smsBalance.value = data.data.balance;
      smsStatus.value = data.data.status;
      await Swal.fire({
        icon: "success",
        title:
          data.message[$locale.value] ||
          data.message.en ||
          $t("balance_updated"),
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error refreshing SMS balance:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("failed_refresh_sms_balance"),
    });
  }
};

const fetchEmailBalance = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("email-balance");
    if (data.success) {
      emailBalance.value = data.data.balance;
      emailStatus.value = data.data.status;
      if (emailStatus.value && data.data.balance < data.data.minBalance) {
        await Swal.fire({
          title: $t("low_email_balance_alert"),
          text: $t("current_email_balance_below", {
            balance: data.data.balance.toFixed(2),
            minBalance: data.data.minBalance.toFixed(2),
          }),
          icon: "warning",
          confirmButtonText: $t("ok"),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching Email balance:", error);
  }
};

const refreshEmailBalance = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("email-balance");
    if (data.success) {
      emailBalance.value = data.data.balance;
      emailStatus.value = data.data.status;
      await Swal.fire({
        icon: "success",
        title:
          data.message[$locale.value] ||
          data.message.en ||
          $t("balance_updated"),
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error refreshing Email balance:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("failed_refresh_email_balance"),
    });
  }
};

const fetchKioskBalance = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("kiosk-balance");
    if (data.success) {
      kioskBalance.value = data.data.balance;
      kioskStatus.value = data.data.status;
      if (kioskStatus.value && data.data.balance < data.data.minBalance) {
        await Swal.fire({
          title: $t("low_kiosk_balance_alert"),
          text: $t("current_kiosk_balance_below", {
            balance: data.data.balance.toFixed(2),
            minBalance: data.data.minBalance.toFixed(2),
          }),
          icon: "warning",
          confirmButtonText: $t("ok"),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching Kiosk balance:", error);
  }
};

const refreshKioskBalance = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("kiosk-balance");
    if (data.success) {
      kioskBalance.value = data.data.balance;
      kioskStatus.value = data.data.status;
      await Swal.fire({
        icon: "success",
        title:
          data.message[$locale.value] ||
          data.message.en ||
          $t("balance_updated"),
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error refreshing Kiosk balance:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("failed_refresh_kiosk_balance"),
    });
  }
};

onMounted(async () => {
  updateTime();
  const interval = setInterval(updateTime, 1000);
  onUnmounted(() => clearInterval(interval));
  if (adminUserData.value?._id) {
    await fetchSMSBalance();
    await fetchEmailBalance();
    await fetchKioskBalance();
  }
});
</script>

<style></style>

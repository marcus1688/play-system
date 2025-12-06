<template>
  <div
    class="min-h-screen flex items-center justify-center bg-[url('/images/login/bg.png')] bg-cover bg-center p-4 max-md:p-3"
  >
    <div
      class="w-full max-w-md p-8 m-4 bg-gray-300 bg-opacity-30 shadow-[0_0_25px_15px_rgba(255,255,255,0.6)] backdrop-blur-md rounded-2xl max-md:p-6 max-md:m-2"
    >
      <!-- Logo/Brand Section -->
      <div class="text-center mb-4 max-md:mb-3">
        <div class="flex justify-center mb-1">
          <div class="">
            <img
              src="/shield.png"
              alt="EMTECH88 Logo"
              class="w-28 h-auto max-md:w-20"
            />
          </div>
        </div>
        <!-- <h2 class="text-2xl font-bold text-zinc-800 tracking-normal mb-1 max-md:text-xl">
          Play System
        </h2> -->
        <p class="text-gray-800 font-bold max-md:text-sm">
          Sign in to your account
        </p>
      </div>
      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6 max-md:space-y-4">
        <!-- Company Input -->
        <div class="space-y-2 max-md:space-y-1.5">
          <label
            class="text-sm font-medium text-gray-700 flex items-center gap-1 max-md:text-xs"
          >
            <Icon icon="mdi:office-building" class="w-5 h-auto max-md:w-4" />
            Company
          </label>
          <div class="relative">
            <input
              v-model="formData.company"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              placeholder="Enter company ID"
            />
          </div>
        </div>
        <!-- Username Input -->
        <div class="space-y-2 max-md:space-y-1.5">
          <label
            class="text-sm font-medium text-gray-700 flex items-center gap-1 max-md:text-xs"
          >
            <Icon icon="mdi:account" class="w-5 h-auto max-md:w-4" />
            Username
          </label>
          <div class="relative">
            <input
              v-model="formData.username"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              placeholder="Enter your username"
            />
          </div>
        </div>
        <!-- Password Input -->
        <div class="space-y-2 max-md:space-y-1.5">
          <label
            class="text-sm font-medium text-gray-700 flex items-center gap-1 max-md:text-xs"
          >
            <Icon icon="mdi:lock" class="w-5 h-auto max-md:w-4" />
            Password
          </label>
          <div class="relative">
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              placeholder="Enter your password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 lg:hover:text-gray-700 max-md:right-2"
            >
              <Icon
                :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
                class="h-5 w-5 max-md:h-4 max-md:w-4"
              />
            </button>
          </div>
        </div>
        <!-- Human Verification -->
        <div class="space-y-2 max-md:space-y-1.5">
          <div id="captcha-element" class="mb-3 max-md:mb-2"></div>
        </div>
        <div class="flex flex-col gap-2">
          <!-- Submit Button -->
          <LoadingButton
            type="submit"
            :loading="isLoginButtonLoading"
            class="w-full py-3 px-4 text-white font-medium bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg lg:hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 lg:hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed max-md:py-2 max-md:px-3 max-md:text-sm"
          >
            <div class="flex items-center justify-center">
              <span>Sign In</span>
            </div>
          </LoadingButton>

          <!-- Copyright Section -->
          <!-- <div class="w-full text-center text-gray-200 text-sm max-md:text-xs">
            <p>
              © {{ new Date().getFullYear() }} EMTECH88. All rights reserved.
            </p>
          </div> -->
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { COMPANIES } from "~/utils/companies";

onBeforeMount(() => {
  const img = new Image();
  img.src = "/logo.png";
});

const { loadCaptchaScript, initCaptcha, validateCaptcha, getCaptcha } =
  useCaptcha($locale);
const router = useRouter();
const { post } = useApiEndpoint();
const { setCompanyId } = useCompany();
const isLoginButtonLoading = ref(false);
const showPassword = ref(false);
const formData = ref({
  company: "",
  username: "",
  password: "",
});

const handleLogin = async () => {
  if (!COMPANIES[formData.value.company]) {
    Swal.fire({
      title: "Warning",
      text: "Invalid company ID",
      icon: "warning",
    });
    return;
  }
  const existingCompanyId = localStorage.getItem("companyId");
  if (existingCompanyId && existingCompanyId !== formData.value.company) {
    const result = await Swal.fire({
      title: "Switch Company?",
      text: `You are currently logged in to ${
        COMPANIES[existingCompanyId].name
      }. Do you want to switch to ${COMPANIES[formData.value.company].name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, switch company",
      cancelButtonText: "No, cancel",
    });
    if (!result.isConfirmed) {
      return;
    }
    localStorage.clear();
  }
  const captchaInstance = getCaptcha();
  if (captchaInstance) {
    captchaInstance.show();
  } else {
    initCaptcha(captchaVerifyCallback);
  }
};

const loginProcess = async () => {
  try {
    isLoginButtonLoading.value = true;
    setCompanyId(formData.value.company);
    const { data } = await post("login", {
      username: formData.value.username,
      password: formData.value.password,
    });

    if (data.authorized) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      Swal.fire({
        icon: "success",
        title: "Login Success",
        text: "",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: data.message,
      });
    }
  } catch (err) {
    console.error("Login failed:", err);
    Swal.fire({
      title: "Login Failed",
      text: err.message || "Invalid credentials or server error",
      icon: "error",
    });
  } finally {
    isLoginButtonLoading.value = false;
  }
};

const captchaVerifyCallback = async (captchaVerifyParam) => {
  try {
    const aliyunResponse = await validateCaptcha(captchaVerifyParam);
    if (!aliyunResponse.success || !aliyunResponse.verifyResult) {
      return { captchaResult: false };
    }
    setTimeout(() => {
      loginProcess();
    }, 1000);
    return { captchaResult: true };
  } catch (err) {
    setTimeout(() => {
      Swal.fire({
        title: "Verification Failed",
        text: err.message || "Failed to verify captcha",
        icon: "error",
      });
    }, 500);
    return { captchaResult: false };
  }
};

onMounted(() => {
  loadCaptchaScript();
  const scriptLoadCheck = setInterval(() => {
    if (window.initAliyunCaptcha) {
      clearInterval(scriptLoadCheck);
      initCaptcha(captchaVerifyCallback);
    }
  }, 100);
});

useHead({
  title: "Play System | Login",
  meta: [
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
});
</script>

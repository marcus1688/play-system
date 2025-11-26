<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";
import devtools from "devtools-detect";
const { get, post, publicGet } = useApiEndpoint();
const { t, locale } = useI18n();
const isMainLoading = useState("isMainLoading", () => true);
const isMainLoadingSuccess = useState("isMainLoadingSuccess", () => false);
const adminUserData = useState("adminUserData");
const socketIO = useSocketIO();
const route = useRoute();
const pendingFeedbacks = useState("pendingFeedbacks", () => []);
const pendingDeposits = useState("pendingDeposits", () => []);
const pendingWithdraws = useState("pendingWithdraws", () => []);
const pendingBonuses = useState("pendingBonuses", () => []);
const notificationSound = ref(null);
const isSoundMuted = useState("isSoundMuted", () => false);
const countdown = useState("countdown", () => 15);

let countdownTimer = null;
let soundInterval = null;
let transactionWorker;
let isWorkerRunning = false;

if (process.client) {
  window.Swal = Swal;
  window.$t = t;
  window.$locale = locale;
}

const preventF12 = () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      post("logtrack", {
        remark: "F12 key press attempt detected",
      });
      return false;
    }
  });
};

const detectViewSource = () => {
  document.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey && e.key === "u") ||
      (e.metaKey && e.altKey && e.key === "u")
    ) {
      e.preventDefault();
      post("logtrack", {
        remark: "View page source keyboard shortcut detected",
      });
      return false;
    }
  });
};

const trackPageNavigation = () => {
  watch(
    () => route.path,
    (newPath, oldPath) => {
      post("logtrack", {
        remark: `Page navigation: ${newPath}`,
      });
    }
  );
};

const disableRightClick = () => {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    post("logtrack", {
      remark: "Right-click attempt detected",
    });
    return false;
  });
};

const notifyDevToolsStatus = async (isOpen) => {
  try {
    const { data, error } = await post("logtrack", {
      remark: isOpen
        ? "User opened developer tools (F12)"
        : "User closed developer tools (F12)",
    });
    if (isOpen) {
      await logoutUser();
    }
    if (error) {
      console.error("Error logging devtools status:", error);
      return;
    }
  } catch (error) {
    console.error("Failed to notify server about devtools status:", error);
  }
};

const cleanupAudioAndTimers = () => {
  if (soundInterval) {
    clearInterval(soundInterval);
    soundInterval = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (transactionWorker) {
    transactionWorker.postMessage("stop");
    transactionWorker.terminate();
    transactionWorker = null;
    isWorkerRunning = false;
  }
  if (notificationSound.value) {
    notificationSound.value.pause();
    notificationSound.value.currentTime = 0;
    notificationSound.value = null;
  }
  pendingDeposits.value = [];
  pendingWithdraws.value = [];
  pendingBonuses.value = [];
  // countdown.value = 15;
};

const logoutUser = async () => {
  try {
    cleanupAudioAndTimers();
    const { data } = await post("logout");
    if (data.success) {
      localStorage.removeItem("companyId");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      await Swal.fire({
        title: "Warning",
        text: "Developer tools detected. You have been logged out for security reasons.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      navigateTo("/login");
    }
  } catch (error) {
    console.error("Error during forced logout:", error);
    localStorage.removeItem("companyId");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigateTo("/login");
  }
};

const playNotificationSound = () => {
  if (notificationSound.value && !isSoundMuted.value) {
    notificationSound.value.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  }
};

const fetchPendingFeedbacks = async () => {
  try {
    const { data } = await publicGet("pending-feedbacks-count");
    if (data.success) {
      pendingFeedbacks.value = data.count;
    }
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load feedbacks",
    });
  }
};

const totalTransactions = computed(() => {
  return [
    ...pendingDeposits.value,
    ...pendingWithdraws.value,
    ...pendingBonuses.value,
  ];
});

watch(
  totalTransactions,
  (newTransactions) => {
    if (newTransactions.length > 0) {
      if (!soundInterval) {
        soundInterval = setInterval(() => {
          playNotificationSound();
        }, 5000);
        playNotificationSound();
      }
    } else {
      if (soundInterval) {
        clearInterval(soundInterval);
        soundInterval = null;
      }
    }
  },
  { deep: true }
);

watch(
  () => route.path,
  () => {
    window.scrollTo({ top: 0, behavior: "instant" });
  },
  { immediate: false }
);

onMounted(() => {
  if (adminUserData.value?._id) {
    fetchPendingFeedbacks();
    if (process.client) {
      notificationSound.value = new Audio(
        "/sound/deposit_notification_sound.mp3"
      );
      socketIO.connectSocketIO();
      socketIO.startRefreshCycle();
      if (adminUserData.value.role !== "superadmin") {
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        // if (!isMobile && devtools.isOpen) {
        //   notifyDevToolsStatus(true);
        // }
        // window.addEventListener("devtoolschange", (event) => {
        //   notifyDevToolsStatus(event.detail.isOpen);
        // });
        if (adminUserData.value.role !== "superadmin") {
          trackPageNavigation();
          disableRightClick();
          detectViewSource();
          preventF12();
        }
      }
    }
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    socketIO.cleanup();
    cleanupAudioAndTimers();
  }
});
</script>

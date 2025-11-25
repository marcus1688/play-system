import { io } from "socket.io-client";
import { useApiEndpoint } from "~/composables/useApiEndpoint";
import { getCompanySocketUrl } from "~/utils/companies";

export const useSocketIO = () => {
  const { post } = useApiEndpoint();
  const socket = ref(null);
  const onlineUsers = useState("onlineUsers", () => []);
  const error = useState("wsError", () => null);
  const refreshInterval = ref(null);
  const heartbeatInterval = ref(null);

  const startHeartbeat = () => {
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value);
    }
    heartbeatInterval.value = setInterval(() => {
      if (socket.value?.connected) {
        // console.log("💓 Sending heartbeat");
        socket.value.emit("ping", { timestamp: Date.now() });
      }
    }, 30000);
  };

  const connectSocketIO = () => {
    if (socket.value?.connected) {
      return;
    }
    const tabId = Math.random().toString(36).substring(2, 9);
    localStorage.setItem("activeSocketTab", tabId);
    const checkActiveTab = setInterval(() => {
      if (localStorage.getItem("activeSocketTab") !== tabId) {
        cleanup();
        clearInterval(checkActiveTab);
        return;
      }
    }, 5000);
    if (process.client) {
      window._socketTabCheckInterval = checkActiveTab;
    }
    const companyId = localStorage.getItem("companyId");
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const socketUrl = getCompanySocketUrl(companyId);
    const adminUserData = useState("adminUserData");
    socket.value = io(socketUrl, {
      withCredentials: true,
      auth: {
        token,
        companyId,
        refreshToken,
        isAdmin: true,
      },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    socket.value.on("connect", () => {
      // console.log("Socket.IO connected");
      socket.value.emit("setAdminId", {
        adminId: adminUserData.value?._id,
      });
      refreshData();
      startHeartbeat();
    });

    socket.value.on("reconnect", (attemptNumber) => {
      socket.value.emit("setAdminId", {
        adminId: adminUserData.value?._id,
      });
      refreshData();
      startHeartbeat();
    });

    socket.value.on("usernameResponse", (data) => {
      onlineUsers.value = data.onlineUsers;
    });

    socket.value.on("token:refresh", (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        socket.value.auth.token = data.token;
      }
    });

    socket.value.on("forceLogout", async () => {
      await post("force-logout-success");
      window.location.href = "/login";
    });

    socket.value.on("connect_error", (err) => {
      error.value = "Connection error: " + err.message;
    });

    socket.value.on("error", (err) => {
      error.value = err.message;
      console.error("Socket.IO error:", err);
    });

    socket.value.on("disconnect", (reason) => {
      // console.log("Socket.IO disconnected:", reason);
      if (heartbeatInterval.value) {
        clearInterval(heartbeatInterval.value);
        heartbeatInterval.value = null;
      }
    });

    socket.value.on("forceLogoutAdmin", handleForceLogoutAdmin);

    socket.value.on("notification", ({ message, title }) => {
      Swal.fire({
        title: title[window.$locale.value] || title.en,
        text: message[window.$locale.value] || message.en,
        icon: "info",
      });
    });
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

  const handleForceLogoutAdmin = async () => {
    try {
      cleanupAudioAndTimers();
      localStorage.removeItem("companyId");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      Swal.fire({
        title: "You have been forcefully logged out",
        text: "Please log in again",
        icon: "warning",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          window.location.href = "/";
        },
      });
    } catch (error) {
      console.error("Error processing force logout:", error);
    }
  };

  const startRefreshCycle = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
    }
    const { getCompanyId } = useCompany();
    const currentCompanyId = getCompanyId();
    const intervalTime = currentCompanyId === "ae96" ? 10000 : 30000;
    refreshInterval.value = setInterval(() => {
      refreshData();
    }, intervalTime);
  };

  const refreshData = () => {
    if (socket.value && socket.value.connected === true) {
      socket.value.emit("getUsername");
      // socket.value.emit("requestLatestData");
    } else {
      connectSocketIO();
    }
  };

  const forceLogoutPlayer = async (userId) => {
    try {
      const { getCompanyId } = useCompany();
      const currentCompanyId = getCompanyId();
      const companyName = currentCompanyId.toUpperCase();
      const confirmation = await Swal.fire({
        title: "Confirm Force Logout",
        text: `Please ensure you have obtained approval before force logging out any ${companyName} user.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirm Logout",
        cancelButtonText: "Cancel",
      });
      if (!confirmation.isConfirmed) {
        return false;
      }
      const { data } = await post("force-logout-by-admin", { userId });
      if (data) {
        await Swal.fire(
          "Success",
          "The user has been force logged out",
          "success"
        );
        refreshData();
        return true;
      } else {
        await Swal.fire({
          icon: "info",
          title: "Info",
          text: data.message[window.$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Failed to force logout user:", error);
      await Swal.fire("Error", "Failed to force logout the user", "error");
      return false;
    }
  };

  const forceLogoutAdmin = async (adminId) => {
    try {
      const confirmation = await Swal.fire({
        title: "Confirm Admin Force Logout",
        text: "Are you sure you want to force logout this admin?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirm Logout",
        cancelButtonText: "Cancel",
      });
      if (!confirmation.isConfirmed) {
        return false;
      }
      const { data } = await post("force-logout-admin", { adminId });
      if (data && data.success) {
        await Swal.fire(
          "Success",
          "The admin has been force logged out",
          "success"
        );
        refreshData();
        return true;
      } else {
        await Swal.fire({
          icon: "info",
          title: "Info",
          text: data.message[window.$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Failed to force logout admin:", error);
      await Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to force logout the admin",
        "error"
      );
      return false;
    }
  };

  const cleanup = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value);
      heartbeatInterval.value = null;
    }
    if (process.client && window._socketTabCheckInterval) {
      clearInterval(window._socketTabCheckInterval);
      window._socketTabCheckInterval = null;
    }
  };

  return {
    socket,
    onlineUsers,
    error,
    connectSocketIO,
    refreshData,
    forceLogoutPlayer,
    cleanup,
    startRefreshCycle,
    handleForceLogoutAdmin,
    forceLogoutAdmin,
  };
};

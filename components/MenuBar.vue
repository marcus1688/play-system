<template>
  <div></div>
  <div class="transition-all duration-300">
    <div
      v-if="menuOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="toggleMenu"
    ></div>
    <div
      class="h-screen bg-[#0B0F1A] shadow-lg fixed top-0 left-0 z-50 flex flex-col"
      :class="[menuOpen ? 'w-[250px] max-md:w-[220px]' : 'w-[70px] max-lg:w-0']"
      style="height: 100dvh"
    >
      <div class="px-4 pt-4 flex-shrink-0 max-md:px-3 max-md:pt-3">
        <div
          class="flex items-center"
          :class="[menuOpen ? 'justify-between' : 'justify-center']"
        >
          <div v-if="menuOpen" class="text-white">
            <div class="flex items-center gap-3 max-md:gap-2">
              <img
                class="w-16 h-16 rounded-full border-2 border-gray-500 max-md:w-12 max-md:h-12"
                src="/images/menubar/avatar2.png"
                alt="Avatar"
              />
              <div class="flex flex-col">
                <span class="font-bold text-[1rem] max-md:text-[0.9rem]">{{
                  adminUserData?.username.toUpperCase()
                }}</span>
                <span class="font-bold text-[0.7rem] max-md:text-[0.65rem]">{{
                  adminUserData?.role.toUpperCase()
                }}</span>
              </div>
            </div>
          </div>
          <button
            @click="toggleMenu"
            class="p-2 rounded-lg lg:hover:text-white text-gray-300 max-md:p-1.5"
            :class="{ 'max-lg:hidden': !menuOpen }"
          >
            <Bars3Icon class="w-5 h-5 max-md:w-4 max-md:h-4" />
          </button>
        </div>
        <div
          v-if="menuOpen"
          class="w-full text-white mt-2 border-b-[0.5px] border-gray-700 pb-3 max-md:mt-1.5 max-md:pb-2"
        >
          <!-- Last Login Info -->
          <div class="flex justify-center items-center mb-3 max-md:mb-2">
            <ClockIcon
              class="w-4 h-4 text-gray-400 mr-1 max-md:w-3.5 max-md:h-3.5"
            />
            <p class="text-[0.8rem] max-md:text-[0.7rem]" v-if="adminUserData">
              {{ $t("last_login") }}:
              {{ formatDate(adminUserData.updatedAt) }}
            </p>
          </div>

          <!-- Sound Toggle Switch -->
          <div class="flex items-center justify-between px-2 max-md:px-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 max-md:gap-1.5">
                <div class="p-1 rounded-lg bg-gray-700/50 max-md:p-0.5">
                  <Icon
                    :icon="isSoundMuted ? 'mdi:volume-off' : 'mdi:volume-high'"
                    class="w-6 h-6 transition-colors duration-200 max-md:w-5 max-md:h-5"
                    :class="isSoundMuted ? 'text-red-400' : 'text-indigo-400'"
                  />
                </div>
                <span class="text-gray-200 font-medium max-md:text-sm">{{
                  $t("sound")
                }}</span>
              </div>
            </div>
            <button
              @click="toggleSound"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none max-md:h-5 max-md:w-9"
              :class="isSoundMuted ? 'bg-gray-600' : 'bg-indigo-600'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 max-md:h-3 max-md:w-3"
                :class="
                  isSoundMuted
                    ? 'translate-x-1'
                    : 'translate-x-6 max-md:translate-x-5'
                "
              ></span>
            </button>
          </div>
        </div>
      </div>
      <!-- Menu Items -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <nav class="my-2 max-md:my-1.5">
          <ul class="flex flex-col gap-3 max-md:gap-2">
            <li v-for="item in filteredMenuItems" :key="item.name">
              <div v-if="item.children">
                <button
                  @click="toggleDropdown(item.name)"
                  class="w-full flex items-center group"
                  :title="!menuOpen ? item.name : ''"
                  :class="[
                    menuOpen ? 'justify-between' : 'justify-center ',
                    openDropdowns[item.name] ? 'text-white ' : 'text-gray-300',
                  ]"
                >
                  <div
                    class="w-full flex items-center group px-4 py-2.5 max-md:px-3 max-md:py-2"
                    :class="[
                      menuOpen
                        ? 'mx-3 justify-between max-md:mx-2'
                        : [
                            'mx-2 justify-center max-md:mx-1.5',
                            openDropdowns[item.name]
                              ? 'bg-blue-700 rounded-xl'
                              : 'lg:hover:bg-gray-700 lg:hover:rounded-xl',
                          ],
                    ]"
                  >
                    <div class="flex items-center">
                      <component
                        :is="item.iconSolid"
                        :class="[
                          'w-6 h-6 shrink-0 max-md:w-5 max-md:h-5',
                          openDropdowns[item.name]
                            ? 'text-white'
                            : 'text-gray-300 lg:group-hover:text-white',
                        ]"
                      />
                      <span
                        v-if="menuOpen"
                        class="ml-3 truncate max-md:ml-2 max-md:text-sm"
                        :class="[
                          openDropdowns[item.name]
                            ? 'text-white'
                            : 'text-gray-300 lg:group-hover:text-white',
                        ]"
                        >{{ $t(item.name) }}</span
                      >
                      <span
                        v-if="
                          menuOpen &&
                          item.name === 'feedback' &&
                          pendingFeedbacks > 0
                        "
                        class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse max-md:text-[0.65rem] max-md:px-1.5 max-md:py-0 max-md:min-w-[18px]"
                      >
                        {{ pendingFeedbacks }}
                      </span>
                    </div>
                    <ChevronRightIcon
                      v-if="menuOpen"
                      :class="[
                        'w-4 h-4 shrink-0 ml-4 max-md:w-3.5 max-md:h-3.5 max-md:ml-3',
                        openDropdowns[item.name]
                          ? 'text-white'
                          : 'text-gray-300 lg:group-hover:text-white',
                        { 'transform rotate-90': openDropdowns[item.name] },
                      ]"
                    />
                  </div>
                </button>
                <!-- Dropdown Menu -->
                <ul
                  v-if="openDropdowns[item.name] && menuOpen"
                  class="flex flex-col"
                >
                  <li v-for="child in item.children" :key="child.name">
                    <NuxtLinkLocale
                      @click="handleSubItemClick(child.name)"
                      :to="child.path"
                      class="flex items-center px-4 py-2 mt-2 text-gray-300 group lg:hover:text-white max-md:px-3 max-md:py-1.5 max-md:mt-1.5"
                      :class="[
                        menuOpen
                          ? 'mx-3 max-md:mx-2'
                          : 'mx-2 justify-center max-md:mx-1.5',
                        menuActiveBar === child.name
                          ? 'bg-blue-700 rounded-xl text-white'
                          : 'lg:hover:bg-gray-700 lg:hover:rounded-xl lg:hover:text-white',
                      ]"
                    >
                      <div class="w-10 flex justify-center max-md:w-8">
                        <div
                          class="w-1.5 h-1.5 rounded-full bg-gray-600 lg:group-hover:bg-white max-md:w-1 max-md:h-1"
                          :class="[
                            menuActiveBar === child.name
                              ? 'bg-white'
                              : 'bg-gray-600 lg:group-hover:bg-white',
                          ]"
                        ></div>
                      </div>
                      <span class="max-md:text-sm">{{ $t(child.name) }}</span>
                    </NuxtLinkLocale>
                  </li>
                </ul>
              </div>
              <!-- Regular Menu Item -->
              <NuxtLinkLocale
                v-else
                @click="handleMainItemClick(item)"
                :title="!menuOpen ? item.name : ''"
                :to="item.path"
                class="flex items-center group cursor-pointer py-2.5 max-md:py-2"
                :class="[
                  menuOpen
                    ? 'mx-3 px-4 max-md:mx-2 max-md:px-3'
                    : ' justify-center',
                  item.name === 'Logout'
                    ? 'lg:hover:bg-gray-700 lg:hover:rounded-xl'
                    : [
                        menuActiveBar === item.name
                          ? 'bg-blue-700 rounded-xl'
                          : 'lg:hover:bg-gray-700 lg:hover:rounded-xl',
                      ],
                ]"
              >
                <component
                  :is="item.iconSolid"
                  :class="[
                    'w-6 h-6 max-md:w-5 max-md:h-5',
                    item.name === 'Logout'
                      ? 'text-gray-300 lg:group-hover:text-white'
                      : [
                          menuActiveBar === item.name
                            ? 'text-white'
                            : 'text-gray-300 lg:group-hover:text-white',
                        ],
                  ]"
                />
                <span
                  v-if="menuOpen"
                  :class="[
                    'ml-3 max-md:ml-2 max-md:text-sm',
                    item.name === 'Logout'
                      ? 'text-gray-300 lg:group-hover:text-white'
                      : [
                          menuActiveBar === item.name
                            ? 'text-white'
                            : 'text-gray-300 lg:group-hover:text-white',
                        ],
                  ]"
                  >{{ $t(item.name) }}</span
                >
              </NuxtLinkLocale>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { menuItems } from "~/utils/menuItems";
import {
  ChevronRightIcon,
  Bars3Icon,
  ClockIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/vue/24/solid";

const pendingFeedbacks = useState("pendingFeedbacks");
const isSoundMuted = useState("isSoundMuted");
const adminUserData = useState("adminUserData");
const showTooltip = ref(null);
const route = useRoute();
const menuActiveBar = useState("menuActiveBar", () => {
  return localStorage.getItem("menuActiveBar") || "dashboard";
});
const menuOpen = useState("menuOpen");
const openDropdowns = useState("openDropdowns", () => ({}));
const toggleMenu = () => {
  if (menuOpen.value) {
    const activeMenu = menuItems.find(
      (item) => item.name === menuActiveBar.value
    );
    if (activeMenu && !activeMenu.children) {
      openDropdowns.value = {};
    } else {
      const parentMenu = menuItems.find((item) =>
        item.children?.some((child) => child.name === menuActiveBar.value)
      );
      if (parentMenu) {
        openDropdowns.value = {
          [parentMenu.name]: true,
        };
      }
    }
  }
  menuOpen.value = !menuOpen.value;
};
const toggleDropdown = (name) => {
  if (!menuOpen.value) {
    if (openDropdowns.value[name]) {
      menuOpen.value = true;
      return;
    }
    menuOpen.value = true;
    openDropdowns.value = {
      [name]: true,
    };
    return;
  }
  if (openDropdowns.value[name]) {
    openDropdowns.value = {};
    return;
  }
  openDropdowns.value = {
    [name]: true,
  };
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
      const adminUserData = useState("adminUserData");
      adminUserData.value = null;
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
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

watch(menuActiveBar, (newValue) => {
  localStorage.setItem("menuActiveBar", newValue);
  if (!menuOpen.value) {
    const isMainMenuItem = menuItems.find(
      (item) => item.name === newValue && !item.children
    );
    if (isMainMenuItem) {
      openDropdowns.value = {};
    }
  }
});

watch(
  () => route.path,
  (newPath) => {
    for (const item of menuItems) {
      if (item.children) {
        const matchedChild = item.children.find(
          (child) => child.path === newPath
        );
        if (matchedChild) {
          menuActiveBar.value = matchedChild.name;
          localStorage.setItem("menuActiveBar", matchedChild.name);
          openDropdowns.value = {
            [item.name]: true,
          };
          return;
        }
      } else if (item.path === newPath) {
        menuActiveBar.value = item.name;
        localStorage.setItem("menuActiveBar", item.name);
        return;
      }
    }
  },
  { immediate: true }
);

const { companyId } = useCompany();

const hasPermission = (module, action) => {
  if (adminUserData.value?.role === "superadmin") {
    return true;
  }
  return adminUserData.value?.permissions?.some(
    (p) => p.module === module && p.actions.includes(action)
  );
};

const filteredMenuItems = computed(() => {
  return menuItems.filter((item) => {
    if (item.superadminOnly && adminUserData.value?.role !== "superadmin") {
      return false;
    }
    if (
      item.requiredFeature &&
      !hasFeature(companyId.value, item.requiredFeature)
    ) {
      return false;
    }
    if (item.children) {
      const filteredChildren = item.children.filter((child) => {
        if (
          child.superadminOnly &&
          adminUserData.value?.role !== "superadmin"
        ) {
          return false;
        }
        if (child.permission) {
          const [module, action] = child.permission.split(".");
          return hasPermission(module, action);
        }
        return true;
      });
      if (filteredChildren.length === 0) {
        return false;
      }
      item.children = filteredChildren;
      return true;
    }
    if (item.path && item.path !== "/login" && item.permission) {
      const [module, action] = item.permission.split(".");
      return hasPermission(module, action);
    }
    return true;
  });
});

const closeMobileMenu = () => {
  if (window && window.innerWidth < 1024) {
    menuOpen.value = false;
  }
};

const handleSubItemClick = (childName) => {
  menuActiveBar.value = childName;
  closeMobileMenu();
};

const handleMainItemClick = (item) => {
  if (item.name === "logout") {
    handleLogout();
    return;
  }
  menuActiveBar.value = item.name;
  openDropdowns.value = {};
  closeMobileMenu();
};

const toggleSound = () => {
  isSoundMuted.value = !isSoundMuted.value;
};

onMounted(() => {
  const storedActiveBar = localStorage.getItem("menuActiveBar");
  if (storedActiveBar) {
    menuActiveBar.value = storedActiveBar;
    for (const item of menuItems) {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => child.name === storedActiveBar
        );
        if (isChildActive) {
          openDropdowns.value = {
            [item.name]: true,
          };
          break;
        }
      }
    }
  } else {
    for (const item of menuItems) {
      if (item.children) {
        const matchedChild = item.children.find(
          (child) => child.path === route.path
        );
        if (matchedChild) {
          menuActiveBar.value = matchedChild.name;
          localStorage.setItem("menuActiveBar", matchedChild.name);
          openDropdowns.value = {
            [item.name]: true,
          };
          return;
        }
      }
    }
    const matchedMainItem = menuItems.find((item) => item.path === route.path);
    if (matchedMainItem) {
      menuActiveBar.value = matchedMainItem.name;
      localStorage.setItem("menuActiveBar", matchedMainItem.name);
      openDropdowns.value = {};
    }
  }
});
</script>

<template>
  <div class="relative inline-block text-center">
    <button
      ref="buttonRef"
      @click="toggleDropdown"
      class="bg-indigo-600 lg:hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm flex items-center gap-2 max-md:px-2 max-md:py-2 max-md:text-xs"
    >
      <span>{{ buttonText }}</span>
      <Icon
        :icon="isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
        class="w-4 h-4 max-md:w-3 max-md:h-3"
      />
    </button>
    <Teleport to="body">
      <div
        v-if="isOpen"
        :style="menuStyle"
        class="fixed bg-white rounded-md shadow-lg z-10 max-md:min-w-[160px]"
      >
        <div class="py-1">
          <button
            v-for="item in items"
            :key="item.label"
            @click="handleItemClick(item)"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 lg:hover:bg-gray-100 lg:hover:text-gray-900 flex items-center gap-2 max-md:px-3 max-md:py-1.5 max-md:text-xs"
          >
            <Icon
              v-if="item.icon"
              :icon="item.icon"
              class="w-5 h-5 text-indigo-600 max-md:w-4 max-md:h-4"
            />
            {{ item.label }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const openCryptoDropdownId = useState("openCryptoDropdownId", () => null);
const buttonRef = ref(null);
const menuStyle = ref({});

const props = defineProps({
  buttonText: {
    type: String,
    default: "Actions",
  },
  items: {
    type: Array,
    required: true,
  },
  dropdownId: {
    type: String,
    required: true,
  },
});

const isOpen = computed(() => openCryptoDropdownId.value === props.dropdownId);

const updateMenuPosition = () => {
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    menuStyle.value = {
      position: "fixed",
      top: `${rect.bottom}px`,
      right: `50px`,
      width: `200px`,
      maxWidth: "300px",
    };
  }
};

const toggleDropdown = () => {
  if (isOpen.value) {
    openCryptoDropdownId.value = null;
  } else {
    openCryptoDropdownId.value = props.dropdownId;
    nextTick(() => {
      updateMenuPosition();
    });
  }
};

const handleItemClick = (item) => {
  if (item.action && typeof item.action === "function") {
    item.action();
    openCryptoDropdownId.value = null;
  }
};

const handleClickOutside = (event) => {
  if (
    isOpen.value &&
    buttonRef.value &&
    !buttonRef.value.contains(event.target)
  ) {
    openCryptoDropdownId.value = null;
  }
};

const updatePositionOnEvents = () => {
  if (isOpen.value) {
    updateMenuPosition();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", updatePositionOnEvents);
  window.addEventListener("resize", updatePositionOnEvents);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", updatePositionOnEvents);
  window.removeEventListener("resize", updatePositionOnEvents);
});
</script>

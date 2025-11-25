<template>
  <Teleport to="body">
    <div
      v-if="modelValue && showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] custom-modal p-4"
      @click.self="handleClick"
    >
      <div
        class="bg-white rounded-lg w-[300px] max-w-md shadow-xl p-6 text-center"
      >
        <h3 class="text-xl font-semibold mb-4">
          {{ $t("user_interaction_required") }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ $t("please_click_anywhere") }}
        </p>
        <button
          @click="handleClick"
          class="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg lg:hover:bg-indigo-500"
        >
          {{ $t("click_anywhere_to_continue") }}
        </button>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue"]);
const showModal = ref(false);

watchEffect(() => {
  if (props.modelValue) {
    setTimeout(() => {
      showModal.value = true;
    }, 500);
  } else {
    showModal.value = false;
  }
});

const handleClick = () => {
  emit("update:modelValue", false);
};
</script>

<template>
  <div class="space-y-2 max-md:space-y-1.5">
    <div
      class="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-1.5"
    >
      <label
        v-if="label"
        class="text-sm font-medium text-gray-700 max-md:text-xs"
      >
        {{ label }}
      </label>
      <div class="flex items-center gap-2 max-md:w-full max-md:justify-between">
        <span class="text-xs text-gray-500 max-md:text-[10px]">{{
          getCurrentLangName()
        }}</span>
        <select
          v-model="currentLang"
          class="text-xs rounded-md border border-gray-300 px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 max-md:text-[10px] max-md:px-1.5 max-md:py-2"
        >
          <option
            v-for="lang in languageConfig"
            :key="lang.code"
            :value="lang.code"
          >
            {{ lang.name }}
          </option>
        </select>
      </div>
    </div>
    <component
      :is="inputType === 'textarea' ? 'textarea' : 'input'"
      :value="getCurrentValue()"
      @input="updateValue($event)"
      :required="required"
      :placeholder="placeholder"
      :rows="inputType === 'textarea' ? rows : undefined"
      :class="[
        'w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-shadow duration-200',
        inputType === 'textarea'
          ? 'px-4 py-3 shadow-sm max-md:px-2 max-md:py-2 max-md:text-sm'
          : 'px-4 py-2.5 shadow-sm max-md:px-2 max-md:py-1.5 max-md:text-sm',
      ]"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  languageConfig: {
    type: Array,
    default: () => [
      { code: "zh", name: "中文", field: "" },
      { code: "en", name: "English", field: "" },
      { code: "ms", name: "Bahasa Melayu", field: "" },
    ],
  },
  label: {
    type: String,
    default: "",
  },
  inputType: {
    type: String,
    default: "input",
    validator: (value) => ["input", "textarea"].includes(value),
  },
  rows: {
    type: Number,
    default: 3,
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);
const currentLang = ref(props.languageConfig[0]?.code || "zh");

const getCurrentLangName = () => {
  const lang = props.languageConfig.find((l) => l.code === currentLang.value);
  return lang ? lang.name : currentLang.value;
};

const getCurrentFieldName = () => {
  const lang = props.languageConfig.find((l) => l.code === currentLang.value);
  return lang?.field || "";
};

const hasContent = (langCode) => {
  const lang = props.languageConfig.find((l) => l.code === langCode);
  if (!lang || !lang.field) return false;

  const value = props.modelValue[lang.field];
  return !!value && value.trim() !== "";
};

const getCurrentValue = () => {
  const fieldName = getCurrentFieldName();
  return fieldName ? props.modelValue[fieldName] || "" : "";
};

const updateValue = (event) => {
  const fieldName = getCurrentFieldName();
  if (!fieldName) return;
  const value = event.target.value;
  const updatedModel = { ...props.modelValue };
  updatedModel[fieldName] = value;
  emit("update:modelValue", updatedModel);
};

watch(
  () => props.languageConfig,
  (newConfig) => {
    if (
      newConfig.length > 0 &&
      !newConfig.some((l) => l.code === currentLang.value)
    ) {
      currentLang.value = newConfig[0].code;
    }
  },
  { deep: true }
);

defineExpose({
  getCurrentValue,
  updateValue,
  currentLang,
});
</script>

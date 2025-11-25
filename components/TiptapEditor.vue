<template>
  <div>
    <div
      v-if="label"
      class="flex justify-between items-center mb-2 max-md:mb-1.5"
    >
      <label class="text-sm font-medium text-gray-700 max-md:text-xs">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <span class="text-xs text-gray-500 max-md:text-[10px]">
        {{ getCurrentLanguageName() }}
      </span>
    </div>
    <div class="border rounded-lg overflow-hidden">
      <div
        class="border-b bg-gray-50 p-2 flex flex-wrap gap-2 max-md:p-1.5 max-md:gap-1"
      >
        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
        >
          <select
            v-model="currentHeadingLevel"
            class="text-sm rounded border bg-white px-2 h-9 max-md:text-xs max-md:px-1 max-md:h-7"
            @change="setHeadingLevel"
          >
            <option value="0">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>
        </div>
        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
        >
          <select
            v-model="currentFontFamily"
            class="text-sm rounded border bg-white px-2 h-9 max-md:text-xs max-md:px-1 max-md:h-7"
            @change="
              (e) => editor?.chain().focus().setFontFamily(e.target.value).run()
            "
          >
            <option value="Inter">Default Font</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>

          <select
            v-model="currentFontSize"
            class="text-sm rounded border bg-white px-2 h-9 max-md:text-xs max-md:px-1 max-md:h-7"
            @change="setFontSize"
          >
            <option value="8px">8px</option>
            <option value="9px">9px</option>
            <option value="10px">10px</option>
            <option value="11px">11px</option>
            <option value="12px">12px</option>
            <option value="13px">13px</option>
            <option value="14px">14px</option>
            <option value="15px">15px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="22px">22px</option>
            <option value="24px">24px</option>
            <option value="26px">26px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
            <option value="36px">36px</option>
            <option value="40px">40px</option>
            <option value="44px">44px</option>
            <option value="48px">48px</option>
            <option value="54px">54px</option>
            <option value="60px">60px</option>
            <option value="66px">66px</option>
            <option value="72px">72px</option>
          </select>
        </div>
        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
        >
          <button
            type="button"
            @click="editor?.chain().focus().toggleBold().run()"
            :class="{ 'bg-gray-200': editor?.isActive('bold') }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
          >
            <Icon
              icon="mdi:format-bold"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().toggleItalic().run()"
            :class="{ 'bg-gray-200': editor?.isActive('italic') }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
          >
            <Icon
              icon="mdi:format-italic"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().toggleUnderline().run()"
            :class="{ 'bg-gray-200': editor?.isActive('underline') }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
          >
            <Icon
              icon="mdi:format-underline"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().toggleStrike().run()"
            :class="{ 'bg-gray-200': editor?.isActive('strike') }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
          >
            <Icon
              icon="mdi:format-strikethrough"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
        </div>
        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
        >
          <input
            type="color"
            v-model="currentColor"
            @input="setColor"
            class="w-9 h-9 p-1 rounded border max-md:w-7 max-md:h-7 max-md:p-0.5"
          />
          <button
            type="button"
            @click="removeColor"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Remove color"
          >
            <Icon
              icon="mdi:format-color-text"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
        </div>

        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
        >
          <button
            type="button"
            @click="editor?.chain().focus().setTextAlign('left').run()"
            :class="{ 'bg-gray-200': editor?.isActive({ textAlign: 'left' }) }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
          >
            <Icon
              icon="mdi:format-align-left"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().setTextAlign('center').run()"
            :class="{
              'bg-gray-200': editor?.isActive({ textAlign: 'center' }),
            }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
          >
            <Icon
              icon="mdi:format-align-center"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().setTextAlign('right').run()"
            :class="{ 'bg-gray-200': editor?.isActive({ textAlign: 'right' }) }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
          >
            <Icon
              icon="mdi:format-align-right"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
        </div>
        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
          v-if="props.uploadImage"
        >
          <input
            type="file"
            ref="imageInput"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />
          <button
            type="button"
            @click="$refs.imageInput.click()"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Insert Image"
          >
            <Icon icon="mdi:image" class="w-5 h-5 max-md:w-4 max-md:h-4" />
          </button>
        </div>
        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
        >
          <div class="relative" v-if="editor?.isActive('table')">
            <button
              type="button"
              @click="toggleTableColorPicker"
              class="p-2 rounded lg:hover:bg-white max-md:p-1"
              title="Table Background Color"
            >
              <Icon
                icon="mdi:table-edit"
                class="w-5 h-5 max-md:w-4 max-md:h-4"
              />
            </button>
          </div>
          <button
            type="button"
            @click="insertTable"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Insert Table"
          >
            <Icon icon="mdi:table" class="w-5 h-5 max-md:w-4 max-md:h-4" />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().addColumnBefore().run()"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Add Column Before"
            :disabled="!editor?.can().addColumnBefore()"
          >
            <Icon
              icon="mdi:table-column-plus-before"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().addColumnAfter().run()"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Add Column After"
            :disabled="!editor?.can().addColumnAfter()"
          >
            <Icon
              icon="mdi:table-column-plus-after"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().addRowBefore().run()"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Add Row Before"
            :disabled="!editor?.can().addRowBefore()"
          >
            <Icon
              icon="mdi:table-row-plus-before"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().addRowAfter().run()"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Add Row After"
            :disabled="!editor?.can().addRowAfter()"
          >
            <Icon
              icon="mdi:table-row-plus-after"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>

          <button
            type="button"
            @click="editor?.chain().focus().deleteColumn().run()"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Delete Column"
            :disabled="!editor?.can().deleteColumn()"
          >
            <Icon
              icon="mdi:table-column-remove"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().deleteRow().run()"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Delete Row"
            :disabled="!editor?.can().deleteRow()"
          >
            <Icon
              icon="mdi:table-row-remove"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().deleteTable().run()"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Delete Table"
            :disabled="!editor?.can().deleteTable()"
          >
            <Icon
              icon="mdi:table-remove"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="adjustRowHeight"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Adjust Row Height"
            :disabled="!editor?.isActive('tableRow')"
          >
            <Icon
              icon="mdi:table-row-height"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="adjustColumnWidth"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Adjust Column Width"
            :disabled="!editor?.isActive('tableCell')"
          >
            <Icon
              icon="mdi:table-column-width"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
        </div>
        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
        >
          <button
            type="button"
            @click="insertLink"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Insert Link"
          >
            <Icon icon="mdi:link" class="w-5 h-5 max-md:w-4 max-md:h-4" />
          </button>
          <button
            type="button"
            @click="editLink"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Edit Link"
            :disabled="!editor?.isActive('link')"
            :class="{ 'bg-gray-200': editor?.isActive('link') }"
          >
            <Icon icon="mdi:link-edit" class="w-5 h-5 max-md:w-4 max-md:h-4" />
          </button>
          <button
            type="button"
            @click="removeLink"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Remove Link"
            :disabled="!editor?.isActive('link')"
          >
            <Icon icon="mdi:link-off" class="w-5 h-5 max-md:w-4 max-md:h-4" />
          </button>
        </div>

        <div
          class="flex items-center gap-1 border-r pr-2 max-md:pr-1 max-md:gap-0.5"
        >
          <button
            type="button"
            @click="editor?.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-gray-200': editor?.isActive('bulletList') }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Bullet List"
          >
            <Icon
              icon="mdi:format-list-bulleted"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <button
            type="button"
            @click="editor?.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-gray-200': editor?.isActive('orderedList') }"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
            title="Numbered List"
          >
            <Icon
              icon="mdi:format-list-numbered"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
        </div>
        <div class="flex items-center gap-1 max-md:gap-0.5">
          <button
            type="button"
            @click="insertSpecialChar"
            class="p-2 rounded lg:hover:bg-white max-md:p-1"
          >
            <Icon icon="mdi:symbol" class="w-5 h-5 max-md:w-4 max-md:h-4" />
          </button>
        </div>
        <div
          class="flex items-center gap-1 border-l pl-2 max-md:pl-1 max-md:gap-0.5"
        >
          <select
            v-model="currentLanguage"
            class="text-sm rounded border bg-white px-2 h-9 max-md:text-xs max-md:px-1 max-md:h-7"
            @change="switchLanguage"
          >
            <option
              v-for="lang in props.languageConfig"
              :key="lang.code"
              :value="lang.code"
            >
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>
      <div
        class="min-h-[200px] max-h-[400px] bg-white overflow-y-auto max-md:min-h-[150px] max-md:max-h-[300px]"
      >
        <editor-content
          :editor="editor"
          class="px-4 py-3 max-md:px-2 max-md:py-2"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { TextSelection } from "prosemirror-state";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { useCustomEditor } from "../composables/useCustomEditor";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import { Icon } from "@iconify/vue";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  languageConfig: {
    type: Array,
    default: () => [
      { code: "en", name: "English", field: "" },
      { code: "zh", name: "中文", field: "" },
      { code: "ms", name: "Bahasa Melayu", field: "" },
    ],
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Start typing...",
  },
  required: {
    type: Boolean,
    default: false,
  },
  uploadImage: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const editor = ref(null);

const currentFontSize = ref("12px");
const currentFontFamily = ref("Inter");
const currentColor = ref("#000000");

const insertSpecialChar = () => {
  const specialChars = [
    "©",
    "®",
    "™",
    "€",
    "£",
    "¥",
    "→",
    "←",
    "↑",
    "↓",
    "♠",
    "♣",
    "♥",
    "♦",
    "★",
    "☆",
    "✓",
    "✗",
    "≈",
    "≠",
    "≤",
    "≥",
    "∞",
    "∑",
    "∏",
    "√",
    "π",
    "α",
    "β",
    "Ω",
  ];

  const char = prompt(
    "Choose or type a special character:",
    specialChars.join(" ")
  );
  if (char) {
    editor.value?.chain().focus().insertContent(char).run();
  }
};

const { CustomTextStyle, setFontSize: setFontSizeUtil } = useCustomEditor();
const setFontSize = (e) => {
  setFontSizeUtil(editor.value, e.target.value);
};

const setColor = (e) => {
  const color = e.target.value;
  currentColor.value = color;
  editor.value?.chain().focus().setMark("textStyle", { color }).run();
};

onMounted(() => {
  const extensions = [
    StarterKit.configure({
      bulletList: true,
      orderedList: true,
      paragraph: {
        keepMarks: true,
        HTMLAttributes: {
          class: "leading-relaxed",
        },
      },
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
        exitOnTripleEnter: true,
        exitOnArrowDown: true,
        keepOnSplit: true,
      },
      hardBreak: {
        keepMarks: true,
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph", "listItem"],
    }),
    Underline,
    CustomTextStyle,
    FontFamily,
    Color,
    Link.configure({
      openOnClick: true,
      linkOnPaste: true,
      HTMLAttributes: {
        class: "text-blue-500 underline",
      },
    }),
    Table.configure({
      resizable: false,
      HTMLAttributes: {
        class: "custom-table",
      },
    }),
    CustomTableRow,
    TableHeader,
    CustomTableCell,
  ];
  if (props.uploadImage) {
    extensions.push(
      Image.configure({
        inline: true,
        allowBase64: true,
      })
    );
  }
  editor.value = new Editor({
    extensions,
    content: "",
    onUpdate: ({ editor }) => {
      const fieldName = getCurrentFieldName();
      if (fieldName) {
        const updatedModel = { ...props.modelValue };
        updatedModel[fieldName] = editor.getHTML();
        emit("update:modelValue", updatedModel);
      }
      updateFormatState(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      updateFormatState(editor);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[150px]",
      },
      handlePaste: (view, event, slice) => {
        if (!props.uploadImage) {
          const hasImage =
            event.clipboardData &&
            (Array.from(event.clipboardData.items).some((item) =>
              item.type.startsWith("image/")
            ) ||
              event.clipboardData.getData("text/html").includes("<img"));
          if (hasImage) {
            const text = event.clipboardData.getData("text/plain");
            if (text) {
              const textNode = view.state.schema.text(text);
              const transaction = view.state.tr.replaceSelection(
                new Slice(new Fragment([textNode]), 0, 0)
              );
              view.dispatch(transaction);
              return true;
            }
          }
        }
        return false;
      },
    },
  });
  const fieldName = getCurrentFieldName();
  if (fieldName && props.modelValue[fieldName]) {
    editor.value.commands.setContent(props.modelValue[fieldName]);
  }

  if (props.modelValue) {
    const fieldName = getCurrentFieldName();
    const content = fieldName ? props.modelValue[fieldName] || "" : "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const element = doc.body.firstElementChild;
    if (element) {
      const style = element.style;
      const computedStyle = window.getComputedStyle(element);
      if (style.fontSize) currentFontSize.value = style.fontSize;
      if (style.fontFamily) currentFontFamily.value = style.fontFamily;
      if (style.color) currentColor.value = style.color;
      // if (style.textAlign) {
      //   editor.value?.chain().focus().setTextAlign(style.textAlign).run();
      // }
      if (
        computedStyle.fontWeight === "bold" ||
        computedStyle.fontWeight >= 500
      ) {
        editor.value?.chain().focus().toggleBold().run();
      }
      if (computedStyle.fontStyle === "italic") {
        editor.value?.chain().focus().toggleItalic().run();
      }
      if (computedStyle.textDecoration.includes("underline")) {
        editor.value?.chain().focus().toggleUnderline().run();
      }
      if (computedStyle.textDecoration.includes("line-through")) {
        editor.value?.chain().focus().toggleStrike().run();
      }
    }
  }

  editor.value.on("selectionUpdate", () => {
    updateHeadingState();
  });
  editor.value.on("transaction", () => {
    updateHeadingState();
  });
  setTimeout(() => {
    updateHeadingState();
  }, 100);
});

const updateFormatState = (editor) => {
  const attrs = editor.getAttributes("textStyle");
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const element = range.startContainer.parentElement;
    const computedStyle = window.getComputedStyle(element);
    currentFontSize.value = computedStyle.fontSize;
    currentFontFamily.value = computedStyle.fontFamily
      .split(",")[0]
      .replace(/['"]/g, "");
    if (computedStyle.color) {
      const color = computedStyle.color;
      if (color.startsWith("rgb")) {
        const rgb = color.match(/\d+/g);
        if (rgb) {
          const hex =
            "#" +
            rgb
              .map((x) => {
                const hex = parseInt(x).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
              })
              .join("");
          currentColor.value = hex;
        }
      } else {
        currentColor.value = color;
      }
    }
  }
  if (attrs.fontFamily) currentFontFamily.value = attrs.fontFamily;
  if (attrs.color) {
    const color = attrs.color;
    if (color.startsWith("rgb")) {
      const rgb = color.match(/\d+/g);
      if (rgb) {
        const hex =
          "#" +
          rgb
            .map((x) => {
              const hex = parseInt(x).toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            })
            .join("");
        currentColor.value = hex;
      }
    } else {
      currentColor.value = color;
    }
  }
};

// const updateFormatState = (editor) => {
//   const attrs = editor.getAttributes("textStyle");
//   if (attrs.fontSize) currentFontSize.value = attrs.fontSize;
//   if (attrs.fontFamily) currentFontFamily.value = attrs.fontFamily;
//   if (attrs.color) {
//     const color = attrs.color;
//     if (color.startsWith("rgb")) {
//       const rgb = color.match(/\d+/g);
//       if (rgb) {
//         const hex =
//           "#" +
//           rgb
//             .map((x) => {
//               const hex = parseInt(x).toString(16);
//               return hex.length === 1 ? "0" + hex : hex;
//             })
//             .join("");
//         currentColor.value = hex;
//       }
//     } else {
//       currentColor.value = color;
//     }
//   }
// };

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result;
      editor.value
        ?.chain()
        .focus()
        .setImage({
          src: base64String,
          "data-file": file.name,
        })
        .run();
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  } catch (error) {
    console.error("Error handling image:", error);
    alert("Failed to handle image");
  }
};

onBeforeUnmount(() => {
  editor.value?.destroy();
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value) {
      const fieldName = getCurrentFieldName();
      if (fieldName && newValue[fieldName]) {
        const content = newValue[fieldName];
        const isSame = content === editor.value.getHTML();
        if (!isSame) {
          editor.value.commands.setContent(content);
        }
      }
    }
  },
  { deep: true }
);

const currentLanguage = ref(props.languageConfig[0]?.code || "en");
const languageContent = reactive({
  en: "",
  zh: "",
  ms: "",
  th: "",
});

const insertTable = () => {
  editor.value
    ?.chain()
    .focus()
    .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
    .run();
};

const getCurrentFieldName = () => {
  const lang = props.languageConfig.find(
    (l) => l.code === currentLanguage.value
  );
  return lang?.field || "";
};

const switchLanguage = () => {
  if (editor.value) {
    const fieldName = getCurrentFieldName();
    const content = fieldName ? props.modelValue[fieldName] || "" : "";
    editor.value.commands.setContent(content);
  }
};

const getCurrentLanguageName = () => {
  const lang = props.languageConfig.find(
    (l) => l.code === currentLanguage.value
  );
  return lang ? lang.name : currentLanguage.value;
};

const adjustRowHeight = () => {
  if (!editor.value?.isActive("tableRow")) return;
  const currentHeight = editor.value.getAttributes("tableRow").height || "";
  const currentValue = currentHeight ? parseInt(currentHeight) : "";
  const input = prompt(
    "Enter row height (number only, will be applied as px):",
    currentValue
  );
  if (input !== null) {
    const numValue = parseInt(input);
    if (!isNaN(numValue)) {
      const newHeight = `${numValue}px`;
      editor.value
        .chain()
        .focus()
        .updateAttributes("tableRow", { height: newHeight })
        .run();
    } else if (input.trim() !== "") {
      alert("Please enter a valid number");
    }
  }
};

const CustomTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (element) => element.style.height || null,
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return { style: `height: ${attributes.height}` };
        },
      },
    };
  },
});

const adjustColumnWidth = () => {
  if (!editor.value?.isActive("tableCell")) return;
  const currentWidth = editor.value.getAttributes("tableCell").width || "";
  const currentValue = currentWidth ? parseInt(currentWidth) : "";
  const input = prompt(
    "Enter column width (number only, will be applied as px):",
    currentValue
  );
  if (input !== null) {
    const numValue = parseInt(input);
    if (!isNaN(numValue)) {
      const newWidth = `${numValue}px`;
      editor.value
        .chain()
        .focus()
        .updateAttributes("tableCell", { width: newWidth })
        .run();
    } else if (input.trim() !== "") {
      alert("Please enter a valid number");
    }
  }
};

const CustomTableCell = TableCell.extend({
  addAttributes() {
    const attrs = this.parent?.() || {};

    return {
      ...attrs,
      width: {
        default: null,
        parseHTML: (element) => element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            style: `width: ${attributes.width} ; min-width: ${attributes.width} `,
          };
        },
      },
    };
  },
});

const removeColor = () => {
  editor.value?.chain().focus().unsetMark("textStyle").run();
  currentColor.value = "#000000";
};

const insertLink = () => {
  const url = prompt("URL", "https://");
  if (!url) return;
  const { state } = editor.value;
  const { from, to } = state.selection;
  const selectedText = state.doc.textBetween(from, to, "");
  if (selectedText) {
    editor.value
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .unsetMark("link")
      .command(({ tr, dispatch }) => {
        if (dispatch) {
          tr.setSelection(new TextSelection(tr.doc.resolve(to)));
          return true;
        }
        return false;
      })
      .run();
  } else {
    const text = prompt("Link text", "");
    if (text) {
      const linkHTML = `<a href="${url}">${text}</a>`;
      editor.value
        ?.chain()
        .focus()
        .insertContent(linkHTML)
        .command(({ tr, dispatch }) => {
          if (dispatch) {
            const pos = tr.selection.$anchor.pos;
            tr.setSelection(new TextSelection(tr.doc.resolve(pos)));
            return true;
          }
          return false;
        })
        .unsetMark("link")
        .run();
    }
  }
};

const editLink = () => {
  const previousUrl = editor.value?.getAttributes("link").href;
  const url = prompt("URL", previousUrl);
  if (url === null) {
    return;
  }
  if (url === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor.value
    ?.chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};

const removeLink = () => {
  editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
};

const currentHeadingLevel = ref("0");
const setHeadingLevel = () => {
  editor.value?.chain().focus();
  if (currentHeadingLevel.value === "0") {
    editor.value?.chain().setParagraph().run();
  } else {
    editor.value
      ?.chain()
      .setHeading({
        level: parseInt(currentHeadingLevel.value),
      })
      .run();
  }
  editor.value?.commands.focus();
};
const updateHeadingState = () => {
  currentHeadingLevel.value = "0";
  for (let i = 1; i <= 6; i++) {
    if (editor.value?.isActive("heading", { level: i })) {
      currentHeadingLevel.value = i.toString();
      break;
    }
  }
};
</script>

<style>
.ProseMirror {
  outline: none;
  min-height: 200px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.ProseMirror img {
  max-width: 20%;
  height: auto;
  margin: 1em 0;
  cursor: pointer;
}

.ProseMirror img.ProseMirror-selectednode {
  outline: 2px solid #4299e1;
}

.ProseMirror table {
  border-collapse: collapse;
  table-layout: fixed;

  margin: 0;
  overflow: hidden;
}

.ProseMirror td,
.ProseMirror th {
  min-width: 1em;
  border: 2px solid #ced4da;
  padding: 3px 5px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}

.ProseMirror th {
  font-weight: bold;
  background-color: #f1f3f5;
}

.ProseMirror .selectedCell:after {
  z-index: 2;
  position: absolute;
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}

.multilang-indicator {
  font-size: 10px;
  color: #888;
  margin-left: 5px;
}

.ProseMirror table tr {
  height: auto;
}

.ProseMirror table tr[style*="height"] {
  display: table-row;
}

.ProseMirror table td[style*="width"],
.ProseMirror table th[style*="width"] {
  overflow: visible;
  max-width: none;
}

.ProseMirror [style*="color: white"],
.ProseMirror [style*="color: #fff"],
.ProseMirror [style*="color: #ffffff"] {
  background-color: #f0f0f0;
}

.ProseMirror h1 {
  font-size: 2em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #111;
}

.ProseMirror h2 {
  font-size: 1.75em;
  font-weight: bold;
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  color: #222;
}

.ProseMirror h3 {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.6em;
  margin-bottom: 0.3em;
  color: #333;
}

.ProseMirror h4 {
  font-size: 1.25em;
  font-weight: bold;
  margin-top: 0.4em;
  margin-bottom: 0.2em;
  color: #444;
}

.ProseMirror h5 {
  font-size: 1.1em;
  font-weight: bold;
  margin-top: 0.3em;
  margin-bottom: 0.1em;
  color: #555;
}

.ProseMirror h6 {
  font-size: 1em;
  font-weight: bold;
  font-style: italic;
  margin-top: 0.2em;
  margin-bottom: 0.1em;
  color: #666;
}

.ProseMirror ul {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.ProseMirror ol {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.ProseMirror li {
  margin: 0.25em 0;
}

.ProseMirror ul ul {
  list-style-type: circle;
}

.ProseMirror ul ul ul {
  list-style-type: square;
}

.ProseMirror li > p {
  margin: 0;
}

.ProseMirror li > ul,
.ProseMirror li > ol {
  margin: 0.25em 0;
}
</style>

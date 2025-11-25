import TextStyle from "@tiptap/extension-text-style";

export const CustomTextStyle = TextStyle.extend({
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
});

export const useCustomEditor = () => {
  const setFontSize = (editor, size) => {
    editor?.chain().focus().setMark("textStyle", { fontSize: size }).run();
  };

  return {
    CustomTextStyle,
    setFontSize,
  };
};

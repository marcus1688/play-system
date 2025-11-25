export function useModalBackdrop(closeCallback) {
  let isBackdropDown = false;

  const onBackdropDown = () => {
    isBackdropDown = true;
  };

  const onBackdropUp = () => {
    if (isBackdropDown) {
      closeCallback();
    }
    isBackdropDown = false;
  };

  const resetBackdropState = () => {
    isBackdropDown = false;
  };

  onMounted(() => {
    document.addEventListener("pointerup", resetBackdropState);
    document.addEventListener("pointercancel", resetBackdropState);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("pointerup", resetBackdropState);
    document.removeEventListener("pointercancel", resetBackdropState);
  });

  return {
    onBackdropDown,
    onBackdropUp,
  };
}

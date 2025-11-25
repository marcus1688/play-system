export const useNotification = () => {
  const notificationState = useState("notification", () => ({
    visible: false,
    title: "",
    message: "",
  }));
  const showNotification = (title, message) => {
    notificationState.value = {
      visible: true,
      title,
      message,
    };
    setTimeout(() => {
      notificationState.value.visible = false;
    }, 5000);
  };
  watch(
    () => notificationState.value.visible,
    (newVisible) => {
      if (newVisible) {
        setTimeout(() => {
          notificationState.value.visible = false;
        }, 5000);
      }
    }
  );
  return {
    notificationState,
    showNotification,
  };
};

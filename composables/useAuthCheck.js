export const useAuthCheck = () => {
  const userData = useState("userData");
  const checkAuth = async () => {
    if (!userData.value) {
      await Swal.fire({
        icon: "warning",
        title: "Please Login",
        text: "You need to login first to access your account.",
        confirmButtonText: "OK",
      });
      return false;
    }
    return true;
  };

  return {
    checkAuth,
  };
};

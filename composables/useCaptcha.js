export function useCaptcha(locale) {
  let captcha = null;

  const loadCaptchaScript = () => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js";
    document.head.appendChild(script);
  };

  function getInstance(instance) {
    captcha = instance;
  }

  const initCaptcha = (captchaVerifyCallback) => {
    if (!window.initAliyunCaptcha) {
      console.error("证码脚本未正确加载");
      return;
    }
    window.initAliyunCaptcha({
      SceneId: "1cuaaayqn",
      prefix: "4nhdk4q",
      mode: "popup",
      element: "#captcha-element",
      button: null,
      captchaVerifyCallback: captchaVerifyCallback,
      getInstance: getInstance,
      language: locale?.value === "zh" ? "cn" : "en",
      region: "sgp",
    });
  };

  async function validateCaptcha(captchaVerifyParam) {
    try {
      const response = await fetch(
        "https://api.mysteryclub88.com/api/verify-captcha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            captchaVerifyParam: captchaVerifyParam,
          }),
        }
      );

      const data = await response.json();
      return {
        success: data.success,
        verifyResult: data.result?.verifyResult || false,
        verifyCode: data.result?.verifyCode,
      };
    } catch (error) {
      console.error("Captcha validation error:", error);
      return {
        success: false,
        verifyResult: false,
      };
    }
  }

  const getCaptcha = () => captcha;

  return {
    loadCaptchaScript,
    getInstance,
    initCaptcha,
    validateCaptcha,
    getCaptcha,
  };
}

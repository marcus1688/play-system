// 生产环境使用的API URL
// const APIURL = "https://api.pw66.club/api/";

// 开发环境使用的API URLs
const APIURL = "http://localhost:3001/api/";
export default defineNuxtConfig({
  ssr: true,

  alias: {
    "@": "/assets",
  },

  app: {
    head: {
      charset: "utf-8",
      viewport:
        "width=device-width, initial-scale=1, user-scalable=no,viewport-fit=cover",
      title: "Play System",
      script: [
        {
          src: "https://cdn.lordicon.com/lordicon.js",
          defer: true,
        },
      ],
      meta: [
        {
          name: "description",
          content: "Test",
        },
        {
          name: "keywords",
          content: "Test",
        },
        {
          name: "author",
          content: "Test",
        },
        {
          property: "og:title",
          content: "Test",
        },
        {
          property: "og:description",
          content: "Test",
        },
        {
          property: "og:site_name",
          content: "Test",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css",
        },

        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
        },
      ],
    },
  },

  css: ["~/assets/css/styles.scss"],

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    public: { apiUrl: APIURL },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    "@nuxt/image",
    "@nuxtjs/i18n",
    "nuxt-marquee",
    "@nuxtjs/google-fonts",
    "@nuxtjs/turnstile",
  ],

  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY,
  },

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
    },
    display: "swap",
    download: false,
    preload: true,
  },

  i18n: {
    locales: [
      {
        code: "en",
        name: "English",
        file: "en.json",
      },
      {
        code: "zh",
        name: "Chinese",
        file: "zh.json",
      },
    ],
    defaultLocale: "en",
    langDir: "locales",
    lazy: false,
    detectBrowserLanguage: false,
    strategy: "prefix_except_default",
  },

  compatibilityDate: "2024-12-19",
});

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.vue",
    "./error.vue",
    "./layouts/**/*.vue",
    "./nuxt.config.{js,ts}",
    "./components/**/*.vue",
  ],
  theme: {},
  plugins: [require("daisyui")],
};

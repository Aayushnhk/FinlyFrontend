/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./src/components/**/*.{js,jsx,ts,tsx}",
      "./src/pages/**/*.{js,jsx,ts,tsx}",
      "./index.html", // Important to include your main HTML file
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
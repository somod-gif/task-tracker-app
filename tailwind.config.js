/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sprintdesk: {
          primary: "#0178D3",
          secondary: "#058BE2",
          accent: "#14A1EF",
          highlight: "#1BB9F5",
          white: "#FFFFFF",
          background: "#F7FAFC",
          border: "#E5E7EB",
        },
      },
    },
  },
  plugins: [],
};

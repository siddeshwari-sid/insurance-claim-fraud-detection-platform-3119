/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060A",
          900: "#0B1020",
          850: "#10122B",
          800: "#131531"
        }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        glow: "0 10px 30px rgba(124,58,237,0.25)",
        "glow-sm": "0 6px 16px rgba(124,58,237,0.22)"
      },
      backgroundImage: {
        "app-radial":
          "radial-gradient(1200px circle at 15% -10%, rgba(124,58,237,0.30), transparent 55%), radial-gradient(900px circle at 85% 0%, rgba(34,211,238,0.18), transparent 55%)",
        "surface-gradient":
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        "primary-gradient":
          "linear-gradient(90deg, #7C3AED 0%, #4F46E5 55%, #22D3EE 120%)"
      }
    }
  },
  plugins: []
};

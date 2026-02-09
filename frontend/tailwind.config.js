/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': "#5F6FFF",
        'cyber-black': "#0A0A0F",
        'cyber-dark': "#12121A",
        'neon-cyan': "#00F2FF",
        'neon-purple': "#BD00FF",
        'glass-bg': "rgba(255, 255, 255, 0.05)",
        'glass-border': "rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        'hero-gradient': "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0f 100%)",
        'neon-gradient': "linear-gradient(90deg, #00F2FF 0%, #BD00FF 100%)",
      },
      boxShadow: {
        'neon-glow': "0 0 15px rgba(0, 242, 255, 0.5)",
        'neon-purple-glow': "0 0 15px rgba(189, 0, 255, 0.5)",
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fill, minmax(200px, 1fr))'
      }
    },
  },
  plugins: [],
}
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sncf-red': '#C1002A',
        'sncf-blue': '#003C8F',
        'sncf-gray': '#4A4A4A',
      },
    },
  },
  plugins: [],
}
export default config
// tailwind.config.js
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          primary:  '#2076FF',
          accent:   '#FF6C4C',
          surface:  '#F5F7FA',
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui'],
          display: ['Lilita One', 'cursive'],
        },
      },
    },
  };
  
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        /* Ejemplo de tokens -> cámbialos por los de tu Figma
        colors: {
          primary:   '#217aff',
          accent:    '#ff6b00',
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        },
        */
      },
    },
    plugins: [],
  };
  
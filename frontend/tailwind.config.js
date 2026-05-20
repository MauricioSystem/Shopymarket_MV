/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                glow: '0 24px 80px -24px rgba(15, 23, 42, 0.45)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
                    '50%': { transform: 'translate3d(0, -10px, 0)' },
                },
                fadeUp: {
                    '0%': { opacity: 0, transform: 'translate3d(0, 18px, 0)' },
                    '100%': { opacity: 1, transform: 'translate3d(0, 0, 0)' },
                },
            },
            animation: {
                float: 'float 7s ease-in-out infinite',
                fadeUp: 'fadeUp 0.7s ease-out both',
            },
        },
    },
    plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Canva-like colors can be added here
                'canva-teal': '#00c4cc',
                'canva-purple': '#7d2ae8',
            }
        },
    },
    plugins: [],
}

import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Habilita el modo oscuro basado en clases
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.vue',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    light: '#3b82f6', // blue-500
                    DEFAULT: '#2563eb', // blue-600
                    dark: '#1d4ed8',   // blue-700
                },
                secondary: {
                    light: '#94a3b8', // slate-400
                    DEFAULT: '#64748b', // slate-500
                    dark: '#475569',   // slate-600
                },
                success: {
                    light: '#4ade80',  // green-400
                    DEFAULT: '#22c55e', // green-500
                    dark: '#16a34a',   // green-600
                },
                warning: {
                    light: '#facc15',  // yellow-400
                    DEFAULT: '#eab308', // yellow-500
                    dark: '#ca8a04',   // yellow-600
                },
                danger: {
                    light: '#f87171',  // red-400
                    DEFAULT: '#ef4444', // red-500
                    dark: '#dc2626',   // red-600
                },
            },
        },
    },

    plugins: [forms],
};

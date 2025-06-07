import { ref, onMounted, watch } from 'vue';

export function useTheme() {
    const darkMode = ref(false);

    const getTheme = () => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('dark-mode')) {
            return localStorage.getItem('dark-mode') === 'true';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const applyTheme = (isDark) => {
        darkMode.value = isDark;
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('dark-mode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('dark-mode', 'false');
        }
    };

    const toggleTheme = () => {
        applyTheme(!darkMode.value);
    };

    onMounted(() => {
        applyTheme(getTheme());

        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => applyTheme(e.matches);
        darkModeMediaQuery.addEventListener('change', handleChange);

        return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    });

    return {
        darkMode,
        toggleTheme
    };
}

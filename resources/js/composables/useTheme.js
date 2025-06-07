import { ref, onMounted, watch } from 'vue';

export function useTheme() {
    const darkMode = ref(false);

    // Verificar el tema guardado o la preferencia del sistema
    const getTheme = () => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('dark-mode')) {
            return localStorage.getItem('dark-mode') === 'true';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    // Aplicar las clases de tema
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

    // Alternar entre temas
    const toggleTheme = () => {
        applyTheme(!darkMode.value);
    };

    // Inicializar el tema
    onMounted(() => {
        applyTheme(getTheme());
        
        // Escuchar cambios en la preferencia del sistema
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

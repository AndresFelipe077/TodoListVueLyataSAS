import '../css/app.css';

import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';
import { ZiggyVue } from 'ziggy-js';
import { initializeTheme } from './composables/useAppearance';
import api from './lib/axios';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import globalComponents from '@/config/globalComponents';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.vue`, import.meta.glob<DefineComponent>('./pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) });

        // Initialize toast plugin
        app.use(VueToast, {
            position: 'top-right',
            duration: 3000,
            dismissible: true,
            container: '#toast-container'
        });

        // Make toast available globally
        window.Toast = app.config.globalProperties.$toast;

        // Registrar componentes globales
        app.use(globalComponents);

        app.use(plugin)
           .use(ZiggyVue)
           .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();

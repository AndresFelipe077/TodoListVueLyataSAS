<script setup lang="ts">
import { ref, computed } from 'vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { Plus, Sun, Moon, Calendar } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';

// Configuración del tema
const { darkMode, toggleTheme } = useTheme();

const props = defineProps<{
    tasks: Array<{
        id: number;
        title: string;
        description: string | null;
        completed: boolean;
        due_date: string | null;
        priority: 'low' | 'medium' | 'high';
        created_at: string;
        updated_at: string;
    }>;
}>();

const activeTab = ref<'all' | 'completed' | 'pending'>('all');
const showForm = ref(false);
const showDeleteModal = ref(false);
const editingTask = ref<number | null>(null);
const taskToDelete = ref<any>(null);

const form = useForm({
    id: null as number | null,
    title: '',
    description: '',
    due_date: null as string | null,
    priority: 'medium' as 'low' | 'medium' | 'high',
});

// Filtrar tareas según la pestaña activa
const filteredTasks = computed(() => {
    if (activeTab.value === 'completed') {
        return props.tasks.filter(task => task.completed);
    } else if (activeTab.value === 'pending') {
        return props.tasks.filter(task => !task.completed);
    }
    return props.tasks;
});

// Abrir formulario para nueva tarea
const openNewTaskForm = () => {
    form.reset();
    form.clearErrors();
    editingTask.value = null;
    showForm.value = true;
};

// Editar tarea
const editTask = (task: any) => {
    form.id = task.id;
    form.title = task.title;
    form.description = task.description;
    form.due_date = task.due_date;
    form.priority = task.priority;
    editingTask.value = task.id;
    showForm.value = true;
};

// Enviar formulario
const submitForm = () => {
    if (form.id) {
        form.put(route('tasks.update', form.id), {
            onSuccess: () => {
                showForm.value = false;
                form.reset();
            },
            preserveScroll: true,
        });
    } else {
        form.post(route('tasks.store'), {
            onSuccess: () => {
                showForm.value = false;
                form.reset();
            },
            preserveScroll: true,
        });
    }
};

// Cambiar estado de la tarea
const toggleTaskStatus = (task: any) => {
    router.patch(route('tasks.toggle', task.id), {}, {
        preserveScroll: true,
    });
};

// Abrir modal de confirmación para eliminar tarea
const confirmDelete = (task: any) => {
    taskToDelete.value = task;
    showDeleteModal.value = true;
};

// Cerrar modal de confirmación
const closeDeleteModal = () => {
    showDeleteModal.value = false;
    taskToDelete.value = null;
};

// Eliminar tarea confirmada
const deleteTask = () => {
    if (taskToDelete.value) {
        router.delete(route('tasks.destroy', taskToDelete.value.id), {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal()
        });
    }
};

// Formatear fecha
const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Obtener clases de prioridad
const getPriorityClasses = (priority: string) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'low':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-200">

        <Head title="Dashboard" />

        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div
                class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg p-6 transition-colors duration-200">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Lista de Tareas</h2>
                    <button @click="toggleTheme"
                        class="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        :title="darkMode ? 'Modo Claro' : 'Modo Oscuro'">
                        <Moon v-if="!darkMode" class="w-5 h-5" />
                        <Sun v-else class="w-5 h-5" />
                    </button>
                </div>

                <!-- Filtros y botón de nueva tarea -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button @click="activeTab = 'all'" :class="[
                            'px-4 py-2 rounded-lg transition-all duration-200',
                            activeTab === 'all'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        ]">
                            Todas
                        </button>
                        <button @click="activeTab = 'pending'" :class="[
                            'px-4 py-2 rounded-lg transition-all duration-200',
                            activeTab === 'pending'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        ]">
                            Pendientes
                        </button>
                        <button @click="activeTab = 'completed'" :class="[
                            'px-4 py-2 rounded-lg transition-all duration-200',
                            activeTab === 'completed'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        ]">
                            Completadas
                        </button>
                    </div>

                    <button @click="openNewTaskForm"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                        <Plus class="w-4 h-4 mr-1" />
                        Nueva Tarea
                    </button>
                </div>

                <!-- Formulario de tarea -->
                <div v-if="showForm"
                    class="mb-6 p-6 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md transition-all duration-200">
                    <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        {{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}
                    </h3>

                    <form @submit.prevent="submitForm" class="space-y-4">
                        <!-- Título -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título <span class="text-red-500">*</span>
                            </label>
                            <input v-model="form.title" type="text"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                                required />
                            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600">
                                {{ form.errors.title }}
                            </p>
                        </div>

                        <!-- Descripción -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descripción
                            </label>
                            <textarea v-model="form.description" rows="3"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"></textarea>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Fecha límite -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha límite
                                </label>
                                <input v-model="form.due_date" type="date"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200" />
                            </div>

                            <!-- Prioridad -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prioridad
                                </label>
                                <select v-model="form.priority"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200">
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>
                        </div>

                        <!-- Acciones del formulario -->
                        <div class="flex justify-end space-x-3 pt-2">
                            <button type="button" @click="showForm = false"
                                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                                :disabled="form.processing">
                                {{ editingTask ? 'Actualizar' : 'Crear' }} Tarea
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Lista de tareas -->
                <div v-if="filteredTasks.length > 0" class="space-y-3">
                    <div v-for="task in filteredTasks" :key="task.id" :class="[
                        'border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-200',
                        task.completed
                            ? 'bg-gray-50 dark:bg-gray-700/50'
                            : 'bg-white dark:bg-gray-800 hover:shadow-md hover:-translate-y-0.5',
                        'hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50'
                    ]">
                        <div class="flex justify-between items-start">
                            <!-- Checkbox y contenido -->
                            <div class="flex items-start space-x-3">
                                <button @click="toggleTaskStatus(task)" :class="[
                                    'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-colors',
                                    task.completed
                                        ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600'
                                        : 'border-gray-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500'
                                ]" :title="task.completed ? 'Marcar como pendiente' : 'Marcar como completada'">
                                    <Check v-if="task.completed" class="w-3 h-3 text-white mx-auto" />
                                </button>

                                <div class="min-w-0 flex-1">
                                    <!-- Título y estado -->
                                    <div class="flex items-center">
                                        <h3 :class="[
                                            'font-medium truncate',
                                            task.completed
                                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                                : 'text-gray-900 dark:text-white'
                                        ]">
                                            {{ task.title }}
                                        </h3>

                                        <!-- Badge de prioridad -->
                                        <span v-if="task.priority" :class="[
                                            'ml-2 px-2 py-0.5 text-xs rounded-full font-medium',
                                            getPriorityClasses(task.priority),
                                            task.completed ? 'opacity-70' : ''
                                        ]">
                                            {{
                                                task.priority === 'high' ? 'Alta' :
                                                    task.priority === 'medium' ? 'Media' : 'Baja'
                                            }}
                                        </span>
                                    </div>

                                    <!-- Descripción -->
                                    <p v-if="task.description"
                                        class="text-gray-600 dark:text-gray-300 text-sm mt-1 break-words">
                                        {{ task.description }}
                                    </p>

                                    <!-- Fecha y acciones -->
                                    <div class="flex items-center justify-between mt-2 text-sm">
                                        <!-- Fecha -->
                                        <div v-if="task.due_date"
                                            class="text-gray-500 dark:text-gray-400 flex items-center">
                                            <Calendar class="w-4 h-4 mr-1" />
                                            {{ formatDate(task.due_date) }}
                                        </div>
                                        <div v-else class="flex-1"></div>

                                        <!-- Fecha de creación -->
                                        <div class="text-xs text-gray-400 dark:text-gray-500">
                                            Creada: {{ formatDate(task.created_at) }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Acciones -->
                            <div class="flex space-x-1">
                                <button @click="editTask(task)"
                                    class="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                    title="Editar tarea">
                                    <Pencil class="w-4 h-4" />
                                </button>
                                <button @click="confirmDelete(task)"
                                    class="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                                    title="Eliminar tarea">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mensaje cuando no hay tareas -->
                <div v-else
                    class="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200">
                    <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                        </path>
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No hay tareas
                    </h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {{
                            activeTab === 'all'
                                ? 'Comienza agregando una nueva tarea.'
                                : activeTab === 'completed'
                                    ? 'No hay tareas completadas.'
                                    : '¡Genial! No tienes tareas pendientes.'
                        }}
                    </p>
                    <div class="mt-6">
                        <button @click="openNewTaskForm" type="button"
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <Plus class="-ml-1 mr-2 h-4 w-4" />
                            Nueva Tarea
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div class="flex items-center mb-4">
                <div
                    class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                    <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                    ¿Eliminar tarea?
                </h3>
            </div>
            <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    ¿Estás seguro de que deseas eliminar la tarea "{{ taskToDelete?.title }}"? Esta acción no se puede
                    deshacer.
                </p>
            </div>
            <div class="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button type="button" @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    Cancelar
                </button>
                <button type="button" @click="deleteTask"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
                    Eliminar
                </button>
            </div>
        </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">¿Eliminar tarea?</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
                ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
            </p>
            <div class="flex justify-end space-x-3">
                <button type="button" @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    Cancelar
                </button>
                <button type="button" @click="deleteTask"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
                    Eliminar
                </button>
            </div>
        </div>
    </div>
</template>

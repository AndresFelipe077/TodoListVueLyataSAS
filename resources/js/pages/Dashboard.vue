<script setup lang="ts">
import { ref, computed } from 'vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { Plus, Pencil, Trash, Check, Loader2 } from 'lucide-vue-next';

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
const editingTask = ref<number | null>(null);

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

// Eliminar tarea
const deleteTask = (task: any) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        router.delete(route('tasks.destroy', task.id), {
            preserveScroll: true,
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
    <div class="py-12">
        <Head title="Dashboard" />
        
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                <div class="mb-6">
                    <h2 class="text-2xl font-bold mb-4">Lista de Tareas</h2>
                    
                    <!-- Filtros y botón de nueva tarea -->
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex space-x-2">
                            <button 
                                @click="activeTab = 'all'" 
                                :class="[
                                    'px-4 py-2 rounded transition-colors',
                                    activeTab === 'all' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 hover:bg-gray-300'
                                ]"
                            >
                                Todas
                            </button>
                            <button 
                                @click="activeTab = 'pending'"
                                :class="[
                                    'px-4 py-2 rounded transition-colors',
                                    activeTab === 'pending'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                ]"
                            >
                                Pendientes
                            </button>
                            <button 
                                @click="activeTab = 'completed'"
                                :class="[
                                    'px-4 py-2 rounded transition-colors',
                                    activeTab === 'completed'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                ]"
                            >
                                Completadas
                            </button>
                        </div>
                        
                        <button 
                            @click="openNewTaskForm"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center transition-colors"
                        >
                            <Plus class="w-4 h-4 mr-1" />
                            Nueva Tarea
                        </button>
                    </div>

                    <!-- Formulario de tarea -->
                    <div v-if="showForm" class="mb-6 p-6 border rounded-lg bg-gray-50">
                        <h3 class="text-lg font-semibold mb-4">
                            {{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}
                        </h3>
                        
                        <form @submit.prevent="submitForm" class="space-y-4">
                            <!-- Título -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Título <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    v-model="form.title"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    :class="{ 'border-red-500': form.errors.title }"
                                    required
                                >
                                <p v-if="form.errors.title" class="mt-1 text-sm text-red-600">
                                    {{ form.errors.title }}
                                </p>
                            </div>

                            <!-- Descripción -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea 
                                    v-model="form.description"
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Fecha límite -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha límite
                                    </label>
                                    <input 
                                        v-model="form.due_date"
                                        type="date"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                </div>

                                <!-- Prioridad -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridad
                                    </label>
                                    <select 
                                        v-model="form.priority"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Acciones del formulario -->
                            <div class="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    @click="showForm = false"
                                    class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    :disabled="form.processing"
                                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Loader2 v-if="form.processing" class="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    {{ editingTask ? 'Actualizar' : 'Crear' }}
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Lista de tareas -->
                    <div v-if="filteredTasks.length > 0" class="space-y-3">
                        <div 
                            v-for="task in filteredTasks" 
                            :key="task.id"
                            :class="[
                                'border rounded-lg p-4 transition-all',
                                task.completed ? 'bg-gray-50' : 'bg-white hover:shadow-md'
                            ]"
                        >
                            <div class="flex justify-between items-start">
                                <!-- Checkbox y contenido -->
                                <div class="flex items-start space-x-3">
                                    <button 
                                        @click="toggleTaskStatus(task)"
                                        :class="[
                                            'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-colors',
                                            task.completed 
                                                ? 'bg-green-500 border-green-500' 
                                                : 'border-gray-300 hover:border-blue-400'
                                        ]"
                                        :title="task.completed ? 'Marcar como pendiente' : 'Marcar como completada'"
                                    >
                                        <Check v-if="task.completed" class="w-3 h-3 text-white mx-auto" />
                                    </button>
                                    
                                    <div class="min-w-0">
                                        <!-- Título y estado -->
                                        <div class="flex items-center">
                                            <h3 
                                                :class="[
                                                    'font-medium truncate',
                                                    task.completed 
                                                        ? 'text-gray-500 line-through' 
                                                        : 'text-gray-900'
                                                ]"
                                            >
                                                {{ task.title }}
                                            </h3>
                                            
                                            <!-- Badge de prioridad -->
                                            <span 
                                                v-if="task.priority"
                                                :class="[
                                                    'ml-2 px-2 py-0.5 text-xs rounded-full',
                                                    getPriorityClasses(task.priority)
                                                ]"
                                            >
                                                {{ 
                                                    task.priority === 'high' ? 'Alta' : 
                                                    task.priority === 'medium' ? 'Media' : 'Baja' 
                                                }}
                                            </span>
                                        </div>
                                        
                                        <!-- Descripción -->
                                        <p 
                                            v-if="task.description" 
                                            class="text-gray-600 text-sm mt-1 break-words"
                                        >
                                            {{ task.description }}
                                        </p>
                                        
                                        <!-- Fecha y acciones -->
                                        <div class="flex items-center justify-between mt-2 text-sm">
                                            <!-- Fecha -->
                                            <div v-if="task.due_date" class="text-gray-500 flex items-center">
                                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                {{ formatDate(task.due_date) }}
                                            </div>
                                            <div v-else class="flex-1"></div>
                                            
                                            <!-- Fecha de creación -->
                                            <div class="text-xs text-gray-400">
                                                Creada: {{ formatDate(task.created_at) }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Acciones -->
                                <div class="flex space-x-1">
                                    <button 
                                        @click="editTask(task)"
                                        class="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                        title="Editar tarea"
                                    >
                                        <Pencil class="w-4 h-4" />
                                    </button>
                                    <button 
                                        @click="deleteTask(task)"
                                        class="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                        title="Eliminar tarea"
                                    >
                                        <Trash class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mensaje cuando no hay tareas -->
                    <div 
                        v-else 
                        class="text-center py-12 border-2 border-dashed rounded-lg"
                    >
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">
                            No hay tareas
                        </h3>
                        <p class="mt-1 text-sm text-gray-500">
                            {{ 
                                activeTab === 'all' 
                                    ? 'Comienza agregando una nueva tarea.' 
                                    : activeTab === 'completed' 
                                        ? 'No hay tareas completadas.' 
                                        : '¡Genial! No tienes tareas pendientes.'
                            }}
                        </p>
                        <div class="mt-6">
                            <button
                                @click="openNewTaskForm"
                                type="button"
                                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus class="-ml-1 mr-2 h-4 w-4" />
                                Nueva Tarea
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

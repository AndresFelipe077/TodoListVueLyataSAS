<script setup lang="ts">
declare global {
    interface Window {
        Toast: any;
    }
}

import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { ref, computed, nextTick, ComputedRef } from 'vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import 'vue-toast-notification/dist/theme-sugar.css';
import { Plus, Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';
import TodoList from '@/components/TodoList.vue';
import TodoForm from '@/components/TodoForm.vue';
import ModalDeleteTask from '@/components/ModalDeleteTask.vue';
import type { Task } from '@/models/Task';

const { darkMode, toggleTheme } = useTheme();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const props = defineProps<{
    tasks: Task[];
}>();

const loading = ref(false);

const transformedTasks = computed(() => {
    return props.tasks.map(task => ({
        ...task,
        is_completed: task.completed || false,
        completed: undefined
    } as Task));
});

const activeTab = ref<'all' | 'completed' | 'pending'>('all');
const showForm = ref(false);
const showDeleteModal = ref(false);
const taskToDelete = ref<{ id: number; title: string } | null>(null);

const form = useForm({
    id: null as number | null,
    title: '',
    description: '',
    due_date: null as string | null,
    priority: 'medium' as 'low' | 'medium' | 'high',
});

const filteredTasks: ComputedRef<Task[]> = computed(() => {
    if (activeTab.value === 'completed') {
        return transformedTasks.value.filter((task: Task) => task.is_completed);
    } else if (activeTab.value === 'pending') {
        return transformedTasks.value.filter((task: Task) => !task.is_completed);
    }
    return transformedTasks.value;
});

const openNewTaskForm = () => {
    form.reset();
    form.clearErrors();
    showForm.value = true;
};

const editTask = (task: Task) => {
    if (task.id) {
        form.id = task.id;
        form.title = task.title;
        form.description = task.description || '';
        form.due_date = task.due_date ? task.due_date.split('T')[0] : null;
        form.priority = task.priority as 'low' | 'medium' | 'high';
        showForm.value = true;

        nextTick(() => {
            const formElement = document.querySelector('form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
};

const submitForm = (formData: Task) => {
    if (formData.id) {
        router.post(route('tasks.update', formData.id), {
            title: formData.title,
            description: formData.description,
            due_date: formData.due_date,
            priority: formData.priority,
            _method: 'put'
        }, {
            onSuccess: () => {
                window.Toast.success('Tarea actualizada correctamente');
                showForm.value = false;
            },
            onError: () => {
                window.Toast.error('Error al actualizar la tarea. Por favor, intente nuevamente.');
            },
            preserveScroll: true,
        });
    } else {
        router.post(route('tasks.store'), {
            title: formData.title,
            description: formData.description,
            due_date: formData.due_date,
            priority: formData.priority
        }, {
            onSuccess: () => {
                window.Toast.success('Tarea creada correctamente');
                showForm.value = false;
            },
            onError: () => {
                window.Toast.error('Error al crear la tarea. Por favor, verifique los datos e intente nuevamente.');
            },
            preserveScroll: true,
        });
    }
};

const toggleTaskStatus = (taskId: number) => {
    if (!taskId) return;

    const task: Task | undefined = props.tasks.find((t: Task) => t.id === taskId);
    if (!task) return;

    const newStatus: boolean = !task.is_completed;

    router.patch(route('tasks.toggle', taskId), {
        is_completed: newStatus
    }, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
            window.Toast.success(`Tarea marcada como ${newStatus ? 'completada' : 'pendiente'}`);
        },
        onError: (errors) => {
            console.error('Error updating task status:', errors);
            window.Toast.error('Error al actualizar el estado de la tarea');
            router.reload({ only: ['tasks'] });
        }
    });
};

const confirmDelete = (taskId: number) => {
    const task: Task | undefined = props.tasks.find((t: Task) => t.id === taskId);
    if (task) {
        taskToDelete.value = { id: task.id!, title: task.title };
        showDeleteModal.value = true;
    }
};

const deleteTask = () => {
    if (!taskToDelete.value) return;

    const taskTitle: string = taskToDelete.value.title;

    router.delete(route('tasks.destroy', taskToDelete.value.id), {
        preserveScroll: true,
        onSuccess: () => {
            showDeleteModal.value = false;
            taskToDelete.value = null;
            window.Toast.success(`Tarea "${taskTitle}" eliminada correctamente`);
        },
        onError: (errors) => {
            window.Toast.error('Error al eliminar la tarea');
        }
    });
};
</script>

<template>

    <Head title="Dashboard" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
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

                <TodoForm v-if="showForm" :task="form.id ? form : null" :processing="form.processing"
                    @submit="submitForm" @cancel="showForm = false" />

                <div class="space-y-6">
                    <div v-if="filteredTasks.length > 0" class="space-y-4">
                        <TodoList :tasks="filteredTasks" :loading="loading" @edit="(task) => editTask(task as Task)"
                            @delete="(taskId) => confirmDelete(taskId as number)"
                            @toggle-status="(taskId) => toggleTaskStatus(taskId as number)" />
                    </div>

                    <div v-else class="text-center py-12 border-2 border-dashed border-border rounded-lg">
                        <svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                            </path>
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-foreground">
                            {{
                                activeTab === 'all'
                                    ? 'No hay tareas.'
                                    : activeTab === 'completed'
                                        ? 'No hay tareas completadas.'
                                        : '¡No hay tareas pendientes!'
                            }}
                        </h3>
                        <p class="mt-1 text-sm text-muted-foreground">
                            {{
                                activeTab === 'all'
                                    ? 'Comienza agregando una nueva tarea.'
                                    : activeTab === 'completed'
                                        ? 'Completa algunas tareas para verlas aquí.'
                                        : '¡Genial! No tienes tareas pendientes.'
                            }}
                        </p>
                        <div class="mt-6">
                            <button @click="openNewTaskForm" type="button"
                                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring">
                                <Plus class="-ml-1 mr-2 h-4 w-4" />
                                Nueva Tarea
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <ModalDeleteTask v-model:show="showDeleteModal" :task-title="taskToDelete?.title || ''" @confirm="deleteTask" />
    </AppLayout>
</template>

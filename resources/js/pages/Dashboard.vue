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
import taskService from '@/services/taskService';
import 'vue-toast-notification/dist/theme-sugar.css';
import { Plus, Sun, Moon, MessageSquare } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';
import TodoList from '@/components/TodoList.vue';
import TodoForm from '@/components/TodoForm.vue';
import ModalDeleteTask from '@/components/ModalDeleteTask.vue';
import AITaskChat from '@/Components/AITaskChat.vue';
import type { Task } from '@/models/Task';

const { darkMode, toggleTheme } = useTheme();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const handleTasksGenerated = (tasks: any[]) => {
    // Add the generated tasks to the form and show the form
    if (tasks && tasks.length > 0) {
        // You can process the tasks here before showing them
        // For example, you might want to map the fields to match your form
        showForm.value = true;
        showAIChat.value = false;

        // If you want to auto-fill the form with the first task
        if (tasks[0]) {
            const task = tasks[0];
            form.title = task.title || '';
            form.description = task.description || '';
            form.due_date = task.due_date || null;
            form.priority = task.priority || 'medium';
        }

        // Show a success message
        window.Toast.success(`Se generaron ${tasks.length} tareas. Revisa y ajusta los detalles.`);
    }
};

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
const showAIChat = ref(false);

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

const submitForm = async (formData: Task) => {
    try {
        if (formData.id) {
            await taskService.updateTask(formData.id, {
                title: formData.title,
                description: formData.description,
                due_date: formData.due_date,
                priority: formData.priority as 'low' | 'medium' | 'high'
            });
            window.Toast.success('Tarea actualizada correctamente');
        } else {
            await taskService.createTask({
                title: formData.title,
                description: formData.description,
                due_date: formData.due_date,
                priority: formData.priority as 'low' | 'medium' | 'high',
                completed: false
            });
            window.Toast.success('Tarea creada correctamente');
        }
        showForm.value = false;
        // Recargar las tareas después de actualizar/crear
        router.reload({ only: ['tasks'] });
    } catch (error) {
        const errorMessage = formData.id
            ? 'Error al actualizar la tarea. Por favor, intente nuevamente.'
            : 'Error al crear la tarea. Por favor, verifique los datos e intente nuevamente.';
        window.Toast.error(errorMessage);
        console.error('Error:', error);
    }
};

const toggleTaskStatus = async (taskId: number) => {
    if (!taskId) return;

    const task: Task | undefined = props.tasks.find((t: Task) => t.id === taskId);
    if (!task) return;

    const newStatus: boolean = !task.is_completed;

    try {
        await taskService.toggleTaskStatus(taskId);
        window.Toast.success(`Tarea marcada como ${newStatus ? 'completada' : 'pendiente'}`);
        // Recargar las tareas después de actualizar el estado
        router.reload({ only: ['tasks'] });
    } catch (error) {
        console.error('Error updating task status:', error);
        window.Toast.error('Error al actualizar el estado de la tarea');
        router.reload({ only: ['tasks'] });
    }
};

const confirmDelete = (taskId: number) => {
    const task: Task | undefined = props.tasks.find((t: Task) => t.id === taskId);
    if (task) {
        taskToDelete.value = { id: task.id!, title: task.title };
        showDeleteModal.value = true;
    }
};

const deleteTask = async () => {
    if (!taskToDelete.value) return;

    const taskTitle: string = taskToDelete.value.title;
    const taskId = taskToDelete.value.id;

    try {
        await taskService.deleteTask(taskId);
        showDeleteModal.value = false;
        taskToDelete.value = null;
        window.Toast.success(`Tarea "${taskTitle}" eliminada correctamente`);
        // Recargar las tareas después de eliminar
        router.reload({ only: ['tasks'] });
    } catch (error) {
        console.error('Error deleting task:', error);
        window.Toast.error('Error al eliminar la tarea');
    }
};
</script>

<template>
    <Head title="Dashboard" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <!-- Header -->
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestor de Tareas</h1>
                        <div class="flex items-center space-x-3">
                            <button
                                @click="openNewTaskForm"
                                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                <Plus class="w-4 h-4 mr-2" />
                                Nueva Tarea
                            </button>
                            <button
                                @click="toggleTheme"
                                class="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                :title="darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
                            >
                                <Sun v-if="darkMode" class="w-5 h-5" />
                                <Moon v-else class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="px-6 pt-4">
                    <div class="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                            v-for="tab in ['all', 'pending', 'completed']"
                            :key="tab"
                            @click="activeTab = tab"
                            class="px-4 py-2 text-sm font-medium transition-colors duration-200"
                            :class="{
                                'text-blue-600 border-b-2 border-blue-500': activeTab === tab,
                                'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': activeTab !== tab
                            }"
                        >
                            {{ tab === 'all' ? 'Todas' : tab === 'pending' ? 'Pendientes' : 'Completadas' }}
                        </button>
                    </div>
                </div>

                <!-- Todo Form -->
                <div class="px-6 py-4">
                    <TodoForm 
                        v-if="showForm" 
                        :task="form.id ? form : null" 
                        :processing="form.processing"
                        @submit="submitForm" 
                        @cancel="showForm = false" 
                    />
                </div>

                <!-- Task List -->
                <div class="px-6 pb-6">
                    <div class="space-y-4">
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
                                <button 
                                    @click="openNewTaskForm" 
                                    type="button"
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Plus class="-ml-1 mr-2 h-4 w-4" />
                                    Nueva Tarea
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Floating AI Chat Button -->
                <button
                    @click="showAIChat = !showAIChat"
                    class="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    :class="{ 'bg-green-500 hover:bg-green-600': showAIChat }"
                    aria-label="Chat de IA"
                >
                    <MessageSquare class="w-6 h-6" />
                </button>
            </div>
        </div>

        <!-- AI Chat Panel -->
        <transition
            enter-active-class="transform ease-out duration-300 transition"
            enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="showAIChat" class="fixed bottom-24 right-8 w-full max-w-md z-50">
                <AITaskChat @tasks-generated="handleTasksGenerated" />
            </div>
        </transition>

        <ModalDeleteTask v-model:show="showDeleteModal" :task-title="taskToDelete?.title || ''" @confirm="deleteTask" />
    </AppLayout>
</template>

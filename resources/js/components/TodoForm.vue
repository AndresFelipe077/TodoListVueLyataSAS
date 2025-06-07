<script setup lang="ts">
import { watch } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Task } from '@/models/Task';

const props = defineProps<{
    task: {
        id?: number | null;
        title: string;
        description: string;
        due_date: string | null;
        priority: 'low' | 'medium' | 'high';
    } | null;
    processing?: boolean;
}>();

const emit = defineEmits<{
    (e: 'submit', formData: Task): void;
    (e: 'cancel'): void;
}>();

const form = useForm({
    id: props.task?.id || null,
    title: props.task?.title || '',
    description: props.task?.description || '',
    due_date: props.task?.due_date || null,
    priority: props.task?.priority || 'medium',
});

const submitForm = () => {
    if (!form.title.trim()) {
        return;
    }

    emit('submit', form as Task);
};

const cancel = () => {
    emit('cancel');
};

watch(() => props.task, (newTask) => {
    if (newTask) {
        form.id = newTask.id || null;
        form.title = newTask.title;
        form.description = newTask.description;
        form.due_date = newTask.due_date;
        form.priority = newTask.priority;
    } else {
        form.reset();
    }
}, { immediate: true });
</script>

<template>
    <div
        class="mb-6 p-6 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md transition-all duration-200">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {{ form.id ? 'Editar Tarea' : 'Nueva Tarea' }}
        </h3>

        <form @submit.prevent="submitForm" class="space-y-4">
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

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                </label>
                <textarea v-model="form.description" rows="3"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha límite
                    </label>
                    <input v-model="form.due_date" type="date"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200" />
                </div>

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

            <div class="flex justify-end space-x-3 pt-2">
                <button type="button" @click="cancel"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    Cancelar
                </button>
                <button type="submit"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                    :disabled="form.processing">
                    {{ form.id ? 'Actualizar' : 'Crear' }} Tarea
                </button>
            </div>
        </form>
    </div>
</template>

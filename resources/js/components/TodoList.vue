<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Loader2 } from 'lucide-vue-next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Task } from '@/models/Task';

defineProps<{
    tasks: Task[];
    loading?: boolean;
}>();

const emit = defineEmits<{
    (e: 'edit', task: Task): void;
    (e: 'delete', taskId: number): void;
    (e: 'toggle-status', taskId: number): void;
}>();

const toggleComplete = (task: Task) => {
    emit('toggle-status', task.id!);
};

const handleDelete = (taskId: number) => {
    emit('delete', taskId);
};

const editTask = (task: Task) => {
    emit('edit', task);
};

const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric' as const,
        month: 'long' as const,
        day: 'numeric' as const,
        hour: '2-digit' as const,
        minute: '2-digit' as const,
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};
</script>

<template>
    <div class="space-y-4">
        <div v-if="loading" class="flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <div v-else-if="tasks.length === 0" class="text-center py-8 text-muted-foreground">
            No hay tareas. ¡Agrega una para comenzar!
        </div>

        <div v-else class="space-y-4">
            <Card v-for="task in tasks" :key="task.id" class="transition-all hover:shadow-md"
                :class="{ 'opacity-60': task.is_completed }">
                <CardHeader class="pb-2">
                    <div class="flex items-center justify-between">

                        <div class="flex items-center space-x-2 flex-1 min-w-0">
                            <div class="flex items-center">
                                <div class="flex items-center" @click.stop="toggleComplete(task)">
                                    <Checkbox :id="`task-${task.id}`" :model-value="task.is_completed"
                                        :aria-label="`Marcar como ${task.is_completed ? 'pendiente' : 'completada'}`" />
                                </div>
                                <label :for="`task-${task.id}`"
                                    class="ml-2 text-lg font-medium leading-none cursor-pointer select-none"
                                    :class="{ 'line-through text-muted-foreground': task.is_completed }">
                                    {{ task.title }}
                                </label>
                            </div>
                        </div>

                        <div class="flex space-x-1 ml-2">
                            <Button variant="ghost" size="icon" @click="editTask(task)" class="h-8 w-8">
                                <Pencil class="h-4 w-4" />
                                <span class="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" @click="handleDelete(task.id!)"
                                class="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 class="h-4 w-4" />
                                <span class="sr-only">Eliminar</span>
                            </Button>
                        </div>

                    </div>
                    <div class="flex flex-col gap-1 mt-1">
                        <p v-if="task.description" class="text-sm text-muted-foreground break-words">
                            {{ task.description }}
                        </p>
                        <span 
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit"
                            :class="{
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': task.priority === 'high',
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': task.priority === 'medium',
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': task.priority === 'low'
                            }"
                        >
                            {{ 
                                task.priority === 'high' ? 'Alta' : 
                                task.priority === 'medium' ? 'Media' : 'Baja'
                            }}
                        </span>
                    </div>
                </CardHeader>
                <CardContent class="pt-0">
                    <p class="text-xs text-muted-foreground">
                        Creada el {{ formatDate(task.created_at!) }}
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

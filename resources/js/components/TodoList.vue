<script setup lang="ts">
import { Ref, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Loader2 } from 'lucide-vue-next';
import TodoForm from './TodoForm.vue';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Task } from '@/services/taskService';

defineProps<{
    tasks: Task[];
    loading?: boolean;
}>();

const emit = defineEmits<{
    (e: 'edit', task: Task): void;
    (e: 'delete', taskId: number): void;
    (e: 'toggle-status', taskId: number): void;
}>();

const editingTask = ref<Task | null>(null);
const showEditDialog: Ref<boolean> = ref(false);

const toggleComplete = (task: Task) => {
    emit('toggle-status', task.id);
};

const handleDelete = (taskId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        emit('delete', taskId);
    }
};

const editTask = (task: Task) => {
    editingTask.value = { ...task };
    showEditDialog.value = true;
};

const handleSaved = (taskData: { title: string; description: string | null }) => {
    if (editingTask.value) {
        emit('edit', { ...editingTask.value, ...taskData });
    } else {
        emit('edit', { ...taskData, id: 0, is_completed: false } as Task);
    }
    showEditDialog.value = false;
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
            <Card
                v-for="task in tasks"
                :key="task.id"
                class="transition-all hover:shadow-md"
                :class="{ 'opacity-60': task.is_completed }"
            >
                <CardHeader class="pb-2">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2 flex-1 min-w-0">
                            <Checkbox
                                :id="`task-${task.id}`"
                                :checked="task.is_completed"
                                @update:checked="() => toggleComplete(task)"
                                class="h-5 w-5 rounded-full flex-shrink-0"
                            />
                            <label
                                :for="`task-${task.id}`"
                                class="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                                :class="{ 'line-through text-muted-foreground': task.is_completed }"
                            >
                                {{ task.title }}
                            </label>
                        </div>
                        <div class="flex space-x-1 ml-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                @click="editTask(task)"
                                class="h-8 w-8"
                            >
                                <Pencil class="h-4 w-4" />
                                <span class="sr-only">Editar</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                @click="handleDelete(task.id)"
                                class="h-8 w-8 text-destructive hover:text-destructive"
                            >
                                <Trash2 class="h-4 w-4" />
                                <span class="sr-only">Eliminar</span>
                            </Button>
                        </div>
                    </div>
                    <p v-if="task.description" class="text-sm text-muted-foreground mt-1 break-words">
                        {{ task.description }}
                    </p>
                </CardHeader>
                <CardContent class="pt-0">
                    <p class="text-xs text-muted-foreground">
                        Creada el {{ formatDate(task.created_at) }}
                    </p>
                </CardContent>
            </Card>
        </div>

        <Dialog v-model:open="showEditDialog" @update:open="val => !val && (editingTask = null)">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {{ editingTask ? 'Editar tarea' : 'Nueva tarea' }}
                    </DialogTitle>
                </DialogHeader>
                <TodoForm
                    v-if="editingTask"
                    :editing-task="editingTask"
                    @saved="handleSaved"
                    @cancel="showEditDialog = false"
                />
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Task {
    id?: number;
    title: string;
    description: string | null;
    completed?: boolean;
    is_completed?: boolean;
    created_at?: string;
    updated_at?: string;
}

const props = defineProps<{
    editingTask: Task | null;
}>();

const emit = defineEmits<{
    (e: 'saved', taskData: { title: string; description: string | null }): void;
    (e: 'cancel'): void;
}>();

const form = ref({
    title: props.editingTask?.title || '',
    description: props.editingTask?.description || null as string | null,
});

const isLoading: Ref<boolean> = ref(false);

const submit = async () => {
    if (!form.value.title.trim()) return;

    try {
        isLoading.value = true;
        const taskData = {
            title: form.value.title.trim(),
            description: form.value.description?.trim() || null
        };

        emit('saved', taskData);

        if (!props.editingTask) {
            form.value = { title: '', description: null };
        }
    } catch (error) {
        console.error('Error saving task:', error);
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.editingTask, (newVal) => {
    form.value = {
        title: newVal?.title || '',
        description: newVal?.description || null
    };
}, { immediate: true });
</script>

<template>
    <form @submit.prevent="submit" class="space-y-4">
        <div>
            <Input
                id="title"
                v-model="form.title"
                placeholder="Título de la tarea"
                required
                class="w-full"
                :disabled="isLoading"
            />
        </div>

        <div>
            <Input
                id="description"
                :model-value="form.description || ''"
                @update:model-value="val => form.description = String(val) || null"
                placeholder="Descripción (opcional)"
                class="w-full"
                :disabled="isLoading"
            />
        </div>

        <div class="flex justify-end space-x-2">
            <Button
                v-if="editingTask"
                type="button"
                variant="outline"
                @click="$emit('cancel')"
                :disabled="isLoading"
            >
                Cancelar
            </Button>
            <Button
                type="submit"
                :disabled="isLoading || !form.title.trim()"
            >
                <span v-if="isLoading">Guardando...</span>
                <span v-else>{{ editingTask ? 'Actualizar' : 'Agregar' }} tarea</span>
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { TransitionRoot, TransitionChild } from '@headlessui/vue';

const props = defineProps<{
    show: boolean;
    taskTitle?: string;
}>();

const emit = defineEmits<{
    (e: 'update:show', value: boolean): void;
    (e: 'confirm'): void;
}>();

const closeModal = () => {
    emit('update:show', false);
};

const confirmDelete = () => {
    emit('confirm');
    closeModal();
};
</script>

<template>
    <TransitionRoot appear :show="show" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-50">
            <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild
                        as="template"
                        enter="duration-300 ease-out"
                        enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100"
                        leave="duration-200 ease-in"
                        leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95"
                    >
                        <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                            <div class="absolute right-4 top-4">
                                <Button variant="ghost" size="sm" @click="closeModal">
                                    <X class="h-4 w-4" />
                                    <span class="sr-only">Cerrar</span>
                                </Button>
                            </div>

                            <div class="mt-2">
                                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <DialogTitle as="h3" class="mt-4 text-center text-lg font-medium text-gray-900 dark:text-white">
                                    ¿Eliminar tarea?
                                </DialogTitle>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                                        ¿Estás seguro de que deseas eliminar la tarea "{{ taskTitle }}"? Esta acción no se puede deshacer.
                                    </p>
                                </div>
                            </div>

                            <div class="mt-6 flex justify-end space-x-3">
                                <Button variant="outline" @click="closeModal">
                                    Cancelar
                                </Button>
                                <Button variant="destructive" @click="confirmDelete">
                                    Eliminar
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
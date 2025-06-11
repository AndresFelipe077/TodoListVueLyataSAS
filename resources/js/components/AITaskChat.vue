<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Send, MessageSquare } from 'lucide-vue-next';

const props = defineProps<{
    onTasksGenerated: (tasks: any[]) => void;
}>();

const messages = ref<Array<{ text: string; isUser: boolean }>>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

const form = useForm({
    prompt: ''
});

const sendMessage = async () => {
    if (!inputMessage.value.trim() || isLoading.value) return;

    const userMessage = inputMessage.value.trim();
    messages.value.push({ text: userMessage, isUser: true });
    inputMessage.value = '';
    scrollToBottom();
    
    isLoading.value = true;
    
    try {
        const response = await fetch('/api/ai/tasks/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            credentials: 'include', // Important for sending cookies
            body: JSON.stringify({ prompt: userMessage })
        });
        
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        
        const data = await response.json();
        
        if (data.success && data.tasks) {
            messages.value.push({ 
                text: '¡Listo! Aquí tienes las tareas generadas:', 
                isUser: false 
            });
            props.onTasksGenerated(data.tasks);
        } else {
            messages.value.push({ 
                text: 'Lo siento, no pude generar las tareas. Por favor, inténtalo de nuevo.', 
                isUser: false 
            });
        }
    } catch (error) {
        console.error('Error:', error);
        messages.value.push({ 
            text: 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.', 
            isUser: false 
        });
    } finally {
        isLoading.value = false;
        scrollToBottom();
    }
};

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    });
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};
</script>

<template>
    <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Asistente de Tareas</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Pídeme que te ayude a crear tareas</p>
        </div>
        
        <div ref="chatContainer" class="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
            <div v-for="(message, index) in messages" :key="index" class="flex" :class="{ 'justify-end': message.isUser }">
                <div 
                    class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                    :class="[
                        message.isUser 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    ]"
                >
                    <p class="whitespace-pre-wrap">{{ message.text }}</p>
                </div>
            </div>
            
            <div v-if="isLoading" class="flex justify-start">
                <div class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg rounded-tl-none">
                    <div class="flex space-x-2">
                        <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0s"></div>
                        <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0.2s"></div>
                        <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-end space-x-2">
                <div class="flex-1 relative">
                    <textarea
                        v-model="inputMessage"
                        @keydown="handleKeyDown"
                        class="w-full px-4 py-2 pr-10 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Escribe tu solicitud..."
                        rows="1"
                        style="resize: none;"
                        :disabled="isLoading"
                    ></textarea>
                    <button
                        @click="sendMessage"
                        :disabled="!inputMessage.trim() || isLoading"
                        class="absolute right-2 bottom-2 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                        :class="{ 'cursor-not-allowed': !inputMessage.trim() || isLoading }"
                    >
                        <Send class="w-5 h-5" />
                    </button>
                </div>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Ejemplo: "Crea 3 tareas para organizar una fiesta de cumpleaños"
            </p>
        </div>
    </div>
</template>

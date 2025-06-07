<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Head } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-vue-next';
import TodoList from '@/components/TodoList.vue';
import TodoForm from '@/components/TodoForm.vue';
import { taskService, type Task } from '@/services/taskService';

const tasks = ref<Task[]>([]);
const loading = ref(true);
const showForm = ref(false);
const editingTask = ref<Task | null>(null);
const activeTab = ref<'all' | 'completed' | 'pending'>('all');

// Obtener tareas al cargar el componente
onMounted(() => {
    fetchTasks();
});

// Filtrar tareas según la pestaña activa
const filteredTasks = computed(() => {
    if (activeTab.value === 'completed') {
        return tasks.value.filter(task => task.is_completed);
    } else if (activeTab.value === 'pending') {
        return tasks.value.filter(task => !task.is_completed);
    }
    return tasks.value;
});

// Abrir formulario para nueva tarea
const openNewTaskForm = () => {
    editingTask.value = null;
    showForm.value = true;
};

// Obtener tareas desde la API
const fetchTasks = async () => {
    try {
        loading.value = true;
        const data = await taskService.getTasks();
        tasks.value = data;
    } catch (error) {
        console.error('Error al cargar las tareas:', error);
    } finally {
        loading.value = false;
    }
};

// Manejar el guardado de tareas
const handleSave = async (taskData: { title: string; description: string | null }) => {
    try {
        if (editingTask.value) {
            await taskService.updateTask(editingTask.value.id, taskData);
        } else {
            await taskService.createTask({
                ...taskData,
                completed: false
            });
        }
        await fetchTasks();
        showForm.value = false;
        editingTask.value = null;
    } catch (error) {
        console.error('Error al guardar la tarea:', error);
    }
};

// Manejar la edición de tareas
const handleEdit = async (task: Task) => {
    try {
        editingTask.value = task;
        showForm.value = true;
    } catch (error) {
        console.error('Error al editar la tarea:', error);
    }
};

// Manejar la eliminación de tareas
const handleDelete = async (taskId: number) => {
    try {
        if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            return;
        }
        await taskService.deleteTask(taskId);
        await fetchTasks();
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
    }
};

// Manejar el cambio de estado de la tarea
const toggleTaskStatus = async (taskId: number) => {
    try {
        const task = tasks.value.find(t => t.id === taskId);
        if (task) {
            await taskService.toggleTaskStatus(taskId);
            await fetchTasks();
        }
    } catch (error) {
        console.error('Error al actualizar el estado de la tarea:', error);
    }
};

// Cargar tareas al montar el componente
onMounted(() => {
    fetchTasks();
});
</script>

<template>
    <div class="py-12">
        <Head title="Dashboard" />

        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold mb-2">Lista de Tareas</h1>
                    <p class="text-muted-foreground">
                        Organiza tus tareas diarias de manera eficiente
                    </p>
                </div>

                <div class="grid gap-6 md:grid-cols-3">
                    <!-- Formulario de tarea -->
                    <div class="md:col-span-1">
                        <Button @click="openNewTaskForm" class="w-full mb-4">
                            <Plus class="h-4 w-4 mr-2" />
                            Nueva Tarea
                        </Button>

                        <TodoForm
                            v-if="showForm"
                            :editing-task="editingTask"
                            @saved="handleSave"
                            @cancel="showForm = false"
                            class="mb-6"
                        />
                    </div>


                    <!-- Lista de tareas -->
                    <div class="md:col-span-2">
                        <!-- Filtros -->
                        <div class="flex flex-wrap gap-2 mb-6">
                            <Button
                                :variant="activeTab === 'all' ? 'default' : 'outline'"
                                @click="activeTab = 'all'"
                                size="sm"
                            >
                                Todas
                            </Button>
                            <Button
                                :variant="activeTab === 'pending' ? 'default' : 'outline'"
                                @click="activeTab = 'pending'"
                                size="sm"
                            >
                                Pendientes
                            </Button>
                            <Button
                                :variant="activeTab === 'completed' ? 'default' : 'outline'"
                                @click="activeTab = 'completed'"
                                size="sm"
                            >
                                Completadas
                            </Button>
                        </div>

                        <!-- Estado de carga -->
                        <div v-if="loading" class="flex justify-center items-center py-12">
                            <Loader2 class="h-8 w-8 animate-spin text-primary" />
                            <span class="ml-2">Cargando tareas...</span>
                        </div>

                        <!-- Lista de tareas -->
                        <div v-else>
                            <TodoList
                                :tasks="filteredTasks"
                                :loading="loading"
                                @edit="handleEdit"
                                @delete="handleDelete"
                                @toggle-status="toggleTaskStatus"
                            />

                            <div v-if="filteredTasks.length === 0" class="text-center py-8 text-muted-foreground">
                                No hay tareas para mostrar.
                                <Button variant="link" @click="activeTab = 'all'">
                                    Ver todas las tareas
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

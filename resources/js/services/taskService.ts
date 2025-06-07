// Usar la configuración centralizada de Axios
import api from '@/lib/axios';

// Definir la interfaz de tarea
export interface Task {
    id: number;
    title: string;
    description: string | null;
    is_completed: boolean;
    completed?: boolean; // Alias para compatibilidad
    due_date?: string | null;
    priority?: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
}

export const taskService = {
    async getTasks(): Promise<Task[]> {
        try {
            const response = await api.get<Task[]>('/tasks');
            return response.data.map(task => ({
                ...task,
                is_completed: task.is_completed ?? task.completed ?? false
            }));
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    async createTask(taskData: Omit<Task, 'id' | 'is_completed' | 'created_at' | 'updated_at'>): Promise<Task> {
        try {
            const response = await api.post<Task>('/tasks', taskData);
            return response.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    async updateTask(id: number, taskData: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
        try {
            const response = await api.put<Task>(`/tasks/${id}`, taskData);
            return response.data;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    async toggleTaskStatus(id: number): Promise<{ completed: boolean }> {
        try {
            const response = await api.patch<{ completed: boolean }>(`/tasks/${id}/toggle`);
            return response.data;
        } catch (error) {
            console.error('Error toggling task status:', error);
            throw error;
        }
    },

    async deleteTask(id: number): Promise<void> {
        try {
            await api.delete(`/tasks/${id}`);
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
};

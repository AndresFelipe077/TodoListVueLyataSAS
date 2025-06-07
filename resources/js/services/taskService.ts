import api from '@/lib/axios';
import { Task } from '@/models/Task';
import { AxiosResponse } from 'axios';

export const taskService = {
    async getTasks(): Promise<Task[]> {
        try {
            const response: AxiosResponse<Task[]> = await api.get<Task[]>('/tasks');
            return response.data.map((task: Task) => ({
                ...task,
                is_completed: task.is_completed ?? task.completed ?? false
            }));
        } catch (error: unknown) {
            throw error;
        }
    },

    async createTask(taskData: Omit<Task, 'id' | 'is_completed' | 'created_at' | 'updated_at'>): Promise<Task> {
        try {
            const response: AxiosResponse<Task> = await api.post<Task>('/tasks', taskData);
            return response.data;
        } catch (error: unknown) {
            throw error;
        }
    },

    async updateTask(id: number, taskData: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
        try {
            const response: AxiosResponse<Task> = await api.put<Task>(`/tasks/${id}`, taskData);
            return response.data;
        } catch (error: unknown) {
            throw error;
        }
    },

    async toggleTaskStatus(id: number): Promise<{ completed: boolean }> {
        try {
            const response: AxiosResponse<{ completed: boolean }> = await api.patch<{ completed: boolean }>(`/tasks/${id}/toggle`);
            return response.data;
        } catch (error: unknown) {
            throw error;
        }
    },

    async deleteTask(id: number): Promise<void> {
        try {
            await api.delete(`/tasks/${id}`);
        } catch (error: unknown) {
            throw error;
        }
    }
};

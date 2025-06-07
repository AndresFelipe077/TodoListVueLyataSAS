export interface Task {
    id?: number;
    title: string;
    description: string | null;
    is_completed?: boolean;
    completed?: boolean;
    due_date?: string | null;
    priority?: 'low' | 'medium' | 'high';
    created_at?: string;
    updated_at?: string;
}

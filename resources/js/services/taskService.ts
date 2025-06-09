import axios from 'axios';
import { Task } from '@/models/Task';

// Tipos para las respuestas de la API
interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}

interface ToggleStatusResponse {
    completed: boolean;
}

// Tipos para los datos de creación/actualización
type CreateTaskData = Omit<Task, 'id' | 'is_completed' | 'created_at' | 'updated_at'>;
type UpdateTaskData = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Servicio para manejar las operaciones relacionadas con tareas
 * Implementado con llamadas HTTP RESTful puras
 */
class TaskService {
    private axios = axios.create({
        baseURL: '/api',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        withCredentials: true, // Importante para enviar cookies de sesión
    });

    private authToken: string | null = null;
    private isRefreshing = false;
    private failedQueue: Array<{resolve: (value: any) => void, reject: (reason?: any) => void}> = [];

    /**
     * Establece el token de autenticación
     */
    public setAuthToken(token: string | null): void {
        this.authToken = token;
        
        if (token) {
            // Configurar el header de autorización
            this.axios.defaults.headers.common = {
                ...this.axios.defaults.headers.common,
                'Authorization': `Bearer ${token}`
            };
            // Almacenar el token en localStorage para persistencia
            localStorage.setItem('auth_token', token);
        } else {
            // Eliminar el header de autorización si existe
            const { ['Authorization']: _, ...commonHeaders } = this.axios.defaults.headers.common || {};
            this.axios.defaults.headers.common = commonHeaders;
            localStorage.removeItem('auth_token');
        }
    }

    /**
     * Inicializa el servicio con el token guardado si existe
     */
    public initialize(): void {
        const token = localStorage.getItem('auth_token');
        if (token) {
            this.setAuthToken(token);
        }
        
        // Configurar interceptor para manejar errores de autenticación
        this.axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    // Token expirado o inválido
                    this.setAuthToken(null);
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    constructor() {
        // Inicializar con el token guardado si existe
        this.initialize();
        
        // Configurar interceptor para agregar el token CSRF a las peticiones
        this.axios.interceptors.request.use(config => {
            // Asegurarse de que las cabeceras existan
            config.headers = config.headers || {};
            
            // Agregar token CSRF si está disponible
            const csrfToken = this.getCsrfToken();
            if (csrfToken) {
                config.headers['X-CSRF-TOKEN'] = csrfToken;
            }
            
            // Asegurarse de que el token de autenticación esté en las cabeceras
            if (this.authToken) {
                config.headers['Authorization'] = `Bearer ${this.authToken}`;
            }
            
            // Asegurarse de que las cabeceras necesarias estén presentes
            config.headers['Accept'] = 'application/json';
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
            
            return config;
        });
        
        // Manejo de respuestas
        this.axios.interceptors.response.use(
            response => {
                // Verificar si la respuesta contiene un nuevo token
                if (response.data?.access_token) {
                    this.setAuthToken(response.data.access_token);
                }
                return response.data;
            },
            error => this.handleError(error)
        );
    }

    /**
     * Obtiene el token CSRF del meta tag
     */
    private getCsrfToken(): string | null {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
            
        return token ? decodeURIComponent(token) : null;
    }

    /**
     * Procesa la cola de peticiones fallidas después de renovar el token
     */
    private processQueue(error: any, token: string | null = null): void {
        this.failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        this.failedQueue = [];
    }

    /**
     * Intenta renovar el token de autenticación
     */
    private async refreshToken(): Promise<string | null> {
        if (this.isRefreshing) {
            // Si ya se está refrescando el token, devolver una promesa que se resolverá después
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
            });
        }

        this.isRefreshing = true;

        try {
            // Realizar una petición al endpoint de renovación de token
            const response = await axios.get('/api/refresh-token', {
                withCredentials: true,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (response.data?.success && response.data.data?.access_token) {
                const newToken = response.data.data.access_token;
                this.setAuthToken(newToken);
                this.processQueue(null, newToken);
                return newToken;
            }

            throw new Error('No se pudo renovar el token de autenticación');
        } catch (error) {
            this.processQueue(error);
            this.setAuthToken(null);
            window.location.href = '/login';
            return null;
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Maneja los errores de las peticiones HTTP
     */
    private async handleError(error: any): Promise<never> {
        const originalRequest = error.config;

        // Si el error es 401 y no es una petición de login ni ya se está intentando renovar el token
        if (error.response?.status === 401 && !originalRequest._retry && 
            !originalRequest.url.includes('login') && !originalRequest.url.includes('refresh-token')) {
            
            originalRequest._retry = true;
            
            try {
                // Intentar renovar el token
                const newToken = await this.refreshToken();
                
                if (newToken) {
                    // Reintentar la petición original con el nuevo token
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return this.axios(originalRequest);
                }
            } catch (refreshError) {
                console.error('Error al renovar el token:', refreshError);
                this.setAuthToken(null);
                window.location.href = '/login';
            }
        }

        // Si no es un error 401 o ya se intentó renovar el token
        if (error.response) {
            // El servidor respondió con un estado de error
            const { status, data } = error.response;
            const message = data?.message || 'Error en la solicitud';

            if (status === 401) {
                this.setAuthToken(null);
                window.location.href = '/login';
            }

            throw new Error(message);
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
            // Error al configurar la petición
            throw new Error('Error al realizar la petición');
        }
    }

    /**
     * Obtiene todas las tareas
     */
    /**
     * Obtiene todas las tareas
     */
    public async getTasks(): Promise<Task[]> {
        try {
            const response = await this.axios.get<ApiResponse<Task[]>>('/tasks');
            return response.data.data.map((task: Task) => ({
                ...task,
                is_completed: task.is_completed ?? task.completed ?? false
            }));
        } catch (error) {
            console.error('Error al obtener tareas:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva tarea
     */
    public async createTask(taskData: CreateTaskData): Promise<Task> {
        try {
            const response = await this.axios.post<ApiResponse<Task>>('/tasks', taskData);
            return response.data.data;
        } catch (error) {
            console.error('Error al crear tarea:', error);
            throw error;
        }
    }

    /**
     * Actualiza una tarea existente
     */
    public async updateTask(id: number, taskData: UpdateTaskData): Promise<Task> {
        try {
            const response = await this.axios.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);
            return response.data.data;
        } catch (error) {
            console.error(`Error al actualizar tarea ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cambia el estado de una tarea
     */
    public async toggleTaskStatus(id: number): Promise<ToggleStatusResponse> {
        try {
            const response = await this.axios.patch<ApiResponse<ToggleStatusResponse>>(`/tasks/${id}/toggle`);
            return response.data.data;
        } catch (error) {
            console.error(`Error al cambiar estado de tarea ${id}:`, error);
            throw error;
        }
    }

    /**
     * Elimina una tarea
     */
    public async deleteTask(id: number): Promise<void> {
        try {
            await this.axios.delete(`/tasks/${id}`);
        } catch (error) {
            console.error(`Error al eliminar tarea ${id}:`, error);
            throw error;
        }
    }
}

// Exportar una instancia única del servicio
const taskService = new TaskService();

export default taskService;

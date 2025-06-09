import axios, { 
    AxiosError, 
    AxiosResponse, 
    AxiosRequestConfig, 
    AxiosInstance, 
    InternalAxiosRequestConfig,
    AxiosHeaders
} from 'axios';

// Define la interfaz para la respuesta estándar de la API
interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

// Extender la configuración de Axios para incluir headers personalizados
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    headers?: AxiosHeaders | Record<string, string>;
}

// Configuración global de Axios
const api: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000, // 10 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true
});

// Interceptor para manejar las respuestas exitosas
const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    return response.data.data;
};

// Interceptor para manejar errores
const handleError = (error: AxiosError<{ message?: string }>): never => {
    if (error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
            // Redirigir al login si no está autenticado
            window.location.href = '/login';
        }
        
        const errorMessage = errorData?.message || error.message || 'Error en la solicitud';
        throw new Error(errorMessage);
    } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.');
    } else {
        // Algo pasó en la configuración de la solicitud
        throw new Error('Error al realizar la solicitud');
    }
};

// Añadir interceptor de respuesta
api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => response,
    (error: AxiosError<{ message?: string }>) => {
        return Promise.reject(handleError(error));
    }
);

// Interceptor para agregar el token CSRF a las peticiones
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers = config.headers || {};
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

// Tipos para los métodos HTTP
interface HttpMethods {
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

// Exportar métodos HTTP con tipos genéricos
export const http: HttpMethods = {
    get: <T>(url: string, config?: AxiosRequestConfig) => 
        api.get<ApiResponse<T>>(url, config).then(handleResponse<T>),
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
        api.post<ApiResponse<T>>(url, data, config).then(handleResponse<T>),
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
        api.put<ApiResponse<T>>(url, data, config).then(handleResponse<T>),
    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
        api.patch<ApiResponse<T>>(url, data, config).then(handleResponse<T>),
    delete: <T>(url: string, config?: AxiosRequestConfig) => 
        api.delete<ApiResponse<T>>(url, config).then(handleResponse<T>),
};

export default api;

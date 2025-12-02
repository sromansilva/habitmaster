const API_URL = 'http://localhost:8000/api';

export interface User {
    id_usuario: number;
    username: string;
    email: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface Profile {
    id_usuario: number;
    biografia: string | null;
    puntos_totales: number;
    racha_actual: number;
    racha_maxima: number;
    num_habitos_creados: number;
    habitos_completados: number;
    num_logros_obtenidos: number;
    meta_diaria: number;
    avatar_url: string | null;
}

export interface Preferences {
    id_usuario: number;
    modo_oscuro: boolean;
    notificaciones_push: boolean;
    notificaciones_email: boolean;
    zona_horaria: string | null;
    idioma: string | null;
}

export interface Habit {
    id_habito: number;
    nombre: string;
    descripcion: string;
    puntos: number;
    fecha: string;
    categoria: string;
    dias: string;
    estado: 'pendiente' | 'completado';
}

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const api = {
    auth: {
        async login(credentials: any): Promise<AuthResponse> {
            const response = await fetch(`${API_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }
            return response.json();
        },

        async register(username: string, email: string, password: string): Promise<User> {
            const response = await fetch(`${API_URL}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            if (!response.ok) throw await response.json();
            return response.json();
        },

        async deleteAccount(): Promise<void> {
            const response = await fetch(`${API_URL}/user/me/`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to delete account');
        },

        async changePassword(data: any): Promise<any> {
            const response = await fetch(`${API_URL}/auth/change-password/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }
            return response.json();
        }
    },

    user: {
        async getMe(): Promise<{ user: User, perfil: Profile, preferencias: Preferences }> {
            const response = await fetch(`${API_URL}/user/me/`, {
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch user data');
            return response.json();
        },

        async updateProfile(data: { user?: Partial<User>, perfil?: Partial<Profile>, preferencias?: Partial<Preferences> }): Promise<{ user: User, perfil: Profile, preferencias: Preferences }> {
            const response = await fetch(`${API_URL}/user/me/`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update profile');
            return response.json();
        },

        async updateDailyGoal(dailyGoal: number): Promise<{ user: User, perfil: Profile, preferencias: Preferences }> {
            const response = await fetch(`${API_URL}/user/me/`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ perfil: { meta_diaria: dailyGoal } }),
            });
            if (!response.ok) throw new Error('Failed to update daily goal');
            return response.json();
        },

        async updatePreferences(data: Partial<Preferences>): Promise<any> {
            const response = await fetch(`${API_URL}/user/me/`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ preferencias: data }),
            });
            if (!response.ok) throw new Error('Failed to update preferences');
            return response.json();
        }
    },

    habits: {
        async list(): Promise<Habit[]> {
            const response = await fetch(`${API_URL}/habitos/`, {
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch habits');
            return response.json();
        },

        async create(habit: Partial<Habit>): Promise<Habit> {
            const response = await fetch(`${API_URL}/habitos/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(habit),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Backend error:', errorData);
                throw new Error(errorData.detail || errorData.message || JSON.stringify(errorData) || 'Failed to create habit');
            }
            return response.json();
        },

        async update(id: number, habit: Partial<Habit>): Promise<Habit> {
            const response = await fetch(`${API_URL}/habitos/${id}/`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(habit),
            });
            if (!response.ok) throw new Error('Failed to update habit');
            return response.json();
        },

        async delete(id: number): Promise<void> {
            const response = await fetch(`${API_URL}/habitos/${id}/`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to delete habit');
        }
    },

    ranking: {
        async list(): Promise<any[]> {
            const response = await fetch(`${API_URL}/ranking/`, {
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch ranking');
            return response.json();
        }
    }
};

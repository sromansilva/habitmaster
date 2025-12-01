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

export const authService = {
    async login(username: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al iniciar sesión');
        }

        return response.json();
    },

    async register(username: string, email: string, password: string): Promise<User> {
        const response = await fetch(`${API_URL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Handle DRF validation errors (which are objects)
            if (typeof errorData === 'object') {
                // Extract first error message if possible
                const firstError = Object.values(errorData)[0];
                if (Array.isArray(firstError)) {
                    throw new Error(firstError[0]);
                }
            }
            throw new Error('Error al registrarse');
        }

        return response.json();
    }
};

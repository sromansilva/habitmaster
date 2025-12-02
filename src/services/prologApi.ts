const API_URL = 'http://localhost:8000/api/prolog-demo/';

export interface PrologResponse {
    action?: string;
    resultado?: any;
    error?: string;
    message?: string;
    available_actions?: string[];
    [key: string]: any;
}

export const prologApi = {
    async getAvailableActions(): Promise<string[]> {
        try {
            const response = await fetch(API_URL);

            let data: any;
            try {
                data = await response.json();
            } catch {
                throw new Error('Respuesta inválida del servidor');
            }

            if (response.ok && data.available_actions) {
                return data.available_actions;
            }

            return [];
        } catch (error) {
            console.error('Error fetching available actions:', error);
            throw new Error('No se pudo obtener la lista de acciones');
        }
    },

    async executeQuery(action: string, params: Record<string, any>): Promise<PrologResponse> {
        try {
            // Evitar enviar undefined o null
            const filteredParams: Record<string, string> = {};

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    filteredParams[key] = String(value);
                }
            });

            const queryParams = new URLSearchParams({
                action,
                ...filteredParams
            }).toString();

            const response = await fetch(`${API_URL}?${queryParams}`);

            let data: any;
            try {
                data = await response.json();
            } catch {
                throw new Error('Respuesta inválida del servidor');
            }

            if (!response.ok) {
                throw new Error(data.detail || data.error || 'Error en la consulta');
            }

            return data;
        } catch (error: any) {
            console.error('Error executing query:', error);
            throw new Error(error.message || 'Error inesperado consultando Prolog');
        }
    }
};

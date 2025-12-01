export type Screen = 'landing' | 'auth' | 'dashboard' | 'habits' | 'habit-form' | 'progress' | 'ranking' | 'profile' | 'achievements' | 'settings';

export interface Habit {
    id: string;
    name: string;
    description: string;
    category: string;
    frequency: number; // veces por semana
    completedDates: string[]; // array de fechas en formato ISO
    streak: number;
    lastCompleted: string | null;
    createdAt: string;
    points: number; // puntos base por completar
}

export interface UserProfile {
    name: string;
    email: string;
    bio: string;
    avatar: string;
    totalPoints: number;
    level: number;
    currentStreak: number;
    maxStreak: number;
    memberSince: string;
    unlockedAchievements: string[]; // IDs de logros desbloqueados
    achievementPoints: number; // Puntos totales ganados por logros
}

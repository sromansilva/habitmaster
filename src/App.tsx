import { useState, useEffect } from 'react';
import { api, Habit as ApiHabit } from './services/api';
import { Toaster, toast } from 'sonner';
import { NotificationProvider } from './contexts/NotificationContext';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { AuthenticatedContent } from './components/AuthenticatedContent';
import {
  calculateTotalPoints,
  calculateLevel,
  calculateGlobalStreak,
  calculateGlobalMaxStreak,
  calculateStreak,
  calculateTotalCompletions,
  updateHabitStreaks
} from './utils/habitCalculations';
import { checkUnlockedAchievements, detectNewAchievements } from './utils/achievementChecker';
import { getAchievementById } from './utils/achievementDefinitions';

/**
 * BACKEND INTEGRATION GUIDE
 * =========================
 * 
 * Este archivo es el punto principal de la aplicación.
 * Actualmente usa localStorage para persistencia, pero está preparado para backend.
 * 
 * PASOS PARA INTEGRACIÓN:
 * 
 * 1. Reemplazar localStorage con llamadas a API:
 *    - useEffect línea 75: Cambiar por fetch GET /api/users/me
 *    - useEffect línea 119: Cambiar por fetch GET /api/habits
 *    - Cada setHabits: Llamar también a POST/PATCH/DELETE /api/habits
 * 
 * 2. Implementar autenticación real:
 *    - handleLogin: Llamar a POST /api/auth/login
 *    - Guardar JWT token en localStorage
 *    - Agregar token en headers de todas las peticiones
 * 
 * 3. Sincronización de logros:
 *    - Cuando se detecte nuevo logro, hacer POST /api/achievements/unlock
 *    - Backend debe verificar y otorgar puntos
 * 
 * 4. Manejo de estado de carga:
 *    - Agregar estados: isLoadingUser, isLoadingHabits
 *    - Mostrar skeletons mientras carga
 * 
 * Estructura de datos esperada del backend:
 * - Ver /BACKEND_INTEGRATION.md para detalles completos
 */

import { Screen, Habit, UserProfile } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  const [preferences, setPreferences] = useState({
    modo_oscuro: false,
    notificaciones_push: false,
    notificaciones_email: true,
    zona_horaria: 'UTC',
    idioma: 'es',
  });

  // TODO BACKEND: Este estado debe poblarse desde la base de datos (GET /api/users/me)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', // Se llenará al autenticarse
    email: '', // Se llenará al autenticarse
    bio: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default',
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
    memberSince: new Date().toISOString(),
    unlockedAchievements: [],
    achievementPoints: 0,
  });

  // Cargar perfil y datos del backend
  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsAuthenticated(false);
        setCurrentScreen('landing');
        return;
      }

      try {
        // Fetch User Data
        const { user, perfil, preferencias: userPreferences } = await api.user.getMe();

        // Only set authenticated AFTER successful fetch
        setIsAuthenticated(true);
        setCurrentScreen('dashboard');

        setUserProfile({
          name: user.username,
          email: user.email,
          bio: perfil.biografia || '',
          avatar: perfil.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username,
          totalPoints: perfil.puntos_totales,
          level: calculateLevel(perfil.puntos_totales),
          currentStreak: perfil.racha_actual,
          maxStreak: perfil.racha_maxima,
          memberSince: new Date().toISOString(),
          unlockedAchievements: [],
          achievementPoints: 0,
        });

        // Set Preferences
        setPreferences(userPreferences);
        setDarkMode(userPreferences.modo_oscuro);
        setPushNotifications(userPreferences.notificaciones_push);

        // Fetch Habits
        const apiHabits = await api.habits.list();
        const mappedHabits: Habit[] = apiHabits.map(h => ({
          id: h.id_habito.toString(),
          name: h.nombre,
          description: h.descripcion,
          category: h.categoria,
          frequency: h.dias ? h.dias.split(',').length : 7,
          completedDates: h.estado === 'completado' ? [h.fecha] : [],
          streak: 0,
          lastCompleted: h.estado === 'completado' ? h.fecha : null,
          createdAt: new Date().toISOString(),
          points: h.puntos
        }));
        setHabits(mappedHabits);

      } catch (error) {
        console.error('Error loading user data:', error);
        // If error (e.g. 401), logout and CLEAR TOKEN to prevent loop
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        handleLogout();
      }
    };

    loadUserData();
  }, []); // Empty dependency array: run only once on mount

  // Guardar perfil en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('habitmaster_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Cargar dark mode y notificaciones del localStorage al iniciar
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('habitmaster_darkmode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }

    const savedPushNotifications = localStorage.getItem('habitmaster_pushnotifications');
    if (savedPushNotifications) {
      setPushNotifications(savedPushNotifications === 'true');
    }
  }, []);

  // Aplicar dark mode al DOM (pero no en la Landing Page ni Auth)
  useEffect(() => {
    // Si estamos en landing page o auth screen, siempre desactivar el modo oscuro
    if (currentScreen === 'landing' || currentScreen === 'auth') {
      document.documentElement.classList.remove('dark');
    } else {
      // En cualquier otra pantalla, aplicar el modo oscuro según la configuración
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    localStorage.setItem('habitmaster_darkmode', darkMode.toString());
  }, [darkMode, currentScreen]);

  // Cargar hábitos del localStorage al iniciar
  useEffect(() => {
    const savedHabits = localStorage.getItem('habitmaster_habits');
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    }
  }, []);

  // Guardar hábitos en localStorage cuando cambien
  useEffect(() => {
    if (habits.length > 0 || localStorage.getItem('habitmaster_habits')) {
      localStorage.setItem('habitmaster_habits', JSON.stringify(habits));
    }
  }, [habits]);

  // Actualizar estadísticas del perfil cuando cambien los hábitos
  useEffect(() => {
    if (habits.length > 0) {
      const basePoints = calculateTotalPoints(habits);
      const currentStreak = calculateGlobalStreak(habits);
      const maxStreak = Math.max(
        calculateGlobalMaxStreak(habits),
        userProfile.maxStreak
      );

      // Solo actualizar si hay cambios (sin incluir achievementPoints que se maneja separadamente)
      if (
        currentStreak !== userProfile.currentStreak ||
        maxStreak !== userProfile.maxStreak
      ) {
        setUserProfile(prev => ({
          ...prev,
          currentStreak,
          maxStreak,
        }));
      }
    }
  }, [habits]);

  // Actualizar rachas de los hábitos diariamente
  useEffect(() => {
    const updatedHabits = updateHabitStreaks(habits);
    const hasChanges = updatedHabits.some((habit, index) =>
      habit.streak !== habits[index]?.streak
    );

    if (hasChanges) {
      setHabits(updatedHabits);
    }
  }, [habits.map(h => h.completedDates.join(',')).join('|')]);

  // Detectar y recompensar nuevos logros
  useEffect(() => {
    if (habits.length === 0) return;

    // Calcular puntos base de hábitos (sin incluir puntos de logros)
    const basePoints = calculateTotalPoints(habits);

    // Verificar qué logros deberían estar desbloqueados
    const shouldBeUnlocked = checkUnlockedAchievements(
      habits,
      basePoints + userProfile.achievementPoints, // Total incluyendo puntos de logros
      userProfile.maxStreak
    );

    // Detectar nuevos logros
    const newAchievements = detectNewAchievements(
      userProfile.unlockedAchievements,
      shouldBeUnlocked
    );

    // Si hay nuevos logros, otorgar puntos y mostrar notificación
    if (newAchievements.length > 0) {
      let totalBonusPoints = 0;

      newAchievements.forEach(achievementId => {
        const achievement = getAchievementById(achievementId);
        if (achievement) {
          totalBonusPoints += achievement.pointsBonus;

          // Mostrar notificación solo si las notificaciones push están activadas
          if (pushNotifications) {
            toast.success(
              `🏆 ¡Nuevo logro desbloqueado!`,
              {
                description: `${achievement.icon} ${achievement.name} - +${achievement.pointsBonus} puntos`,
                duration: 5000,
              }
            );
          }
        }
      });

      // Actualizar perfil con nuevos logros y puntos
      setUserProfile(prev => {
        const newAchievementPoints = prev.achievementPoints + totalBonusPoints;
        const newTotalPoints = basePoints + newAchievementPoints;
        const newLevel = calculateLevel(newTotalPoints);

        return {
          ...prev,
          unlockedAchievements: shouldBeUnlocked,
          achievementPoints: newAchievementPoints,
          totalPoints: newTotalPoints,
          level: newLevel,
        };
      });
    } else {
      // Si no hay nuevos logros, solo sincronizar la lista de logros desbloqueados
      if (shouldBeUnlocked.length !== userProfile.unlockedAchievements.length) {
        setUserProfile(prev => ({
          ...prev,
          unlockedAchievements: shouldBeUnlocked,
        }));
      }
    }
  }, [habits, userProfile.maxStreak, pushNotifications]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = (name?: string, email?: string) => {
    // Si se proporciona nombre y email, actualizar el perfil (registro)
    if (name && email) {
      setUserProfile(prev => ({
        ...prev,
        name,
        email,
      }));
    } else if (email) {
      // Solo email (login), actualizar solo el email
      setUserProfile(prev => ({
        ...prev,
        email,
      }));
    }

    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('landing');
  };

  const handleEditHabit = (habitId: string) => {
    setEditingHabitId(habitId);
    setCurrentScreen('habit-form');
  };

  const handleCreateHabit = () => {
    setEditingHabitId(null);
    setCurrentScreen('habit-form');
  };

  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'lastCompleted' | 'createdAt'>) => {
    try {
      if (editingHabitId) {
        // Editar hábito existente
        const updatedHabit = await api.habits.update(parseInt(editingHabitId), {
          nombre: habitData.name,
          descripcion: habitData.description,
          categoria: habitData.category,
          dias: Array(habitData.frequency).fill('Mon').join(','), // Simplified logic for now
          puntos: habitData.points
        });

        setHabits(prev => prev.map(habit =>
          habit.id === editingHabitId
            ? { ...habit, ...habitData }
            : habit
        ));
      } else {
        // Crear nuevo hábito
        const newHabit = await api.habits.create({
          nombre: habitData.name,
          descripcion: habitData.description,
          categoria: habitData.category,
          dias: Array(habitData.frequency).fill('Mon').join(','), // Simplified logic
          puntos: habitData.points
        });

        const mappedHabit: Habit = {
          id: newHabit.id_habito.toString(),
          name: newHabit.nombre,
          description: newHabit.descripcion,
          category: newHabit.categoria,
          frequency: newHabit.dias ? newHabit.dias.split(',').length : 7,
          completedDates: [],
          streak: 0,
          lastCompleted: null,
          createdAt: new Date().toISOString(),
          points: newHabit.puntos
        };

        setHabits(prev => [...prev, mappedHabit]);
      }
      setCurrentScreen('habits');
    } catch (error) {
      console.error('Error saving habit:', error);
      toast.error('Error al guardar el hábito');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.habits.delete(parseInt(habitId));
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Error al eliminar el hábito');
    }
  };

  const handleToggleHabitComplete = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompletedToday = habit.completedDates.includes(today);
    const newStatus = isCompletedToday ? 'pendiente' : 'completado';

    try {
      // Optimistic update
      setHabits(prev => prev.map(h => {
        if (h.id !== habitId) return h;

        if (isCompletedToday) {
          return {
            ...h,
            completedDates: h.completedDates.filter(date => date !== today),
          };
        } else {
          const newCompletedDates = [...h.completedDates, today].sort();
          return {
            ...h,
            completedDates: newCompletedDates,
            streak: calculateStreak(newCompletedDates),
            lastCompleted: today,
          };
        }
      }));

      // API call
      await api.habits.update(parseInt(habitId), { estado: newStatus });

      // Refresh profile stats (points, etc)
      const { perfil } = await api.user.getMe();
      setUserProfile(prev => ({
        ...prev,
        totalPoints: perfil.puntos_totales,
        level: calculateLevel(perfil.puntos_totales),
        currentStreak: perfil.racha_actual,
        maxStreak: perfil.racha_maxima,
      }));

    } catch (error) {
      console.error('Error toggling habit:', error);
      toast.error('Error al actualizar el estado del hábito');
      // Revert optimistic update if needed (omitted for brevity)
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // Map frontend profile to backend structure
      const backendUpdates: any = {};
      if (updates.bio !== undefined) backendUpdates.perfil = { biografia: updates.bio };

      // Handle preferences updates if they were part of UserProfile (they are separate in backend)
      // For now, we assume updates coming here are mostly profile related.
      // If settings screen calls this, we might need to separate logic.

      await api.user.updateProfile(backendUpdates);
      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleUpdatePreferences = (updates: any) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  return (
    <NotificationProvider pushNotificationsEnabled={pushNotifications}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
        {!isAuthenticated ? (
          <>
            {currentScreen === 'landing' && (
              <LandingPage onNavigateToAuth={() => setCurrentScreen('auth')} />
            )}
            {currentScreen === 'auth' && (
              <AuthScreen onLogin={handleLogin} onBack={() => setCurrentScreen('landing')} />
            )}
          </>
        ) : (
          <AuthenticatedContent
            currentScreen={currentScreen}
            habits={habits}
            userProfile={userProfile}
            darkMode={darkMode}
            pushNotifications={pushNotifications}
            preferences={preferences}
            editingHabitId={editingHabitId}
            onNavigate={navigateTo}
            onCreateHabit={handleCreateHabit}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
            onSaveHabit={handleSaveHabit}
            onToggleComplete={handleToggleHabitComplete}
            onUpdateProfile={handleUpdateProfile}
            onUpdatePreferences={handleUpdatePreferences}
            onDarkModeChange={setDarkMode}
            onPushNotificationsChange={setPushNotifications}
            onLogout={handleLogout}
          />
        )}
      </div>
      <Toaster
        theme={darkMode ? 'dark' : 'light'}
        position="bottom-center"
        toastOptions={{
          className: 'toast-notification',
          duration: 4000,
        }}
      />
    </NotificationProvider>
  );
}
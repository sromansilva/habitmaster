import { useState, useEffect } from 'react';
import { api } from './services/api';
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
  updateHabitStreaks
} from './utils/habitCalculations';
import { checkUnlockedAchievements, detectNewAchievements } from './utils/achievementChecker';
import { getAchievementById } from './utils/achievementDefinitions';

import { Screen, Habit, UserProfile } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    bio: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default',
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
    memberSince: new Date().toISOString(),
    unlockedAchievements: [],
    achievementPoints: 0,
    dailyGoal: 3,
  });

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const { user, perfil, preferencias: userPreferences } = await api.user.getMe();

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
        dailyGoal: perfil.meta_diaria || 3,
      });

      setPreferences(userPreferences);
      setDarkMode(userPreferences.modo_oscuro);
      setPushNotifications(userPreferences.notificaciones_push);

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
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');

    } catch (error) {
      console.error('Error loading user data:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      setIsAuthenticated(false);
      setCurrentScreen('landing');
      setIsLoading(false);
      return;
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('habitmaster_profile', JSON.stringify(userProfile));
    }
  }, [userProfile, isAuthenticated]);

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

  useEffect(() => {
    if (currentScreen === 'landing' || currentScreen === 'auth') {
      document.documentElement.classList.remove('dark');
    } else {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    localStorage.setItem('habitmaster_darkmode', darkMode.toString());
  }, [darkMode, currentScreen]);

  useEffect(() => {
    if (isAuthenticated && (habits.length > 0 || sessionStorage.getItem('habitmaster_habits'))) {
      sessionStorage.setItem('habitmaster_habits', JSON.stringify(habits));
    }
  }, [habits, isAuthenticated]);

  useEffect(() => {
    if (habits.length > 0) {
      const currentStreak = calculateGlobalStreak(habits);
      const maxStreak = Math.max(
        calculateGlobalMaxStreak(habits),
        userProfile.maxStreak
      );

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

  useEffect(() => {
    const updatedHabits = updateHabitStreaks(habits);
    const hasChanges = updatedHabits.some((habit, index) =>
      habit.streak !== habits[index]?.streak
    );

    if (hasChanges) {
      setHabits(updatedHabits);
    }
  }, [habits.map(h => h.completedDates.join(',')).join('|')]);

  useEffect(() => {
    if (habits.length === 0) return;

    const basePoints = calculateTotalPoints(habits);

    const shouldBeUnlocked = checkUnlockedAchievements(
      habits,
      basePoints + userProfile.achievementPoints,
      userProfile.maxStreak
    );

    const newAchievements = detectNewAchievements(
      userProfile.unlockedAchievements,
      shouldBeUnlocked
    );

    if (newAchievements.length > 0) {
      let totalBonusPoints = 0;

      newAchievements.forEach(achievementId => {
        const achievement = getAchievementById(achievementId);
        if (achievement) {
          totalBonusPoints += achievement.pointsBonus;
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
    fetchUserData();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('habitmaster_profile');
    sessionStorage.removeItem('habitmaster_habits');

    setIsAuthenticated(false);
    setCurrentScreen('landing');
    setHabits([]);
    setUserProfile({
      name: '',
      email: '',
      bio: '',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default',
      totalPoints: 0,
      level: 1,
      currentStreak: 0,
      maxStreak: 0,
      memberSince: new Date().toISOString(),
      unlockedAchievements: [],
      achievementPoints: 0,
      dailyGoal: 3,
    });
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
        await api.habits.update(parseInt(editingHabitId), {
          nombre: habitData.name,
          descripcion: habitData.description,
          categoria: habitData.category,
          dias: Array(habitData.frequency).fill('Mon').join(','),
          puntos: habitData.points
        });

        setHabits(prev => prev.map(habit =>
          habit.id === editingHabitId
            ? { ...habit, ...habitData }
            : habit
        ));
        toast.success('Hábito actualizado correctamente');
      } else {
        const today = new Date().toISOString().split('T')[0];
        const newHabit = await api.habits.create({
          nombre: habitData.name,
          descripcion: habitData.description,
          categoria: habitData.category,
          dias: Array(habitData.frequency).fill('Mon').join(','),
          puntos: habitData.points,
          fecha: today,
          estado: 'pendiente'
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
        toast.success('¡Hábito creado exitosamente!');
      }
      setCurrentScreen('habits');
    } catch (error: any) {
      console.error('Error saving habit:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al guardar el hábito';
      toast.error(errorMessage);
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

  const handleDailyGoalUpdate = async (newGoal: number) => {
    try {
      const { perfil } = await api.user.updateDailyGoal(newGoal);
      setUserProfile(prev => ({
        ...prev,
        dailyGoal: perfil.meta_diaria,
      }));
      toast.success('Meta diaria actualizada');
    } catch (error) {
      console.error('Error updating daily goal:', error);
      toast.error('Error al actualizar la meta diaria');
    }
  };

  const handleToggleHabitComplete = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompletedToday = habit.completedDates.includes(today);
    const newStatus = isCompletedToday ? 'pendiente' : 'completado';

    try {
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

      await api.habits.update(parseInt(habitId), { estado: newStatus });

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
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const backendUpdates: any = {};

      if (updates.name || updates.email) {
        backendUpdates.user = {};
        if (updates.name) backendUpdates.user.username = updates.name;
        if (updates.email) backendUpdates.user.email = updates.email;
      }

      if (updates.bio !== undefined || updates.avatar !== undefined) {
        backendUpdates.perfil = {};
        if (updates.bio !== undefined) backendUpdates.perfil.biografia = updates.bio;
        if (updates.avatar !== undefined) backendUpdates.perfil.avatar_url = updates.avatar;
      }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

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
            onDailyGoalUpdate={handleDailyGoalUpdate}
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
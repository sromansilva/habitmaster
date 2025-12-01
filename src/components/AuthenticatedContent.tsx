import { useEffect, useRef } from 'react';
import { Navigation } from './Navigation';
import { Dashboard } from './Dashboard';
import { MyHabits } from './MyHabits';
import { HabitForm } from './HabitForm';
import { ProgressTracker } from './ProgressTracker';
import { Ranking } from './Ranking';
import { UserProfile as UserProfileComponent } from './UserProfile';
import { Achievements } from './Achievements';
import { Settings } from './Settings';
import { useNotifications } from '../contexts/NotificationContext';
import type { Screen, Habit, UserProfile } from '../types';

interface AuthenticatedContentProps {
  currentScreen: Screen;
  habits: Habit[];
  userProfile: UserProfile;
  darkMode: boolean;
  pushNotifications: boolean;
  preferences: any;
  editingHabitId: string | null;
  onNavigate: (screen: Screen) => void;
  onCreateHabit: () => void;
  onEditHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onSaveHabit: (habitData: any) => void;
  onToggleComplete: (habitId: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onUpdatePreferences: (updates: any) => void;
  onDarkModeChange: (value: boolean) => void;
  onPushNotificationsChange: (value: boolean) => void;
  onLogout: () => void;
}

export function AuthenticatedContent({
  currentScreen,
  habits,
  userProfile,
  darkMode,
  pushNotifications,
  preferences,
  editingHabitId,
  onNavigate,
  onCreateHabit,
  onEditHabit,
  onDeleteHabit,
  onSaveHabit,
  onToggleComplete,
  onUpdateProfile,
  onUpdatePreferences,
  onDarkModeChange,
  onPushNotificationsChange,
  onLogout,
}: AuthenticatedContentProps) {
  const { showNotification } = useNotifications();
  const previousLevel = useRef(userProfile.level);

  // Detectar cambio de nivel y mostrar notificación
  useEffect(() => {
    if (userProfile.level > previousLevel.current) {
      showNotification('level-up', `¡Felicidades! Has alcanzado el nivel ${userProfile.level}`);
    }
    previousLevel.current = userProfile.level;
  }, [userProfile.level, showNotification]);

  return (
    <div className="flex min-h-screen">
      <Navigation currentScreen={currentScreen} onNavigate={onNavigate} />
      <main className="flex-1 w-full md:ml-64 pb-20 md:pb-0">
        {currentScreen === 'dashboard' && <Dashboard habits={habits} userProfile={userProfile} onNavigate={onNavigate} />}
        {currentScreen === 'habits' && (
          <MyHabits
            habits={habits}
            onCreateHabit={onCreateHabit}
            onEditHabit={onEditHabit}
            onDeleteHabit={onDeleteHabit}
          />
        )}
        {currentScreen === 'habit-form' && (
          <HabitForm
            habitId={editingHabitId}
            existingHabit={habits.find(h => h.id === editingHabitId)}
            onSave={onSaveHabit}
            onBack={() => onNavigate('habits')}
          />
        )}
        {currentScreen === 'progress' && (
          <ProgressTracker
            habits={habits}
            onToggleComplete={onToggleComplete}
          />
        )}
        {currentScreen === 'ranking' && <Ranking habits={habits} userProfile={userProfile} />}
        {currentScreen === 'profile' && (
          <UserProfileComponent
            userProfile={userProfile}
            habits={habits}
            onUpdateProfile={onUpdateProfile}
          />
        )}
        {currentScreen === 'achievements' && <Achievements habits={habits} userProfile={userProfile} />}
        {currentScreen === 'settings' && (
          <Settings
            darkMode={darkMode}
            onDarkModeChange={onDarkModeChange}
            pushNotifications={pushNotifications}
            onPushNotificationsChange={onPushNotificationsChange}
            preferences={preferences}
            onUpdatePreferences={onUpdatePreferences}
            onLogout={onLogout}
            userProfile={userProfile}
            habits={habits}
          />
        )}
      </main>
    </div>
  );
}

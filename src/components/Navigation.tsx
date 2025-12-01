import { Button } from './ui/button';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Trophy,
  User,
  Award,
  Settings as SettingsIcon
} from 'lucide-react';
import type { Screen } from '../types';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - Navegación del cliente (React Router o similar)
 * - URLs sugeridas:
 *   - /dashboard
 *   - /habits
 *   - /progress
 *   - /ranking
 *   - /profile
 *   - /achievements
 *   - /settings
 */

const navItems = [
  { screen: 'dashboard' as Screen, label: 'Dashboard', icon: LayoutDashboard },
  { screen: 'habits' as Screen, label: 'Mis Hábitos', icon: Target },
  { screen: 'progress' as Screen, label: 'Progreso', icon: CheckSquare },
  { screen: 'ranking' as Screen, label: 'Ranking', icon: Trophy },
  { screen: 'achievements' as Screen, label: 'Logros', icon: Award },
  { screen: 'profile' as Screen, label: 'Perfil', icon: User },
  { screen: 'settings' as Screen, label: 'Ajustes', icon: SettingsIcon },
];

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800 border-r border-neutral-200 dark:border-slate-700 p-4 flex-col z-40">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="text-neutral-900 dark:text-white truncate">HabitMaster</span>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;

            return (
              <Button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 nav-item ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50' : 'text-neutral-600 dark:text-neutral-300 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-neutral-200 dark:border-slate-700 px-2 py-2 z-50 safe-area-bottom">
        <div className="flex justify-around items-center max-w-screen-sm mx-auto">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;

            return (
              <Button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-2 nav-item-mobile flex-1 max-w-[80px] ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-300'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs truncate w-full text-center">{item.label.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
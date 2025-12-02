import { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { Trophy, TrendingUp, Zap, Plus, Trash2, CheckCircle2, Award } from 'lucide-react';

interface NotificationContextType {
  pushNotificationsEnabled: boolean;
  showNotification: (type: NotificationType, message: string) => void;
}

export type NotificationType =
  | 'achievement'
  | 'ranking-up'
  | 'level-up'
  | 'habit-created'
  | 'habit-deleted'
  | 'all-completed'
  | 'success'
  | 'info';

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
  pushNotificationsEnabled: boolean;
}

export function NotificationProvider({ children, pushNotificationsEnabled }: NotificationProviderProps) {
  const showNotification = (type: NotificationType, message: string) => {
    // Solo mostrar si las notificaciones están habilitadas
    if (!pushNotificationsEnabled) return;

    // Configurar ícono y estilo según el tipo
    let icon: ReactNode;

    switch (type) {
      case 'achievement':
        icon = <Trophy className="w-5 h-5 text-yellow-500" />;
        break;
      case 'ranking-up':
        icon = <TrendingUp className="w-5 h-5 text-blue-500" />;
        break;
      case 'level-up':
        icon = <Zap className="w-5 h-5 text-purple-500" />;
        break;
      case 'habit-created':
        icon = <Plus className="w-5 h-5 text-green-500" />;
        break;
      case 'habit-deleted':
        icon = <Trash2 className="w-5 h-5 text-red-500" />;
        break;
      case 'all-completed':
        icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
        break;
      case 'success':
        icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
        break;
      default:
        icon = <Award className="w-5 h-5 text-blue-500" />;
    }

    // Mostrar toast con ícono personalizado
    toast(message, {
      icon: icon,
      duration: 4000,
      position: 'bottom-center',
      className: 'toast-notification',
    });
  };

  return (
    <NotificationContext.Provider value={{ pushNotificationsEnabled, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

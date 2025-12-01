import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import type { Habit } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

interface ProgressTrackerProps {
  habits: Habit[];
  onToggleComplete: (habitId: string) => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/habits/today/ - Lista de hábitos para hoy
 * - POST /api/habit-logs/ - Registrar completado de hábito
 * - Modelo HabitLog:
 *   - id, habit_id, user_id, fecha, completado (Boolean)
 *   - puntos_ganados (IntegerField)
 * 
 * Lógica de backend:
 * - Al marcar como completado:
 *   1. Crear HabitLog con fecha de hoy
 *   2. Sumar puntos al Profile del usuario
 *   3. Actualizar racha si corresponde
 *   4. Verificar si se desbloquean logros
 * - No permitir duplicados (un HabitLog por hábito por día)
 * - Calcular progreso diario: completados / total del día
 */

export function ProgressTracker({ habits, onToggleComplete }: ProgressTrackerProps) {
  const { showNotification } = useNotifications();
  const today = new Date().toISOString().split('T')[0];

  // Verificar si cada hábito está completado hoy
  const habitsWithStatus = habits.map(habit => ({
    ...habit,
    completedToday: habit.completedDates.includes(today)
  }));

  const totalCount = habitsWithStatus.length;
  const completedCount = habitsWithStatus.filter(h => h.completedToday).length;
  const totalPointsToday = habitsWithStatus
    .filter(h => h.completedToday)
    .reduce((acc, h) => acc + h.points, 0);
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggleHabit = (habitId: string) => {
    // Backend: POST /api/habit-logs/ o DELETE
    const habit = habitsWithStatus.find(h => h.id === habitId);
    const wasCompletedBefore = habit?.completedToday || false;

    onToggleComplete(habitId);

    // Verificar si se completaron todos los hábitos del día después del toggle
    // Solo notificar si estamos marcando como completado (no desmarcando)
    if (!wasCompletedBefore && totalCount > 0 && completedCount === totalCount - 1) {
      // Este era el último hábito por completar
      setTimeout(() => {
        showNotification('all-completed', '¡Felicidades! Has completado todos tus hábitos del día 🎉');
      }, 300);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-neutral-900 dark:text-white mb-2">Registrar Progreso</h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Marca los hábitos que has completado hoy
          </p>
        </div>

        {/* Daily Progress Summary */}
        <Card className="card-daily-summary mb-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-0 dark:bg-neutral-800 dark:border-neutral-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-1">Progreso del día</p>
                <p className="text-neutral-900 dark:text-white">
                  {completedCount} de {totalCount} hábitos
                </p>
              </div>
              <div className="text-right">
                <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-1">Puntos ganados hoy</p>
                <p className="text-blue-600 dark:text-blue-400">+{totalPointsToday} pts</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />

            {progressPercentage === 100 && (
              <Alert className="alert-success mt-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
                  ¡Felicidades! Has completado todos tus hábitos del día 🎉
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Date Display */}
        <div className="flex items-center gap-2 mb-6 text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
          <Calendar className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habitsWithStatus.map((habit) => (
            <Card
              key={habit.id}
              className={`habit-item-tracker transition-all ${habit.completedToday
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                  : 'hover:shadow-md dark:bg-neutral-800 dark:border-neutral-700'
                }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Toggle Switch */}
                  <div className="flex-shrink-0">
                    <Switch
                      checked={habit.completedToday}
                      onCheckedChange={() => handleToggleHabit(habit.id)}
                      className="switch-habit"
                    />
                  </div>

                  {/* Habit Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3
                        className={`truncate ${habit.completedToday ? 'line-through text-neutral-500 dark:text-neutral-400' : 'text-neutral-900 dark:text-white'
                          }`}
                      >
                        {habit.name}
                      </h3>
                      <Badge variant="secondary" className="badge-category text-xs flex-shrink-0 dark:bg-neutral-700 dark:text-neutral-200">
                        {habit.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 flex-shrink-0" />
                        <span>{habit.streak} días de racha</span>
                      </div>
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div className="flex-shrink-0">
                    <Badge
                      variant={habit.completedToday ? "default" : "outline"}
                      className={`badge-points text-xs ${habit.completedToday
                          ? 'bg-green-600 dark:bg-green-700'
                          : 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                        }`}
                    >
                      +{habit.points} pts
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button (Optional - puede ser auto-save) */}
        <Card className="card-motivation mt-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 dark:bg-neutral-800">
          <CardContent className="p-4 sm:p-6 text-center space-y-3">
            <div className="text-3xl sm:text-4xl">💪</div>
            <h3 className="text-neutral-900 dark:text-white">¡Sigue así!</h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
              {completedCount === 0
                ? 'Completa tu primer hábito del día para comenzar'
                : completedCount === totalCount
                  ? '¡Día perfecto! Todos los hábitos completados'
                  : `Te faltan ${totalCount - completedCount} hábitos para completar el día`}
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Alert className="alert-info mt-6 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
          <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
            <strong>Consejo:</strong> Los cambios se guardan automáticamente. Puedes volver más tarde y seguir marcando hábitos completados.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
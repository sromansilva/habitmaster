import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Plus, Edit2, Trash2, Target, Calendar, TrendingUp } from 'lucide-react';
import type { Habit } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

interface MyHabitsProps {
  habits: Habit[];
  onCreateHabit: () => void;
  onEditHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/habits/ - Lista de hábitos del usuario autenticado
 * - DELETE /api/habits/{id}/ - Eliminar hábito
 * - Campos de Habit:
 *   - id, user_id, nombre, descripcion, frecuencia_semanal
 *   - fecha_creacion, activo
 * - Calcular progreso desde HabitLog:
 *   - Porcentaje = (completados_esta_semana / frecuencia_semanal) * 100
 *   - Últimos días completados desde HabitLog
 * - Ordenar por: creación reciente o progreso
 */

export function MyHabits({ habits, onCreateHabit, onEditHabit, onDeleteHabit }: MyHabitsProps) {
  const { showNotification } = useNotifications();

  const handleDeleteHabit = (habitId: string) => {
    // Backend: DELETE /api/habits/{habitId}/
    const habit = habits.find(h => h.id === habitId);
    console.log('Delete habit:', habitId);
    onDeleteHabit(habitId);

    // Notificar eliminación
    if (habit) {
      showNotification('habit-deleted', `Hábito "${habit.name}" eliminado`);
    }
  };

  const handleCreateHabit = () => {
    onCreateHabit();
  };

  // Función para obtener el inicio de la semana actual (lunes)
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes como primer día
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  // Calcular cuántos días de esta semana se completó cada hábito
  const getWeeklyCompletedCount = (habit: Habit) => {
    const weekStart = getWeekStart();
    return habit.completedDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= weekStart;
    }).length;
  };

  // Calcular progreso semanal total
  const totalWeeklyCompleted = habits.reduce((acc, h) => acc + getWeeklyCompletedCount(h), 0);
  const totalWeeklyTarget = habits.reduce((acc, h) => acc + h.frequency, 0);
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-neutral-900 dark:text-white mb-2">Mis Hábitos</h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Gestiona tus hábitos y monitorea tu progreso semanal
            </p>
          </div>
          <Button onClick={handleCreateHabit} className="btn-primary gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Crear Hábito
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card className="card-stat-small dark:bg-neutral-800 dark:border-neutral-700">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm">Total de hábitos</p>
                <p className="text-neutral-900 dark:text-white truncate">{habits.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat-small dark:bg-neutral-800 dark:border-neutral-700">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm">Activos hoy</p>
                <p className="text-neutral-900 dark:text-white truncate">
                  {habits.filter(h => h.frequency === 7).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat-small dark:bg-neutral-800 dark:border-neutral-700">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm">Progreso semanal</p>
                <p className="text-neutral-900 dark:text-white truncate">
                  {totalWeeklyCompleted}/{totalWeeklyTarget}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Habits List */}
        <div className="grid gap-4">
          {habits.map((habit) => {
            const weeklyCompleted = getWeeklyCompletedCount(habit);
            const progressPercentage = (weeklyCompleted / habit.frequency) * 100;
            const isOnTrack = progressPercentage >= 70;

            return (
              <Card key={habit.id} className="card-habit hover:shadow-md transition-shadow dark:bg-neutral-800 dark:border-neutral-700">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-neutral-900 dark:text-white truncate">{habit.name}</h3>
                          <Badge variant="secondary" className="badge-category text-xs flex-shrink-0 dark:bg-neutral-700 dark:text-neutral-200">
                            {habit.category}
                          </Badge>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm line-clamp-2">{habit.description}</p>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                          onClick={() => onEditHabit(habit.id)}
                          variant="ghost"
                          size="sm"
                          className="btn-icon-edit h-8 w-8 p-0 dark:hover:bg-neutral-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteHabit(habit.id)}
                          variant="ghost"
                          size="sm"
                          className="btn-icon-delete text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-300 truncate">
                          Progreso semanal: {weeklyCompleted}/{habit.frequency}
                        </span>
                        <span className={`flex-shrink-0 ml-2 ${isOnTrack ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{habit.frequency}x/semana</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <TrendingUp className="w-4 h-4 flex-shrink-0" />
                        <span>{habit.streak} días</span>
                      </div>
                      {habit.lastCompleted && (
                        <div className="hidden sm:flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                          <Target className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            Última: {new Date(habit.lastCompleted).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    {progressPercentage === 100 && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="text-lg sm:text-xl">✅</div>
                        <p className="text-green-800 dark:text-green-300 text-xs sm:text-sm">
                          ¡Meta semanal alcanzada!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {habits.length === 0 && (
          <Card className="card-empty-state border-2 border-dashed dark:bg-neutral-800 dark:border-neutral-700">
            <CardContent className="p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-neutral-900 dark:text-white mb-2">No tienes hábitos aún</h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Crea tu primer hábito para comenzar tu viaje de mejora personal
                </p>
                <Button onClick={handleCreateHabit} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />
                  Crear mi primer hábito
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}